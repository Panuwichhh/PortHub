package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/jackc/pgx/v5/stdlib"
)

var DB *sql.DB

func Connect() {
	dsn := "postgres://porthub:porthub123@localhost:5432/porthub_db"

	var err error
	DB, err = sql.Open("pgx", dsn)
	if err != nil {
		log.Fatal("Failed to connect DB:", err)
	}

	if err = DB.Ping(); err != nil {
		log.Fatal("DB not responding:", err)
	}

	fmt.Println("✅ Connected to PostgreSQL")
}
