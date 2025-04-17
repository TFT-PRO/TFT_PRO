import express from "express";
import userRouter from "./routes/signin.js";
import authRouter from "./routes/singup.js";
import tftRouter from "./routes/tft.js";
import cors from "cors";
import dotenv from "dotenv";
const app = express();

dotenv.config(); // .env 파일 사용할때 이렇게 쓰는거래요

app.use(cors());

app.use(express.json());
// post 요청 시 값을 객체로 바꿔줌
app.use(express.urlencoded({ extended: false }));

// port 번호 설정
app.set("port", process.env.PORT || 3100);

app.get("/", (req, res) => {
  res.send("TFT_PRO 서버 실행중");
});

// /user를 통해서 오는건 모두 userRouter를 사용하겠다.
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/tft", tftRouter);

app.listen(app.get("port"), () => {
  console.log("TFT_PRO 서버 실행중");
});
