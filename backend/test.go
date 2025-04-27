package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	// postgreSQL 連線字串 (DSN)
	connStr := "host=localhost port=5432 user=postgres password=mypassword dbname=mydatabase sslmode=disable"

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
