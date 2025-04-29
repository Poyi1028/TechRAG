package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

// connectDB 連線到 PostgreSQL 資料庫並返回連線物件
func connectDB() (*sql.DB, error) {
	// 載入 .env 檔案
	err := godotenv.Load("../.env")
	if err != nil {
		log.Fatalf("無法載入 .env 檔案: %v", err)
	}

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

// 將抓取到的文章存入資料庫
func saveArticlesToDB(articles []Article, db *sql.DB) error {
	// 開始一個新的 transaction
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("開始事務失敗: %v", err)
	}

	// 為每個表準備預處理語句
	// 嘗試 insert 資料，若發現 uri 衝突則改為 update 其餘資料
	articleStmt, err := tx.Prepare(`
		INSERT INTO articles (uri, title, content, url, published_at, source_uri, source_title, source_image)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		ON CONFLICT (uri) DO UPDATE SET
		title = $2, content = $3, url = $4, published_at = $5, 
		source_uri = $6, source_title = $7, source_image = $8`)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("預處理 articles 語句失敗: %v", err)
	}
	defer articleStmt.Close()

	conceptStmt, err := tx.Prepare(`
		INSERT INTO concepts (article_uri, concept_uri, concept_label, concept_score)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (article_uri, concept_uri) DO UPDATE SET
		concept_label = $3, concept_score = $4`)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("預處理 concepts 語句失敗: %v", err)
	}
	defer conceptStmt.Close()

	categoryStmt, err := tx.Prepare(`
		INSERT INTO categories (article_uri, category_uri, category_label, category_score)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (article_uri, category_uri) DO UPDATE SET
		category_label = $3, category_score = $4`)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("預處理 categories 語句失敗: %v", err)
	}
	defer categoryStmt.Close()

	// 遍歷並保存每篇文章
	for _, article := range articles {
		// 保存文章基本信息
		_, err := articleStmt.Exec(
			article.URI,
			article.Title,
			article.Body,
			article.URL,
			article.Date,
			article.Source.URI,
			article.Source.Title,
			article.Source.Image,
		)
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("插入文章失敗: %v", err)
		}

		// 保存概念信息
		for _, concept := range article.Concepts {
			// 含有複數語言標籤，而此處只需要取用英文標籤
			eng_label := concept.Label["eng"]

			_, err := conceptStmt.Exec(
				article.URI,
				concept.URI,
				eng_label,
				concept.Score,
			)
			if err != nil {
				tx.Rollback()
				return fmt.Errorf("插入概念失敗: %v", err)
			}
		}

		// 保存分類信息
		for _, category := range article.Categories {
			_, err := categoryStmt.Exec(
				article.URI,
				category.URI,
				category.Label,
				category.Score,
			)
			if err != nil {
				tx.Rollback()
				return fmt.Errorf("插入分類失敗: %v", err)
			}
		}
	}

	// 提交事務
	err = tx.Commit()
	if err != nil {
		return fmt.Errorf("提交事務失敗: %v", err)
	}

	log.Printf("成功保存 %d 篇文章到資料庫", len(articles))
	return nil
}
