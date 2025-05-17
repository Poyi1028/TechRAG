from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from chatbot import rag_chain

app = FastAPI(
    title="TechRAG API",
    description="TechRAG 聊天機器人 API",
    version="1.0.0"
)

# 請求模型
class ChatRequest(BaseModel):
    question: str
    history: str = ""  # 可選的歷史記錄
    previous_docs_for_followup: Optional[List[dict]] = None  # 可選的前一次對話的文件

# 回應模型
class Source(BaseModel):
    article_title: str
    article_url: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[Source]

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    與 TechRAG 聊天機器人互動
    
    - **question**: 使用者的問題
    - **history**: 對話歷史記錄（可選）
    - **previous_docs_for_followup**: 前一次對話的文件（可選）
    
    返回：
    - **answer**: 聊天機器人的回答
    - **sources**: 回答中引用的來源文章列表
    """
    try:
        # 準備 RAG chain 的輸入
        rag_input = {
            "question": request.question,
            "history": request.history,
            "previous_docs_for_followup": request.previous_docs_for_followup or []
        }
        
        # 調用 RAG chain
        result = rag_chain.invoke(rag_input)
        
        # 構建回應
        response = ChatResponse(
            answer=result.get("answer", "Server doesn't respond."),
            sources=result.get("sources", [])
        )
        
        return response
        
    except Exception as e:
        return ChatResponse(
            answer=f"發生錯誤：{str(e)}",
            sources=[]
        )

@app.get("/")
async def root():
    """
    API 健康檢查端點
    """
    return {"status": "ok", "message": "TechRAG API is running"}