import mysql from "mysql2/promise";
import dbconfig from "../config/database.js"; // db 정보

let connection;

const dbConnection = async () => {
  if (!connection) {
    try {
      connection = await mysql.createConnection(dbconfig);
      console.log("mysql 연결 성공");
    } catch (err) {
      console.log("mysql 연결 실패", err.stack);
      throw err;
    }
  }
  return connection;
};

// dbConnection.end();

export default dbConnection;
