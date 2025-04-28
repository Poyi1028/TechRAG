package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func TestDBConnection() {
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
		log.Fatal("連線失敗:", err)
	}
	defer db.Close()

	// 測試連線
	err = db.Ping()
	if err != nil {
		log.Fatal("無法 Ping 資料庫:", err)
	}

	fmt.Println("✅ 成功連線到資料庫")
}
