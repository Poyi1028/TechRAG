package main

import (
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// 連接資料庫
	db, err := connectDB()
	if err != nil {
		log.Fatalf("無法連線到資料庫: %v", err)
	}
	defer db.Close()

	// 初始化 Gin 路由
	r := gin.Default()

	// 將資料庫連線注入到所有請求的上下文中
	r.Use(func(c *gin.Context) {
		c.Set("db", db)
		c.Next()
	})

	// 首頁路由
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Tech RAG API 正在運行中！",
		})
	})

	// 抓取文章路由
	r.GET("/fetch", fetch)

	// 啟動服務器
	r.Run() // 預設在瀏覽器 localhost:8080
}
