package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	TestDBConnection()
	r := gin.Default()
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello gin!",
		})
	})
	r.Run() // 預設在瀏覽器 localhost:8080
}
