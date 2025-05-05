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

# --- 讀取環境變數 ---
load_dotenv()

# --- 設定 API 金鑰 ---
groq_api_key = os.getenv("GROQ_API_KEY")
if not groq_api_key:
    raise ValueError("GROQ_API_KEY is not set")

# --- 設定模型 ---
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

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
    embedding=embedding
)

# --- 4. 建立 Retriever ---
retriever = vector_store.as_retriever(search_kwargs={"k": 3}) # 檢索最相關的 3 個區塊

# --- 5. 初始化 Groq 模型 ---
print(f"Initializing Groq model: {GROQ_MODEL}")
llm = ChatGroq(
    temperature=0,
    model_name=GROQ_MODEL,
    groq_api_key=groq_api_key
)

# --- 6. 建立 Prompt Template ---
today_str = date.today().strftime("%Y-%m-%d") # 取得當前日期

template = """
Today is {today_str}. Please answer the question based on the following news content.
If you cannot find the answer in the content, please directly say "No similar news found".
Do not make up any information.

News content:
{context}

Question:
{question}

Answer:
"""
prompt = ChatPromptTemplate.from_template(template)

# --- 7. 建立 RAG Chain ---
def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

# 從文件中提取來源資訊
def get_sources(docs):
    sources = []
    seen_urls = set() # 用來過濾重複來源
    for doc in docs:
        if hasattr(doc, "metadata") and doc.metadata:
            url = doc.metadata.get("article_url")
            # 確保 url 存在且未被記錄
            if url and url not in seen_urls:
                # 從 metadata 中提取資料
                sources.append({
                    "title": doc.metadata.get("article_title", "N/A"),
                    "url": url
                })
                seen_urls.add(url)
    return sources

# 步驟 1: 並行執行檢索和傳遞問題
rag_and_metadata = RunnableParallel(
    {"docs": retriever, "question": RunnablePassthrough()}
)

# 步驟 2: 準備傳遞給 LLM 的內容
rag_input = rag_and_metadata | RunnablePassthrough.assign(
    context=(lambda x: format_docs(x["docs"])), # 從 docs 生成 context
    question=lambda x: x["question"],
    today_str=lambda _: today_str  # 添加 today_str 到 prompt 輸入
)

# 步驟 3: 構建答案及來源鍊
answer_chain = prompt | llm | StrOutputParser()
source_chain = lambda x: get_sources(x["docs"])

# 步驟 4: 結合答案和來源
rag_chain = rag_input | RunnableParallel(
    answer=answer_chain,
    sources=source_chain
)

print("RAG chain build successfully")

# --- 8. 測試 RAG chain ---
if __name__ == "__main__":
    print("\n --- Testing RAG chain ---")
    test_question = "Can you tell me the latest news about OpenAI?"
    print(f"Question: {test_question}")

    try:
        # invoke 會回傳包含 answer 和 sources 的字典
        result = rag_chain.invoke(test_question)
        print("\nAnswer:")
        print(result.get("answer", "N/A")) # 印出答案

        print("\nSources:")
        sources = result.get("sources", []) # 印出來源
        if sources:
            for source in sources:
                print(f"- Title: {source.get('title', 'N/A')}")
                print(f"- URL: {source.get('url', '#')}")
        else:
            print("No sources found")

    except Exception as e:
        print(f"\n An error occuerred: {e}")

    print("\n --- Test Complete ---")
