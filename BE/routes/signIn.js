import express from "express";
import dbConnection from "../db/mysqldb.js";

const router = express.Router();

router.post("/signin", async (req, res) => {
  const { user_id, password } = req.body;
  let connection;

  try {
    // 입력 유무 확인
    if (!user_id || !password) {
      return res.status(400).json({ error: "아이디와 비밀번호를 입력하세요." });
    }

    // DB 연결
    connection = await dbConnection();

    // user_id로 검색
    const [rows] = await connection.query(
      "SELECT * FROM user WHERE user_id = ?",
      [user_id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "존재하지 않는 아이디입니다." });
    }

    const user = rows[0];

    // 비밀번호 확인
    if (user.password !== password) {
      return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
    }

    // 로그인 성공
    res.status(200).json({
      message: "로그인 성공!",
      user: {
        id: user.id,
        user_id: user.user_id,
        nickname: user.nickname,
        riot_puuid: user.riot_puuid,
      },
    });
  } catch (err) {
    console.error("로그인 오류:", err);
    res.status(500).json({ error: "서버 오류가 발생했습니다." });
  } finally {
    if (connection) await connection.end();
  }
});

export default router;
