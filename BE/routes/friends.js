import express from "express";
import dbConnection from "../db/mysqldb.js";
import {
  constraintViolatedError,
  duplicateKeyError,
} from "../utils/db_error.js";
import friendQueries from "../utils/queries/friendQueries.js";
const route = express.Router();

// 해결 해보면 좋을 것들
route.post("/request", async (req, res) => {
  // 해당 유저가 user table에 존재하는지 확인
  const checkExistsUser = async (nickname, tagline, connection, query) => {
    const [rows] = await connection.execute(query, [nickname, tagline]);
    return rows.length > 0;
  };

  let connection;
  try {
    connection = await dbConnection();
    const {
      requester_nickname,
      requester_tagline,
      receiver_nickname,
      receiver_tagline,
    } = req.body;

    // friendQueries.requestFriendQuery에서 사용함
    const requestParams = [
      requester_nickname,
      requester_tagline,
      receiver_nickname,
      receiver_tagline,
      "pending",
    ];
    // friendQueries.alreadyRequestFriendQuery에서 사용함
    const alreadyRequestParams = [
      requester_nickname,
      requester_tagline,
      receiver_nickname,
      receiver_tagline,
      "rejected",
    ];
    // friendQueries.updateRejectedQuery에서 사용함
    const updateParams = [
      "pending",
      requester_nickname,
      requester_tagline,
      receiver_nickname,
      receiver_tagline,
    ];
    if (
      requester_nickname &&
      requester_tagline &&
      receiver_nickname &&
      receiver_tagline
    ) {
      // 친구 요청 보낸 유저가 있는지 확인
      const senderExists = await checkExistsUser(
        requester_nickname,
        requester_tagline,
        connection,
        friendQueries.existsUserQuery
      );
      // 친구 요청 받는 유저가 있는지 확인
      const receiverExists = await checkExistsUser(
        receiver_nickname,
        receiver_tagline,
        connection,
        friendQueries.existsUserQuery
      );

      // or 연산자는 둘 다 false가 되야함
      // 즉, senderExists, receiverExists 둘 다 true 여야 true
      // (!(senderExists && receiverExists)) 이거랑 똑같음
      if (!(senderExists && receiverExists)) {
        return res
          .status(400)
          .json({ error: "요청자 또는 수신자가 존재하지 않습니다." });
      }

      // 친구요청 현재 보낸 상태 status = "pending"
      const [checkRows] = await connection.execute(
        friendQueries.alreadyRequestFriendQuery,
        alreadyRequestParams
      );
      console.log("여기 위에서 문젠가??", checkRows);
      // 이전에 친구요청 한 번 보낸 적 있을 때를 의미함
      if (checkRows[0].count > 0) {
        // 친구 거절하고 다시 친구 요청 보낼 때
        await connection.execute(
          friendQueries.updateRejectedQuery,
          updateParams
        );
      } else {
        // 처음 친구요청 보낼 때
        await connection.execute(
          friendQueries.requestFriendQuery,
          requestParams
        );
      }

      res.status(200).json({ success: "친구 추가 요청 보냄" });
    }
  } catch (err) {
    const message = err.sqlMessage;
    let result;
    // 제약 조건 걸리면 해당 violated 이라는 문구가 포함되어 있음.
    if (message.includes("violated")) {
      result = constraintViolatedError(message);
    } else {
      result = duplicateKeyError(message);
    }
    // 자기 자신한테 보내면 제약조건 위반으로 에러 발생.
    res.status(result.status).json({ err: result.message });
  } finally {
    if (connection) await connection.end();
  }
});

// 친구 목록 조회
// 궁금한 점 -> 요청 받을 때 query string을 인코딩하고 그걸 디코딩해서 사용할 수 있을까? 보안적으로 더 좋을거 같은데 gpt한테 물어보자
route.get("/list", async (req, res) => {
  let connection;
  try {
    connection = await dbConnection();
    const { requester_nickname, requester_tagline } = req.query;
    const status = "accepted";
    const params = [requester_nickname, requester_tagline, status];

    if (requester_nickname && requester_tagline) {
      // 친구 목록 조회
      const [friends_list] = await connection.query(
        friendQueries.friendListQuery,
        params
      );

      res.status(200).json({ friends_list });
    }
  } catch (err) {
    const message = err.sqlMessage;
    const result = duplicateKeyError(message);
    res.status(result.status).json({ err: result.message });
  } finally {
    if (connection) await connection.end();
  }
});

// 친구 추가 목록 조회, status = pending
route.get("/add_list", async (req, res) => {
  let connection;
  try {
    connection = await dbConnection();
    const { receiver_nickname, receiver_tagline } = req.query;
    const status = "pending";
    const params = [receiver_nickname, receiver_tagline, status];
    if (receiver_nickname && receiver_tagline) {
      // 친구 추가 목록 조회
      const [friends_list] = await connection.execute(
        friendQueries.friendAddListquery,
        params
      );

      res.status(200).json({ friends_list });
    }
  } catch (err) {
    const message = err.sqlMessage;
    const result = duplicateKeyError(message);
    res.status(result.status).json({ err: result.message });
  } finally {
    if (connection) await connection.end();
  }
});

// 친구 목록 상태 수정 -> 수락(accepted), 거절(rejected), 대기중(pending)
route.put("/put_add_list", async (req, res) => {
  let connection;
  try {
    connection = await dbConnection();
    await connection.beginTransaction();
    const {
      status,
      requester_nickname,
      requester_tagline,
      receiver_nickname,
      receiver_tagline,
    } = req.body;

    // friendQueries.updatePendingQuery에서 사용함
    const updateParams = [
      status,
      requester_nickname,
      requester_tagline,
      receiver_nickname,
      receiver_tagline,
    ];
    // friendQueries.updatePendingQuery에서 사용함
    const reverseUpdateParams = [
      status,
      receiver_nickname,
      receiver_tagline,
      requester_nickname,
      requester_tagline,
    ];
    //friendQueries.insertQuery에서 사용함
    const insertParams = [
      receiver_nickname,
      receiver_tagline,
      requester_nickname,
      requester_tagline,
      status,
    ];
    // friendQueries.alreadyRequestFriendQuery에서 사용함
    const checkParams = [
      receiver_nickname,
      receiver_tagline,
      requester_nickname,
      requester_tagline,
      "pending",
    ];
    // friendQueries.checkUserQuery에서 사용함
    const params = [
      requester_nickname,
      requester_tagline,
      receiver_nickname,
      receiver_tagline,
    ];
    const [checkRows] = await connection.execute(
      friendQueries.checkUserQuery,
      params
    );

    // 요청 보낸 유저, 요청 받는 유저 존재 여부 확인
    if (checkRows[0].count < 2) {
      await connection.rollback();
      return res.status(400).json({ err: "존재하지 않는 유저가 있습니다." });
    }

    // 친구 상태 업데이트
    const [rows] = await connection.execute(
      friendQueries.updatePendingQuery,
      updateParams
    );
    // status가 accepted일 때만 체크
    if (status === "accepted") {
      console.log("여기?");
      // 둘 다 친구 요청 보냈는지 확인
      const [reverseCheck] = await connection.execute(
        friendQueries.alreadyRequestFriendQuery,
        checkParams
      );
      console.log("여기 못오는듯.", reverseCheck[0]);

      // 상대가 이미 요청을 보냈던 경우 → update
      if (reverseCheck[0].count > 0) {
        console.log("안되면 여기임");
        await connection.execute(
          friendQueries.updatePendingQuery,
          reverseUpdateParams
        );
      } else {
        // 상대가 요청 안 했던 경우 → insert
        await connection.execute(friendQueries.insertQuery, insertParams);
      }
    }
    await connection.commit();
    return res.status(200).json({ success: "친구 요청 처리" });
  } catch (err) {
    const message = err.sqlMessage;
    const result = duplicateKeyError(message);
    res.status(result.status).json({ err: result.message });
  } finally {
    if (connection) await connection.end();
  }
});

// 친구 삭제 기능 -> 추가해야함
route.delete("/delete", async (req, res) => {
  let connection;
  try {
    connection = await dbConnection();
    const {
      requester_nickname,
      requester_tagline,
      receiver_nickname,
      receiver_tagline,
    } = req.body;
    // friendQueries.deleteQuery에서 사용함
    const requesterParams = [
      requester_nickname,
      requester_tagline,
      receiver_nickname,
      receiver_tagline,
    ];
    // friendQueries.deleteQuery에서 사용함
    const receiverParams = [
      receiver_nickname,
      receiver_tagline,
      requester_nickname,
      requester_tagline,
    ];

    const [checkRows] = await connection.execute(
      friendQueries.checkUserQuery,
      requesterParams
    );

    // 유저 둘 다 존재하는지 확인
    if (checkRows[0].count < 2) {
      await connection.rollback();
      return res.status(400).json({ err: "존재하지 않는 유저가 있습니다." });
    }

    // 친구 삭제하면 둘 다 지우기
    await connection.execute(friendQueries.deleteQuery, requesterParams);
    await connection.execute(friendQueries.deleteQuery, receiverParams);
    res.status(200).json({ success: "친구 삭제 완료" });
  } catch (err) {
    const message = err.sqlMessage;
    console.log(message);
  } finally {
    if (connection) await connection.end();
  }
});

export default route;
