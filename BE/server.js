import express from "express";
import userRouter from "./routes/userRoutes.js";

const app = express();

// port 번호 설정
app.set("port", process.env.PORT || 3100);

app.get("/", (req, res) => {
  res.send("TFT_PRO 서버 실행중");
});

// /user를 통해서 오는건 모두 userRouter를 사용하겠다.
app.use("/user", userRouter);

app.listen(app.get("port"), () => {
  console.log("TFT_PRO 서버 실행중");
});
