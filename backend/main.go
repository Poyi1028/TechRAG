package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 連接資料庫
	db, err := connectDB()
	if err != nil {
		log.Fatalf("無法連線到資料庫: %v", err)
	}
	defer db.Close()

	// 生成版本號 - 使用當前時間戳
	version := fmt.Sprintf("%d", time.Now().Unix())

	// 初始化 Gin 路由
	r := gin.Default()

	// 配置 CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// 將資料庫連線注入到所有請求的上下文中
	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	// 添加禁用緩存的中間件（開發環境使用）
	r.Use(func(c *gin.Context) {
		c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
		c.Header("Pragma", "no-cache")
		c.Header("Expires", "0")
		c.Next()
	})

	// 判斷運行環境以設定前端檔案路徑
	frontendBasePath := "../frontend" // 本地開發預設路徑

	// 檢查 /app/frontend 是否存在，如果存在，則假定在 Docker 環境中
	if _, err := os.Stat("/app/frontend"); err == nil {
		frontendBasePath = "/app/frontend"
		log.Println("Detected Docker environment, serving frontend from /app/frontend")
	} else {
		log.Println("Serving frontend from local path: ../frontend")
	}
	log.Printf("Final frontend base path: %s", frontendBasePath)

	// 設置前端靜態文件
	r.Static("/static", filepath.Join(frontendBasePath, "static"))

	// 添加首頁路由，返回前端 index.html
	r.GET("/", func(c *gin.Context) {
		c.File(filepath.Join(frontendBasePath, "index.html"))
	})

	// API 路由
	api := r.Group("/api")
	{
		// API 首頁路由
		api.GET("/", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "Tech RAG API 正在運行中！",
				"version": version,
			})
		})

		// 抓取文章路由
		api.GET("/fetch", fetch)

		// 添加文章相關的API端點
		api.GET("/articles", getArticles)          // 獲取文章列表
		api.GET("/articles/:uri", getArticleByURI) // 獲取單篇文章詳情
	}

	// 初始化聊天路由
	initChatRoutes(r)

	// 啟動服務器
	log.Printf("伺服器啟動，版本號: %s", version)
	r.Run(":8080") // 預設在瀏覽器 localhost:8080
}
