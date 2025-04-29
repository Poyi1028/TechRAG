package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

// 對應整體回應
type ArticleResponse struct {
	Articles struct {
		Results []Article `json:"results"`
		Total   int       `json:"totalResults"`
		Page    int       `json:"page"`
		Count   int       `json:"count"`
		Pages   int       `json:"pages"`
	} `json:"articles"`
}

// 對應抓取的單篇文章
type Article struct {
	URI         string     `json:"uri"`
	Title       string     `json:"title"`
	Body        string     `json:"body"`
	URL         string     `json:"url"`
	Date        string     `json:"date"`
	DateTimePub string     `json:"dateTimePub"`
	Source      Source     `json:"source"`
	Concepts    []Concept  `json:"concepts"`
	Categories  []Category `json:"categories"`
}

// 對應文章來源
type Source struct {
	URI      string `json:"uri"`
	DataType string `json:"dataType"`
	Title    string `json:"title"`
	Image    string `json:"image"`
}

// 對應文章中的概念
type Concept struct {
	URI   string            `json:"uri"`
	Label map[string]string `json:"label"`
	Score float64           `json:"score"`
}

// 對應文章中的分類
type Category struct {
	URI   string  `json:"uri"`
	Label string  `json:"label"`
	Score float64 `json:"score"`
}

// 抓取文章資訊主要功能
func fetch(c *gin.Context) {
	// 是否有關鍵字
	keyword := c.Query("keyword")
	if keyword == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "keyword 參數為必填"})
		return
	}

	// 是否有 API KEY
	apiKey := os.Getenv("EVENT_REGISTRY_API")
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "EVENT_REGISTRY_API 環境變數未設定"})
		return
	}

	// 建立請求
	req, err := http.NewRequest("GET", "http://eventregistry.org/api/v1/article/getArticles", nil)
	if err != nil {
		log.Printf("建立請求失敗: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 設置請求資訊，並編碼回請求 URL 中
	q := req.URL.Query()
	q.Add("apiKey", apiKey)
	q.Add("action", "getArticles")
	q.Add("keyword", keyword)
	q.Add("lang", "eng")
	q.Add("count", "10")
	q.Add("includeArticleConcepts", "true")
	q.Add("includeArticleCategories", "true")
	q.Add("isDuplicateFilter", "skipDuplicates")
	req.URL.RawQuery = q.Encode()

	log.Printf("發送請求到: %s", req.URL.String())

	// 發送請求
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		log.Printf("HTTP 請求失敗: %v", err)
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}
	// 函數結束時關閉響應主體釋放資源
	defer resp.Body.Close()

	log.Printf("API 回應狀態碼: %d", resp.StatusCode)

	if resp.StatusCode != http.StatusOK {
		// 讀取錯誤回應內容
		body, _ := io.ReadAll(resp.Body)
		log.Printf("API 錯誤回應: %s", string(body))
		c.JSON(resp.StatusCode, gin.H{"error": fmt.Sprintf("API 取得資料失敗，狀態碼: %d", resp.StatusCode), "response": string(body)})
		return
	}

	var ar ArticleResponse
	if err := json.NewDecoder(resp.Body).Decode(&ar); err != nil {
		log.Printf("解析回應失敗: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "解析回應失敗: " + err.Error()})
		return
	}

	log.Printf("成功解析回應，找到 %d 篇文章", len(ar.Articles.Results))

	// 抓取資料庫連線，若沒有抓取到 db 的值則終止程序
	db, ok := c.MustGet("db").(*sql.DB)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "無法取得資料庫連線"})
		return
	}

	// 將抓取的文章存入資料庫
	err = saveArticlesToDB(ar.Articles.Results, db)
	if err != nil {
		log.Printf("保存文章到資料庫失敗: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("保存文章到資料庫失敗: %v", err)})
		return
	}

	// 存入成功則回傳訊息
	c.JSON(http.StatusOK, gin.H{
		"message":  fmt.Sprintf("成功抓取並保存 %d 篇文章", len(ar.Articles.Results)),
		"articles": ar.Articles.Results,
	})
}
