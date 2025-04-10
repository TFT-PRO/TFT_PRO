import express from "express";

const app = express();
const port = 3100;
app.get("/", (req, res) => {
  res.send("Node JS 서버 실행중");
});

app.listen(port, () => {
  console.log("서버 실행중");
});
