import express from "express";
import dbConnection from "../db/mysqldb.js";

const router = express.Router();

router.post("/signin", async (req, res) => {
  // 일단 이메일로 로그인, 나중에 아이디로 바꾸겠습니다
  const { email, password } = req.body;
  let connection;

  try {
    // 입력 유무 확인
    if (!email || !password) {
      return res.status(400).json({ error: "이메일, 비번 입력해라" });
    }

    // db 연결
    connection = await dbConnection();

    // 이메일로 검색
    const [rows] = await connection.query(
      "SELECT * FROM user WHERE email = ?", //여기서 ? 자리에 e-mail이 들어간데, 이게 보안에 좋데, SQL Injection이 방지된다나 뭐라나
      [email]
    );

    // 이메일 존재 여부 확인해야쥬
    if (rows.length === 0) {
      return res.status(401).json({ error: "존재하지 않는 이메일입니다." });
    }

    const user = rows[0];

    // 비밀번호 확인해야쥬
    if (user.password !== password) {
      return res.status(401).json({ error: "비밀번호가 일치하지 않습니다." });
    }

    // 성공
    res.status(200).json({
      message: "로그인 성공!",
      user: {
        id: user.id,
        email: user.email,
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
