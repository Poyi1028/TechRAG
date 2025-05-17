package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// ChatRequest 結構體，對應 FastAPI 的請求格式
type ChatRequest struct {
	Question                string        `json:"question"`
	History                 string        `json:"history"`
	PreviousDocsForFollowup []interface{} `json:"previous_docs_for_followup,omitempty"`
}

// ArticleSource 結構體，對應 FastAPI 的回應中的來源部分
type ArticleSource struct {
	ArticleTitle string `json:"article_title"`
	ArticleURL   string `json:"article_url"`
}

// ChatResponse 結構體，對應 FastAPI 的回應格式
type ChatResponse struct {
	Answer  string          `json:"answer"`
	Sources []ArticleSource `json:"sources"`
	RawDocs []interface{}   `json:"raw_docs,omitempty"` // 存儲原始文件用於下次請求
}

// 初始化聊天路由
func initChatRoutes(router *gin.Engine) {
	router.POST("/api/chat", handleChatRequest)
}

// 處理聊天請求的函數
func handleChatRequest(c *gin.Context) {
	// 從請求中解析聊天請求
	var request ChatRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "無效的請求格式", "details": err.Error()})
		return
	}

	// 將請求序列化為 JSON
	requestBody, err := json.Marshal(request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "序列化請求失敗", "details": err.Error()})
		return
	}

	// 從環境變數讀取 RAG 引擎的位址，如果未設定則預設為本地開發位址
	ragEngineURL := os.Getenv("RAG_ENGINE_URL")
	if ragEngineURL == "" {
		ragEngineURL = "http://localhost:8000/chat" // 本地開發預設值
	}

	// 創建一個 HTTP 請求到 FastAPI 服務
	req, err := http.NewRequest("POST", ragEngineURL, bytes.NewBuffer(requestBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "創建 HTTP 請求失敗", "details": err.Error()})
		return
	}
	req.Header.Set("Content-Type", "application/json")

	// 發送請求到 FastAPI 服務
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "發送請求到聊天服務失敗", "details": err.Error()})
		return
	}
	defer resp.Body.Close()

	// 讀取回應內容
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "讀取回應失敗", "details": err.Error()})
		return
	}

	// 如果回應不是 200 OK，返回錯誤
	if resp.StatusCode != http.StatusOK {
		c.JSON(resp.StatusCode, gin.H{"error": "聊天服務返回錯誤", "details": string(respBody)})
		return
	}

	// 解析 FastAPI 的回應
	var chatResponse ChatResponse
	if err := json.Unmarshal(respBody, &chatResponse); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "解析回應失敗", "details": err.Error()})
		return
	}

	// 將回應返回給客戶端
	c.JSON(http.StatusOK, chatResponse)
}
