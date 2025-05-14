import express, { application, json } from "express";
import axios from "axios";
import { riotApiKey, baseUrlAsia, baseUrlKr } from "../config/apiConfig.js"; // config에서 불러오기

const router = express.Router();

// Riot ID로 계정 정보 받기
router.get("/account/:gameName/:tagLine", async (req, res) => {
  try {
    const { gameName, tagLine } = req.params;
    const encodedGameName = encodeURIComponent(gameName);
    const encodedTagLine = encodeURIComponent(tagLine);

    const riot_url = `${baseUrlAsia}/riot/account/v1/accounts/by-riot-id/${encodedGameName}/${encodedTagLine}`;
    console.log(riot_url);
    const response = await axios.get(riot_url, {
      headers: {
        "X-Riot-Token": riotApiKey,
        "Content-Type": application / json,
      },
    });
    console.log(response.headers);
    res.json(response.data);
  } catch (error) {
    console.error(
      "에러 - 라이엇 아이디로 계정 정보 받기:",
      error.response?.data || error.message
    );
    res.status(500).json({ message: "실패 - 라이엇 아이디로 계정 정보 받기" });
  }
});

// 챌린저 리그 정보 받기
router.get("/challenger", async (req, res) => {
  try {
    const response = await axios.get(`${baseUrlKr}/tft/league/v1/challenger`, {
      headers: {
        "X-Riot-Token": riotApiKey,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      "에러 - 챌린저 리그 정보 받기:",
      error.response?.data || error.message
    );
    res.status(500).json({ message: "실패 - 챌린저 리그 정보 받기" });
  }
});

export default router;
