// // routes/tft.js
// import express from "express";
// import axios from "axios";
// import { riotApiKey, baseUrl } from "../config/apiConfig.js"; // config에서 불러오기

// const router = express.Router();

// // 소환사 정보 가져오기
// router.get("/summoner/:summonerName", async (req, res) => {
//   const { summonerName } = req.params; // URL 파라미터로 소환사 이름을 받음

//   try {
//     const response = await axios.get(
//       `${baseUrl}/tft/summoner/v1/summoners/by-name/${encodeURIComponent(
//         summonerName
//       )}`, // 소환사 이름을 포함한 URL
//       {
//         headers: {
//           "X-Riot-Token": riotApiKey, // API 키를 헤더에 넣어 인증
//         },
//       }
//     );
//     res.json(response.data); // 소환사 정보 반환
//   } catch (error) {
//     console.error(
//       "Error fetching summoner:",
//       error.response?.data || error.message
//     );
//     res.status(500).json({ message: "Failed to fetch summoner info" }); // 실패 시 에러 메시지 반환
//   }
// });

// export default router;
