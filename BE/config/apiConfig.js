import dotenv from "dotenv";
dotenv.config();

export const riotApiKey = process.env.RIOT_API_KEY;
export const baseUrl = "https://kr.api.riotgames.com"; // 필요시 다른 지역 설정도 가능
