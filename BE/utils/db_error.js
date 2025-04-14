export function duplicateKeyError(message) {
  // message에서 for key로 시작하는 부분을 찾고 '' 안에 있는 (.+) 한개 이상의 단어를 찾는 거임
  // user.user_id 찾기 위함이다. / for key '(.+)' /
  const match = message.match(/ for key '(.+)'/);

  // 궁금하면 확인
  // console.log("에러 메시지 확인", match);

  if (match && match[1]) {
    const duplicated_key = match[1];
    console.log(duplicated_key);
    if (duplicated_key === "user.user_id") {
      // 대충 409가 중복 때문에 발생한 에러라고 생각하면
      return { status: 409, message: "이미 존재하는 아이디 입니다." };
    } else if (duplicated_key === "user.email") {
      return { status: 409, message: "이미 존재하는 이메일 입니다." };
    } else {
      // 이때는 nickname 이랑 tagline이 같은 경우라 이미 회원가입 되어있는 거임.
      return { status: 409, message: "이미 존재하는 회원 입니다." };
    }
  } else {
    res.status(500).json({ err: "데이터 조회 중 오류가 발생했습니다." });
  }
}
