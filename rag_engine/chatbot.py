import os
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableParallel, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from datetime import date
from langchain_core.documents import Document
from qdrant_client.http.models import Filter, FieldCondition, MatchAny

# --- 讀取環境變數 ---
load_dotenv()

# --- 設定 API 金鑰 ---
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise ValueError("GROQ_API_KEY is not set")

# --- 設定模型 ---
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
GROQ_MODEL = "llama3-70b-8192"

# --- 1. 載入嵌入模型 ---
print(f"Loading embedding model: {EMBEDDING_MODEL}")
embedding = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

# --- 2. 連接 Qdrant ---
print(f"Connecting to Qdrant")
client = QdrantClient(host="localhost", port=6333)

# --- 3. 初始化 Qdrant Vector Store ---
print(f"Initializing QdrantVectorStore")
vector_store = QdrantVectorStore(
    client=client,
    collection_name="rag_collection",
    embedding=embedding,
    content_payload_key='chunk_content'
)

# --- 4. 建立 Retriever ---
retriever = vector_store.as_retriever(search_kwargs={"k": 3}) # 檢索最相關的 3 個區塊

# --- 5. 初始化 Groq 模型 ---
print(f"Initializing Groq model: {GROQ_MODEL}")
llm = ChatGroq(
    temperature=0.5, # 控制生成內容的隨機性
    model_name=GROQ_MODEL,
    groq_api_key=groq_api_key
)

# --- 6. 建立 Prompt Template ---
today_str = date.today().strftime("%Y-%m-%d") # 取得當前日期

template = """
Today is {today_str}.
Please provide a concise and informative answer based on the following news content and conversation history.
Focus on the key points and avoid unnecessary filler.
If you cannot find any answer in the content for the current question, please directly say "No similar news found for the current question based on the provided news".
You can use some emojis to make the answer more engaging.

Role:
You are TechMate, a helpful assistant that can answer questions about technology news.

Conversation History:
{history}

News content:
{context}

Current Question:
{question}

Answer:
"""
prompt = ChatPromptTemplate.from_template(template)

# 建立擴展檢索函數
def retrieve_expanded_context(question: str, history: str, previous_docs: list[Document] | None, retriever, client: QdrantClient, collection_name: str):
    # 簡單的啟發式方法來檢測是否為通用追問
    generic_follow_up_phrases = [
        "tell me more",
        "details of the article",
        "more about that",
        "what about that",
        "can you elaborate",
        "explain further",
        "what are the details" # 新增更明確的追問詞
    ]
    is_generic_follow_up = any(phrase in question.lower() for phrase in generic_follow_up_phrases)

    if is_generic_follow_up and previous_docs:
        print("--- Using previous docs for follow-up query ---")
        return previous_docs

    print("--- Running Expanded Retrieval for new query or specific follow-up ---")
    initial_docs = retriever.invoke(question)

    if not initial_docs:
        return []

    # 2. 提取文章 URI
    initial_uris = set()
    processed_docs = {}
    for doc in initial_docs:
        if hasattr(doc, "metadata") and doc.metadata:
            uri = doc.metadata.get("article_url")
            doc_id = doc.metadata.get("_id") # Qdrant 的內部 ID
            if uri:
                initial_uris.add(uri)
            if doc_id:
                processed_docs[doc_id] = doc
    
    # 3. 擴展檢索
    if initial_uris:
        scroll_filter = Filter(
            must=[
                FieldCondition(
                    key="metadata.article_uri",
                    match=MatchAny(any=list(initial_uris))
                )
            ]
        )

        try:
            scrolled_results, _ = client.scroll(
                collection_name=collection_name,
                scroll_filter=scroll_filter,
                limit=1000, 
                with_payload=True,
                with_vectors=False
            )

            # 處理滾動結果
            for result in scrolled_results:
                doc_id = result.id
                if doc_id not in processed_docs:
                    metadata = result.payload.get("metadata", {})
                    metadata["_id"] = doc_id
                    metadata["_collection_name"] = collection_name
                    content = result.payload.get("chunk_content", "")
                    processed_docs[doc_id] = Document(
                        page_content=content,
                        metadata=metadata
                    )
        except Exception as e:
            print(f"Error during scroll: {e}")
        
    # 4. 合併與去重 (已在 processed_docs 中完成)
    final_docs = list(processed_docs.values())
    return final_docs

# --- 7. 建立 RAG Chain ---
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# 從文件中提取來源資訊
def get_sources(docs):
    sources = []
    seen_urls = set() # 重新啟用，用來過濾重複的文章 URL
    for doc in docs:
        if hasattr(doc, "metadata") and doc.metadata:
            # print(f"Processing Metadata: {doc.metadata}") # 可以移除或保留調試輸出
            article_url = doc.metadata.get("article_url", "").strip() # 添加 .strip()
            article_title = doc.metadata.get("article_title", "N/A")

            # 檢查 URL 是否存在且未被記錄過
            if article_url and article_url not in seen_urls:
                sources.append({
                    "article_title": article_title,
                    "article_url": article_url
                })
                seen_urls.add(article_url) # 將處理過的 URL 加入 set
    return sources    

# 步驟 1: 準備 RAG 鏈的輸入處理，使其能接收問題和歷史記錄
# 這個 Runnable 會接收一個字典，例如 {"question": "...", "history": "..."}
rag_chain_input_passthrough = RunnablePassthrough()

# 步驟 1b: 檢索文檔，同時保留原始輸入字典
# retrieve_expanded_context 需要 question，所以我們從輸入字典中提取它
rag_docs_and_input = RunnableParallel(
    docs=RunnableLambda(
        lambda x: retrieve_expanded_context(
            question=x["question"], # 直接從 x 獲取 question
            history=x["history"],   # 直接從 x 獲取 history
            previous_docs=x.get("previous_docs_for_followup"), # 直接從 x 安全獲取 previous_docs
            retriever=retriever, 
            client=client, 
            collection_name="rag_collection"
        )
    ), 
    input_dict=RunnablePassthrough() 
)

# 步驟 2: 準備傳遞給 LLM 的內容，包括格式化的 context、問題、歷史和日期
llm_input_preparation = rag_docs_and_input | RunnablePassthrough.assign(
    context=lambda x: format_docs(x["docs"]), 
    question=lambda x: x["input_dict"]["question"],
    history=lambda x: x["input_dict"]["history"],
    today_str=lambda _: today_str
)

# 步驟 3: 構建答案及來源鍊
answer_chain = llm_input_preparation | prompt | llm | StrOutputParser()
source_chain = llm_input_preparation | RunnableLambda(lambda x: get_sources(x["docs"]))

# 步驟 4: 結合答案和來源，並加入原始文檔
rag_chain = RunnableParallel(
    answer=answer_chain,
    sources=source_chain,
    raw_docs=llm_input_preparation | RunnableLambda(lambda x: x["docs"]) # 從 llm_input_preparation 獲取 docs
)

print("RAG chain build successfully")

# --- 8. 測試 RAG chain ---
if __name__ == "__main__":
    print("\n --- Testing RAG chain ---")
    # history 用來存儲格式化後的對話，用於傳遞給 prompt
    history_for_prompt = []
    previous_docs_for_followup = [] # 初始化 previous_docs_for_followup

    while True:
        test_question = input("Enter a question: ")
        if test_question.lower() == "exit":
            break
        
        formatted_history_str = "\n".join(history_for_prompt)

        # 準備 RAG chain 的輸入
        rag_input_payload = {
            "question": test_question, 
            "history": formatted_history_str,
            "previous_docs_for_followup": previous_docs_for_followup # 添加 previous_docs
        }
        
        # 調用 RAG chain
        result = rag_chain.invoke(rag_input_payload)
        
        current_answer = result.get("answer", "N/A")
        print("\nAnswer:")
        print(current_answer)

        # 更新 previous_docs_for_followup 以供下次迭代使用
        # 確保即使 "raw_docs" 為 None 或缺失，也不會出錯
        previous_docs_for_followup = result.get("raw_docs") if result.get("raw_docs") is not None else []

        # 將當前的問答添加到 history_for_prompt 以備下次使用
        history_for_prompt.append(f"User: {test_question}")
        history_for_prompt.append(f"Assistant: {current_answer}")

        # 印出來源
        print("\nSources:")
        sources = result.get("sources", [])
        if sources:
            for source in sources:
                print(f"- Title: {source.get('article_title', 'N/A')}")
                print(f"- URL: {source.get('article_url', '#')}")
        else:
            print("No sources found")
        
    print("\n --- Test Complete ---")
