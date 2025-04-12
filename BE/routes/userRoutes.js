import express from "express";
import dbConnection from "../db/mysqldb.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // DB 연결
    const connection = await dbConnection();
    // 그냥 connection.query를 하면 Promise 타입으로 값이 받아와져서 비동기 처리
    // 값이 [[rows], [fields]] 형식으로 받아와짐 그래서 [rows]로 배열의 첫번째 값만 가져옴(DB에 저장된 값)
    const [rows] = await connection.query("select * from user");
    console.log("user info :", rows);

    // 응답 보냄
    res.send(rows);
  } catch (err) {
    console.error("데이터 조회 에러", err);
    res.status(500).json({ err: "데이터 조회 중 오류가 발생했습니다." });
  }
});

export default router;
