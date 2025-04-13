import express from "express";
import dbConnection from "../db/mysqldb.js";
import riot_api_key from "../config/api_key.js";
import { request } from "express";
const router = express.Router();

router.post("/signup", async (req, res) => {
  const insert_query =
    "insert into user (riot_puuid, email, password, nickname, tagline) values (?,?,?,?,?)";
  let connection;
  try {
    connection = await dbConnection();
    console.log("request 확인: ", req.body);
    // const values = req.body;
    const { email, password, password2, nickname, tagline } = req.body;
    const params = [
      "ldrPBh89UI6HasJURh48vb097BtGzM6v9X4F0It5eL_u6W1Kn-akufLuOGwf3phoSxKQVtlceoHP-M",
      email,
      password,
      nickname,
      tagline,
    ];
    // puuid 필요함
    const riot_url = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${nickname}/${tagline}?api_key=${riot_api_key}`;
    request.get({ uri: riot_url }, (err, res, body) => {
      console.log("puuid 받아와지나? ", res);
    });
    console.log(riot_url);
    if (email && password && password2 && nickname && tagline) {
      console.log(email, nickname, tagline);
      await connection.query(insert_query, params);
      //   console.log(rows);
      res.status(200).json({ success: "회원가입 성공." });
      //   if (rows) {
      //     console.log("이미 존재하는 회원입니다.", rows);
      //     res.status(409).json({ err: "이미 존재하는 이메일 입니다." });
      //   } else {
      //     console.log("이때 회원가입 가능");
      //   }
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
