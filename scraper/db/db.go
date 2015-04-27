package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	_ "github.com/lib/pq"
)

var db *sql.DB

func Connect() {
	goEnv := os.Getenv("GO_ENV")
	var err error
	if goEnv != "production" {
		db, err = sql.Open(
			"postgres",
			"dbname=nyc-buildings-api sslmode=disable",
		)
	} else {
		db, err = sql.Open(
			"postgres",
			"postgres://"+os.Getenv("NYCBDB")+"?sslmode=disable",
		)
	}
	if err != nil {
		log.Fatal(err)
	}
	err = db.Ping()
	if err != nil {
		log.Println(err)
	}
	return
}

type query struct {
	ouput      string
	table      string
	columns    map[string]string
	identifier string
}

func (q *query) createQueryString(exists bool) (params []interface{}) {
	columns := []string{}

	if exists == true {
		q.ouput = fmt.Sprintf("UPDATE %s SET ", q.table)

		assigns := []string{}

		count := 1
		for key, value := range q.columns {
			assigns = append(
				assigns,
				fmt.Sprintf("%s = $%d", key, count),
			)
			params = append(params, value)
			count += 1
		}
		q.ouput += strings.Join(assigns, ", ")

		marker := fmt.Sprintf("$%d", count)
		whereString := " WHERE \"" + q.table + "\".\"" + q.identifier + "\" = " + marker
		q.ouput += whereString
		params = append(params, q.columns[q.identifier])

	} else {
		q.ouput = fmt.Sprintf("INSERT INTO %s(", q.table)
		markers := []string{}

		count := 1
		for key, value := range q.columns {
			params = append(params, value)
			columns = append(columns, key)
			markers = append(markers, fmt.Sprintf("$%d", count))
			count += 1
		}

		q.ouput += strings.Join(columns, ", ")
		q.ouput += ") VALUES("
		q.ouput += strings.Join(markers, ", ")
		q.ouput += ")"
	}
	return
}

func WriteColumnsMapToTable(columns map[string]string, table string, identifier string) error {
	querySruct := query{
		table:      table,
		columns:    columns,
		identifier: identifier,
	}

	exists, err := checkExistence(columns, table, identifier)
	if err != nil {
		return err
	}

	params := querySruct.createQueryString(exists)

	foo, err := db.Query(
		querySruct.ouput,
		params...,
	)
	// foo, err := db.Exec(
	// 	`INSERT INTO buildings ( local_law, city_owned ) VALUES ( $1 , $2 )`,
	// 	"bbl",
	// 	"testing",
	// )
	// // var userid int
	// // err := db.QueryRow(`INSERT INTO buildings(name, favorite_fruit, age)
	// // 	VALUES('beatrice', 'starfruit', 93) RETURNING id`).Scan(&userid)
	// fmt.Println(foo)
	_ = foo
	// var err error
	return err
}

func checkExistence(columns map[string]string, table string, identifier string) (bool, error) {
	query := "SELECT  \"" +
		table + "\".* FROM \"" +
		table + "\" WHERE \"" +
		table + "\".\"" +
		identifier + "\" = $1 LIMIT 1"
	exec, err := db.Exec(query, columns[identifier])
	if err != nil {
		return false, err
	}
	count, err := exec.RowsAffected()
	if err != nil {
		return false, err
	}

	if count == 0 {
		return false, nil
	}
	return true, nil
}
