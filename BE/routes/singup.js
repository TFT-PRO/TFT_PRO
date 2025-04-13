import express from "express";
import dbConnection from "../db/mysqldb.js";
import riot_api_key from "../config/api_key.js";
import axios from "axios";
const router = express.Router();

router.post("/signup", async (req, res) => {
  const insert_query =
    "insert into user (riot_puuid, email, password, nickname, tagline,user_id) values (?,?,?,?,?,?)";
  let connection;
  try {
    // db 연결
    connection = await dbConnection();

    // request 파라미터 받아옴
    const { email, password, password2, nickname, tagline, user_id } = req.body;

    // db에 저장하기 위해서 puuid 필요함
    const riot_url = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURI(
      nickname
    )}/${encodeURI(tagline)}?api_key=${riot_api_key}`;

    // puuid api 요청
    const response = await axios.get(riot_url);
    const riot_puuid = response.data.puuid;

    // insert into table (컬럼) values (params) => 여기에 들어갈 params
    const params = [riot_puuid, email, password, nickname, tagline, user_id];

    if (email && password && password2 && nickname && tagline && user_id) {
      console.log(email, nickname, tagline);

      // db 데이터 추가
      await connection.query(insert_query, params);
      res.status(200).json({ success: "회원가입 성공." });
    } else {
      res.status(404).json({ err: "데이터 모두 입력하세요." });
    }
  } catch (err) {
    console.log(err.sqlMessage);
    res.status(500).json({ err: "데이터 조회 중 오류가 발생했습니다." });
  } finally {
    if (connection) await connection.end();
  }
});

export default router;
