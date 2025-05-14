import express from "express";
import dbConnection from "../db/mysqldb.js";
import riot_api_key from "../config/api_key.js";
import axios from "axios";
import { duplicateKeyError } from "../utils/db_error.js";
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
    // encodeURI는 한글 그대로 요청 보낼 수 없음 그래서 인코딩 해주기 위해서 사용함.
    const riot_url = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURI(
      nickname
    )}/${encodeURI(tagline)}?api_key=${riot_api_key}`;

    // puuid api 요청
    const response = await axios.get(riot_url);
    const riot_puuid = response.data.puuid;

    // insert into table (컬럼) values (params) => 여기에 들어갈 params
    const params = [riot_puuid, email, password, nickname, tagline, user_id];

    if (email && password && password2 && nickname && tagline && user_id) {
      // db 데이터 추가
      await connection.query(insert_query, params);
      res.status(200).json({ success: "회원가입 성공." });
    } else {
      res.status(404).json({ err: "데이터 모두 입력하세요." });
    }
  } catch (err) {
    const message = err.sqlMessage;

    // utils/db_error.js의 duplicateKeyError 함수
    const result = duplicateKeyError(message);
    res.status(result.status).json({ err: result.message });
  } finally {
    if (connection) await connection.end();
  }
});

export default router;
