// query : 쿼리문 작성

const SQL = require('@nearform/sql');

/* 티켓 생성 */
exports.addTicket = `
    INSERT INTO
        ticket
        (ticket_code, nfc_uid, issue_date)
    VALUES
        (?, null, ?);`

// exports.checkSameTicketCode = 'SELECT ticket_code FROM ticket WHERE ticket_code = ?';


/* 티켓 등록 */
// user DB 안에 같은 nfc_uid를 가진 데이터가 존재하는지 체크
exports.existUser = `
    SELECT 
        nfc_uid 
    FROM 
        user 
    WHERE 
        nfc_uid = ?`; 
          
// user DB 안에 같은 nfc_uid를 가진 데이터의 reg_date 변경
exports.updateRegDateInUser = `
    UPDATE 
        user 
    SET
        reg_date = ? 
    WHERE 
        nfc_uid = ?`;

// user DB 추가
exports.addUser = `
    INSERT INTO 
        user 
    SET 
        nfc_uid = ?, reg_date = ?, attr_code = null, req_time = null, token_id = ?`;    

// ticket DB 안에 같은 ticket_code를 가진 데이터가 존재하는지 체크
exports.existTicket = `
    SELECT 
        ticket_code, nfc_uid 
    FROM 
        ticket 
    WHERE ticket_code = ?`;

// ticket_code에 맞는 데이터 안에 nfc_uid 데이터 삽입
exports.insertUidInTicket = `
    UPDATE 
        ticket 
    SET 
        nfc_uid = ? 
    WHERE 
        ticket_code = ?`;  


/* 놀이기구 데이터 생성 */
exports.addAttraction = `
    INSERT INTO 
        attraction 
    SET 
        name = ?, personnel = ?, run_time = ?, 
        start_time = ?, end_time = ?, location = ?, 
        coordinate = ?, img_url = ?, info = ?`;


/* 모든 놀이기구 데이터 가져오기 */
exports.getAllAttraction = `
    SELECT 
        * 
    FROM 
        attraction`;


/* 특정 시간마다 놀이기구 전체 대기시간 갱신하기 */
// 오늘 티켓 등록한 사람들의 데이터를 가져오기
// WHERE 절에서 AND reg_date > ? 넣어야함!
exports.getTodayAllUsersWait = `
    SELECT
        b.attr_code, COUNT(a.attr_code) as counts
    FROM
        attraction AS b
    LEFT OUTER JOIN 
        user AS a
    ON 
        a.attr_code = b.attr_code
    GROUP BY 
        b.attr_code`;


/* 특정 사용자의 대기 신청한 놀이기구 고유코드 전송 */
exports.getWaitAttrCode = `
    SELECT 
        attr_code
    FROM 
        user
    WHERE
        nfc_uid = ?`;


/* 특정 사용자의 대기 신청한 놀이기구 고유코드 전송 */
exports.getWaitStatusInfo = `
    SELECT 
        a.attr_code, b.name, b.location, b.img_url
    FROM 
        user as a
    INNER JOIN
        attraction AS b
    ON
        a.attr_code = b.attr_code
    WHERE
        a.nfc_uid = ?`;


/* 특정 사용자의 예약 신청한 놀이기구 고유코드 Array 전송 */
exports.getReservation = `
    SELECT 
        attr_code, reservation_order
    FROM 
        reservation
    WHERE
        nfc_uid = ?`;


/* 예약 데이터 추가 */
// 가장 마지막 예약 순서 가져오기
exports.getLastOrder = `
    SELECT
        reservation_order 
    FROM
        reservation 
    WHERE 
        nfc_uid = ?
    ORDER BY
        reservation_order
    DESC
    LIMIT 1`;

// 예약 데이터 추가하기
exports.addReservation = `
    INSERT INTO 
            reservation 
        SET 
            nfc_uid = ?, reservation_order = ?, attr_code = ?`;


/* 예약 데이터 삭제 */
// 특정 예약 데이터 삭제하기
exports.removeReservation = `
    DELETE FROM
        reservation 
    WHERE 
        nfc_uid = ?
    AND
        reservation_order = ?
    LIMIT 1`;

// 예약 데이터 정렬(지운 순서부터의 레코드 순서값에서 1을 제거하기)
exports.sortReservation = `
    UPDATE
        reservation
    SET
        reservation_order = reservation_order - 1
    WHERE
	    nfc_uid = ?
    AND
	    reservation_order > ?;
`;


/* 놀이기구 대기 신청 */
// 이미 대기 신청 되어있는지 확인
exports.existWaitAttr = `
    SELECT 
        attr_code, req_time 
    FROM 
        user 
    WHERE 
        nfc_uid = ?`;

// 놀이기구 대기 신청을 위한 정보 삽입
exports.insertWaitAttr = `
    UPDATE 
        user 
    SET 
        attr_code = ?, req_time = ?
    WHERE
        nfc_uid = ?`;


/* 대기 현황 보기 */
// 현재 사용자가 신청한 대기가 위로 몇 명 남았는지 count
exports.getCountUserWait = `
    SELECT 
        COUNT(req_time) as counts
    FROM user
    WHERE 
        req_time < 
            (
                SELECT 
                    req_time
                FROM 
                    user 
                WHERE 
                    nfc_uid = ?
            )
    AND
	    attr_code = ?`;

        
/* 대기 삭제 */
// 현재 사용자가 신청한 대기 삭제
exports.removeWaitAttr = `
    UPDATE 
        user 
    SET 
        attr_code = null, req_time = null, boarding = 0
    WHERE
        nfc_uid = ?`;


/* 특정 시간 이내의 대기 신청자들 중 boarding(탑승여부) true로 변경 */
// 특정 시간 이내의 대기 신청자들 boarding true로 변경
exports.setPossibleBoarding = `
    UPDATE 
        user AS a
    INNER JOIN
        (
            SELECT 
                nfc_uid, boarding 
            FROM 
                user 
            WHERE 
                attr_code = ? 
            ORDER BY 
                req_time 
            ASC 
            LIMIT ?
        ) AS b
    ON
        a.nfc_uid = b.nfc_uid
    SET
        a.boarding = 1
    WHERE
        b.boarding = 0`;

// boarding false인 사람들의 token_id 리스트 얻어오기
exports.getImpossibleBoarding = `
    SELECT
        a.token_id
    FROM 
        user AS a
    INNER JOIN
        (
            SELECT 
                nfc_uid, boarding 
            FROM 
                user 
            WHERE 
                attr_code = ? 
            ORDER BY 
                req_time 
            ASC 
            LIMIT ?
        ) AS b
    ON
        a.nfc_uid = b.nfc_uid
    WHERE
        b.boarding = 0`;


/* 예약 순서 변경 */
exports.changeReservation = `
    UPDATE 
        reservation
    SET
        attr_code = ?
    WHERE
        nfc_uid = ?
    AND
        reservation_order = ?`;


/* NFC 태깅 */
// 탑승 여부 체크
exports.getBoarding = `
    SELECT
        boarding
    FROM
        user
    WHERE
        nfc_uid = ?`

// 첫 번째 예약 정보 가져오기
exports.getFirstReservation = `
    SELECT
        * 
    FROM
        reservation 
    WHERE 
        nfc_uid = ?
    ORDER BY
        reservation_order
    ASC
    LIMIT 1`;


/* 예약한 놀이기구 추천 */
// 예약한 놀이기구의 좌표 정보 가져오기
exports.getCoordinateOfReservation = `
    SELECT
        a.attr_code, a.coordinate, b.reservation_order
    FROM
        attraction AS a
    INNER JOIN
        reservation AS b
    ON
        a.attr_code = b.attr_code
    WHERE
        b.nfc_uid = ?`;


/* 티켓 등록했는지 판단 */
exports.getTodayRegisteredTicket = `
    SELECT
        a.ticket_code, b.reg_date
    FROM 
        ticket AS a
    INNER JOIN
        user AS b
    ON 
        a.nfc_uid = b.nfc_uid
    WHERE
        a.nfc_uid = ?
    AND
        b.reg_date > ?`;


/* 공지 및 분실물 갱신 및 출력 */
// 공지 새로 넣기
exports.addNotice = `
    INSERT INTO
        notice
        (title, context, reg_date)
    VALUES
        (?, ?, ?);`;

// 분실물 새로 넣기
exports.addLosts = `
    INSERT INTO
        losts
        (classification, name, location, get_date)
    VALUES
        (?, ?, ?, ?);`;

// 보관중인 분실물들 중 가장 최근에 등록된 분실물의 데이터 가져오기(30개)
exports.getRecentLosts = `
    SELECT
        classification, name, location, get_date
    FROM
        losts
    WHERE
        status = 0
    ORDER BY 
        get_date
    DESC
    LIMIT 30`;

// 공지 데이터 가져오기(오늘 날짜)
exports.getTodayNotice = `
    SELECT
        title, context, reg_date
    FROM
        notice
    WHERE
        status = 1
    ORDER BY 
        reg_date
    DESC`;

//     SELECT
//         attr_code, count(attr_code) as counts
//     FROM
//         user
//     WHERE
//         reg_date >= ? 
//     AND 
//         attr_code is NOT NULL 
//     AND 
//         req_time is NOT NULL 
//     GROUP BY attr_code`;