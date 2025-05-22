const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

const sql = fs.readFileSync(path.join(__dirname, "setup.sql"),'utf-8');
const statements = sql
  .split(";")
  .filter((statement) => statement.trim() !== "");

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: "Pingo@2404",
});

async function executeQueries() {
  try {
    await connection.promise().query("CREATE DATABASE IF NOT EXISTS fixertech");

    await connection.promise().query("USE fixertech");

    for (const statement of statements) {
      if (
        statement.trim() !== "USE fixertech" &&
        statement.trim() !== "CREATE DATABASE IF NOT EXISTS fixertech"
      ) {
        await connection.promise().query(statement);
      }
    }

    console.log("Database setup complete!");
  } catch (err) {
    console.error("Error setting up database:", err);
  } finally {
    connection.end();
  }
}

executeQueries();
