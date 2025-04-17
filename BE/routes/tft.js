// routes/tft.js
import express from "express";
import axios from "axios";
import { riotApiKey, baseUrl } from "../config/apiConfig.js"; // config에서 불러오기

const router = express.Router();

// 챌린저 리그 정보 가져오기
router.get("/challenger", async (req, res) => {
  try {
    // axios를 이용해서 Riot API에 GET 요청을 보냄
    const response = await axios.get(
      `${baseUrl}/tft/league/v1/challenger`, // baseUrl을 사용해서 완전한 URL을 생성
      {
        headers: {
          "X-Riot-Token": riotApiKey, // 헤더에 Riot API 키를 넣어서 요청
        },
      }
    );
    res.json(response.data); // 요청 성공 시 응답 데이터를 JSON 형태로 반환
  } catch (error) {
    console.error(
      "Error fetching challenger league:",
      error.response?.data || error.message
    );
    res.status(500).json({ message: "Failed to fetch challenger info" }); // 실패 시 에러 메시지 반환
  }
});

export default router;
