package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/gin-gonic/gin"
)

// 對應整體回應
type EventResponse struct {
	Events struct {
		Results []Event `json:"results"`
	} `json:"events"`
}

type Event struct {
	URI     string            `json:"uri"`
	Stories []Story           `json:"stories"`
	Summary map[string]string `json:"summary"`
}

type Story struct {
	URI           string  `json:"uri"`
	Lang          string  `json:"lang"`
	MedoidArticle Article `json:"medoidArticle"`
}

// 對應抓取的單篇文章
type Article struct {
	URI     string            `json:"uri"`
	Date    string            `json:"date"`
	Title   string            `json:"title"`
	Body    string            `json:"body"`
	URL     string            `json:"url"`
	Source  Source            `json:"source"`
	Image   string            `json:"image"`
	Summary map[string]string `json:"summary"`
}

// 對應文章來源
type Source struct {
	URI   string `json:"uri"`
	Title string `json:"title"`
}

// 抓取文章資訊主要功能
func fetch(c *gin.Context) {
	// 是否有 API KEY
	apiKey := os.Getenv("EVENT_REGISTRY_API")
	if apiKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "EVENT_REGISTRY_API 環境變數未設定"})
		return
	}

	q := url.Values{}

	// 定義查詢參數
	params := map[string]string{
		"apiKey":                    apiKey,
		"lang":                      "eng",
		"eventsCount":               "50",
		"eventsPage":                "1",
		"categoryUri":               "dmoz/Computers/Artificial_Intelligence",
		"includeEventStories":       "true",
		"includeStoryMedoidArticle": "true",
		"isDuplicateFilter":         "skipDuplicates",
	}

	// 構建查詢字串
	for key, value := range params {
		q.Add(key, value)
	}

	// 建立請求
	req, err := http.NewRequest("GET", "http://eventregistry.org/api/v1/event/getEvents", nil)
	if err != nil {
		log.Printf("建立請求失敗: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 為請求附加查詢字串
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

	var er EventResponse
	if err := json.NewDecoder(resp.Body).Decode(&er); err != nil {
		log.Printf("解析回應失敗: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "解析回應失敗: " + err.Error()})
		return
	}

	log.Printf("成功解析回應，找到 %d 個事件", len(er.Events.Results))

	// 抓取資料庫連線，若沒有抓取到 db 的值則終止程序
	db, ok := c.MustGet("db").(*sql.DB)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "無法取得資料庫連線"})
		return
	}

	// 將抓取的事件萃取出文章並存入資料庫
	var articles []Article
	for _, event := range er.Events.Results {
		for _, story := range event.Stories {
			article := story.MedoidArticle
			if event.Summary != nil {
				article.Summary = event.Summary
			}
			if story.Lang == "eng" {
				articles = append(articles, article)
			}
		}
	}

	err = saveArticlesToDB(articles, db)
	if err != nil {
		log.Printf("保存文章到資料庫失敗: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("保存文章到資料庫失敗: %v", err)})
		return
	}

	// 存入成功則回傳訊息
	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("成功抓取並保存 %d 篇文章", len(articles)),
	})
}
