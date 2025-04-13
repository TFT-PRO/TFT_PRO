import express from "express";
import userRouter from "./routes/userRoutes.js";
import authRouter from "./routes/authRoutes.js";
import cors from "cors";
const app = express();

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
app.listen(app.get("port"), () => {
  console.log("TFT_PRO 서버 실행중");
});
