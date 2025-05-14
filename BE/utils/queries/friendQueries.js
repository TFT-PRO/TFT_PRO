const friendQueries = {
  // 친구 요청 쿼리
  requestFriendQuery: `insert into friendrequest (requester_nickname, requester_tagline, receiver_nickname, receiver_tagline, status) values (?,?,?,?,?)`,

  // 해당 유저 존재 여부 쿼리
  existsUserQuery: `select id from user where nickname = ? and tagline = ?`,

  // 이전에 친구 요청을 보낸적 있는지 확인하는 쿼리
  // 이전에 친구 요청 거절했을 때 수정하기 위해 필요 -> 뭔 소리냐 친구 거절해도 db에 남아있음, 그걸 확인하기 위한 쿼리문
  alreadyRequestFriendQuery: `select count(*) as count from friendrequest where requester_nickname = ? and requester_tagline = ? and receiver_nickname = ? and receiver_tagline = ? and status = ?`,

  // status(친구 수락, 거절, 대기중) 변경
  updateRejectedQuery: `update friendrequest set status = ? where requester_nickname = ? and requester_tagline = ? and receiver_nickname = ? and receiver_tagline = ? and status = 'rejected'`,
  updatePendingQuery: `update friendrequest set status = ? where requester_nickname = ? and requester_tagline = ? and receiver_nickname = ? and receiver_tagline = ? and status = 'pending'`,

  // 친구 목록 조회
  friendListQuery: `select receiver_nickname, receiver_tagline from friendrequest where requester_nickname = ? and requester_tagline = ? and status = ?`,

  // 친구 추가 목록 조회
  friendAddListquery: `select requester_nickname, requester_tagline from friendrequest where receiver_nickname = ? and receiver_tagline = ? and status = ? `,

  // 친구 수락하면 받은 사람의 친구 목록에도 추가 되어야하기에 필요함
  insertQuery: `insert into friendrequest (requester_nickname, requester_tagline, receiver_nickname, receiver_tagline, status) values (?,?,?,?,?)`,

  // 존재하지 않는 유저한테 보낼 수도 있기에
  // 유저 2명이 user table에 존재하는지 확인.
  checkUserQuery: `select count(*) as count from user where (nickname = ? and tagline = ?) or (nickname = ? and tagline = ?)`,

  // 친구 삭제
  deleteQuery: `delete from friendrequest where requester_nickname = ? and requester_tagline = ? and receiver_nickname = ? and receiver_tagline = ?`,
};

export default friendQueries;
