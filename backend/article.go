package main

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// ArticleResponse 表示API回傳的文章結構
type ArticleResponse struct {
	URI         string    `json:"uri"`
	Title       string    `json:"title"`
	Content     string    `json:"content"`
	Summary     string    `json:"summary"`
	URL         string    `json:"url"`
	PublishedAt time.Time `json:"published_at"`
	SourceURI   string    `json:"source_uri"`
	SourceTitle string    `json:"source_title"`
	Image       string    `json:"image"`
}

// GetArticles 處理獲取文章列表的請求
func getArticles(c *gin.Context) {
	// 從上下文中獲取資料庫連線
	db, ok := c.MustGet("db").(*sql.DB)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "無法取得資料庫連線"})
		return
	}

	// 獲取分頁參數，默認第 1 頁，每頁 6 條
	page := 1
	pageSize := 6

	if pageStr := c.Query("page"); pageStr != "" {
		if pageNum, err := strconv.Atoi(pageStr); err == nil && pageNum > 0 {
			page = pageNum
		}
	}

	if sizeStr := c.Query("size"); sizeStr != "" {
		if sizeNum, err := strconv.Atoi(sizeStr); err == nil && sizeNum > 0 {
			pageSize = sizeNum
		}
	}

	// 計算偏移量
	offset := (page - 1) * pageSize

	// 查詢文章總數
	var total int
	err := db.QueryRow("SELECT COUNT(*) FROM articles").Scan(&total)
	if err != nil {
		log.Printf("查詢文章總數失敗: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查詢文章總數失敗"})
		return
	}

	// 查詢文章列表
	rows, err := db.Query(`
		SELECT uri, title, content, summary, url, published_at, source_uri, source_title, image
		FROM articles
		ORDER BY published_at DESC
		LIMIT $1 OFFSET $2
	`, pageSize, offset)
	if err != nil {
		log.Printf("查詢文章列表失敗: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查詢文章列表失敗"})
		return
	}
	defer rows.Close()

	// 處理查詢結果
	var articles []ArticleResponse
	for rows.Next() {
		var article ArticleResponse
		err := rows.Scan(
			&article.URI,
			&article.Title,
			&article.Content,
			&article.Summary,
			&article.URL,
			&article.PublishedAt,
			&article.SourceURI,
			&article.SourceTitle,
			&article.Image,
		)
		if err != nil {
			log.Printf("掃描文章行失敗: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "處理文章數據失敗"})
			return
		}
		articles = append(articles, article)
	}

	// 檢查是否發生迭代錯誤
	if err := rows.Err(); err != nil {
		log.Printf("迭代文章行失敗: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "處理文章數據失敗"})
		return
	}

	// 返回文章列表和分頁信息
	c.JSON(http.StatusOK, gin.H{
		"data": articles,
		"pagination": gin.H{
			"total":     total,
			"page":      page,
			"page_size": pageSize,
			"pages":     (total + pageSize - 1) / pageSize,
		},
	})
}

// GetArticleByURI 處理通過URI獲取單個文章的請求
func getArticleByURI(c *gin.Context) {
	// 從上下文中獲取資料庫連線
	db, ok := c.MustGet("db").(*sql.DB)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "無法取得資料庫連線"})
		return
	}

	// 獲取URI參數
	uri := c.Param("uri")
	if uri == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "未提供文章URI"})
		return
	}

	// 查詢文章
	var article ArticleResponse
	err := db.QueryRow(`
		SELECT uri, title, content, summary, url, published_at, source_uri, source_title, image
		FROM articles
		WHERE uri = $1
	`, uri).Scan(
		&article.URI,
		&article.Title,
		&article.Content,
		&article.Summary,
		&article.URL,
		&article.PublishedAt,
		&article.SourceURI,
		&article.SourceTitle,
		&article.Image,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "找不到該文章"})
		return
	} else if err != nil {
		log.Printf("查詢文章失敗: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查詢文章失敗"})
		return
	}

	// 返回文章
	c.JSON(http.StatusOK, article)
}
