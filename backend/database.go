package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

// ConnectDB 連線到 PostgreSQL 資料庫並返回連線物件
func ConnectDB() (*sql.DB, error) {
	// 從環境變數取得資料庫連線資訊
	host := os.Getenv("POSTGRES_HOST")
	port := os.Getenv("POSTGRES_PORT")
	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	dbname := os.Getenv("POSTGRES_DB")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)

	// 打開資料庫連線
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Printf("資料庫連線失敗: %v", err) // 改為 Logf 並返回錯誤
		return nil, err
	}
	// defer db.Close() // 移除 defer，連線將保持開啟狀態

	// 測試連線
	err = db.Ping()
	if err != nil {
		log.Printf("無法 Ping 資料庫: %v", err) // 改為 Logf 並返回錯誤
		db.Close()                         // 如果 Ping 失敗，關閉連線
		return nil, err
	}

	fmt.Println("✅ 成功連線到資料庫")
	return db, nil // 返回連線物件和 nil 錯誤
}
