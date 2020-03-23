const static = require('./static');
const attractionModel = require('./model/attractionModel');
const reservationModel = require('./model/reservationModel');
const lostsModel = require('./model/lostsModel');
const noticeModel = require('./model/noticeModel');
const userModel = require('./model/userModel');
const schedule = require('node-schedule');
let startTodayDate = static.moment({hour: 0}).valueOf();  // 그 날의 시작 시간.(0시 0분)
let allAttraction = [];
let notices = [];
let losts = [];

// 그 날의 시작 시간 정시마다 갱신
const getStartTodayDate = schedule.scheduleJob('10 * * * * *', () => {
    console.log("******** 그 날의 시작 시간 갱신 : " + static.moment().format('MM월 DD일, HH시 mm분 ss초') + "\n");
    startTodayDate = static.moment({hour: 0}).valueOf();
    console.log(static.moment(startTodayDate).valueOf());
    console.log(static.moment(startTodayDate).format("YYYY-MM-DD HH:mm:ss"));
    console.log("_________________________________________________________________");
    exports.startTodayDate = startTodayDate;
})

// 놀이기구 초기 데이터 설정
// 10분 남았을 시 대기 인원 수를 계산해서 넣음
const setAttractions = function() {
    attractionModel.getAllAttraction()
    .then(attractions => {
        if(attractions.length === 0) {
            console.log("empty attraction DB!");
        }
        else {
            console.log("attractions count : " + allAttraction.length);
            // refreshWaitTimeAttractions(allAttraction);
            setPeopleCountOfRemainTime(5, attractions);
            allAttraction = attractions;
            exports.allAttraction = allAttraction;
        }
    })
}

// 일정시간 미만 남았을 시의 대기 인원 수 계산해서 넣는 함수
const setPeopleCountOfRemainTime = function(minute, attractions) {
    attractions.forEach(attr => {
        var key = 'count_remain_time';
        attr.check_remain_minute = minute;
        attr[key] = Math.ceil((((minute * 60) / attr.run_time) * attr.personnel));
    })
}

// 1분마다 대기시간 계산해서 갱신
const refreshWaitTimeAttractions = function() {
    const startTodayDate = static.moment({hour: 0}).valueOf();  // 그 날의 시작 시간.(0시 0분)
    
    userModel.getTodayAllUsersWait(startTodayDate)
    .then((result) => {
        if(result.length === 0) {
            console.log("temp");
        }
        else {
            result.forEach(element => {
                var attr = allAttraction.find((item, idx) => {
                    return item.attr_code === element.attr_code;
                });
                var waitMinute = calculateWaitMinute(attr, element.counts);
                attr.wait_minute = waitMinute;
                // console.log(attr.name + "'s waitTime is " + Math.ceil(attr.wait_minute));
            });
        }
        
        allAttraction = allAttraction;
        exports.allAttraction = allAttraction;
    })
}

// 놀이기구의 대기시간 계산
const calculateWaitMinute = function(attraction, waitCount) {
    var result = (waitCount / attraction.personnel) * attraction.run_time;
    var temp = Math.ceil(result / 60);   // 첫 번째 자리수 올림
    return temp;
}

// 일정시간 미만 남았을 시의 대기 인원 수 중 탑승여부 true로 변경
const changeBoarding = function() {
    allAttraction.forEach(obj => {
        
        var attr_code = obj.attr_code;
        var limit = obj.count_remain_time;
        var remainMinute = obj.check_remain_minute;

        // 테스트
        // if(attr_code == 1) {
            // console.log("*******************************************************************");
            // console.log(obj.name + " 의 대기시간은 " + obj.wait_minute);
            // console.log(obj.name + " 놀이기구가 "+ obj.check_remain_minute + " 분 남았을 때의 대기 인원 수 : " + obj.count_remain_time);
            // console.log("*******************************************************************");

            userModel.getImpossibleBoarding(attr_code, limit)
            .then(tokens => {
                if(tokens.length === 0) {
                    // console.log("getImpossibleBoarding failed!");
                }
                else {
                    // token_id의 value만 담은 array
                    var tokenIdArr = [];
                    tokens.forEach(ele => {
                        tokenIdArr.push(ele.token_id);
                    })
                    userModel.setPossibleBoarding(attr_code, limit)
                    .then(result => {
                        if(result.affectedRows > 0) {   // 탑승 여부 변경 완료
                            // 메세지 전송(푸시 알람)
                            console.log(tokenIdArr);
                            sendPushMsg(tokenIdArr, remainMinute);
                        }
                        else {
                            console.log("changeBoarding failed!");
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                }
            })
            .catch((err) => {
                console.log(err);
            })
        // }
    })
}

// FCM을 통해 메세지 보내기
const sendPushMsg = function(tokenIdArr, remainMinute) {
    // console.log(tokenIdArr);
    // console.log(tokenIdArr.length);
    
    tokenIdArr.forEach(ele => {
        var message = {
            data : {
            // body: `대기 신청한 놀이기구 ${remainMinute}분 남았습니다. 서둘러 탑승 준비를 마쳐주세요!`,
            body: "test",
            title: "GHOST의 전달 메세지"
            },
            token: ele
        };
        console.log(ele.length);
        static.admin.messaging().send(message)
        .then((response) => {        
                // Response is a message ID string.
                    console.log('Successfully sent message:', response);
                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                });
    })
    
}

// 예약 첫 번째 순위를 대기 신청으로 변환
const moveFirstReservationIntoWait = function(nfc_uid) {
    reservationModel.getFirstReservation(nfc_uid)
    .then(reservation => {
        if(reservation.length == 0) { // 예약 존재 X
            console.log("등록된 예약 X");
        }
        else {
            var attr_code = reservation[0].attr_code;
            var reservation_order = reservation[0].reservation_order;
            const req_time = static.moment().valueOf();
            userModel.insertWaitAttr(attr_code, req_time, nfc_uid)
            .then(result => {
                if(result.affectedRows > 0) {   // 예약 -> 대기 변환 완료
                    removeReservation(nfc_uid, reservation_order);
                }
                else {
                    console.log("예약 -> 대기 변환 failed!");
                }
            })
        }
    })
    .catch((err) => {
        console.log(err);
    })
}

// 예약 삭제(+ 예약 순서 정렬) 함수
const removeReservation = function(nfc_uid, reservation_order) {
    reservationModel.removeReservation(nfc_uid, reservation_order)
    .then(deleteResult => {
        if(deleteResult.affectedRows > 0) {   // DELETE 정상 처리됨
            reservationModel.sortReservation(nfc_uid, reservation_order);
        }
        else {
            console.log("DELETE Reservation 실패");
        }
    })    
    .catch((err) => {
        console.log(err);
    })
}

// 놀이기구 분실물 데이터 업데이트
const refreshLosts = function() {
    lostsModel.getRecentLosts()
    .then(result => {
        if(result.length === 0) {   // 분실물 존재 X
            console.log("현재 분실물이 존재하지 않습니다.");
        }
        losts = result;
        exports.losts = losts;
    })
    .catch((err) => {
        console.log(err);
    })
}

// 놀이기구 공지 데이터 업데이트
const refreshNotices = function() {
    noticeModel.getTodayNotice(startTodayDate)
    .then(result => {
        if(result.length === 0) {   // 공지(이벤트) 존재 X
            console.log("현재 공지 또는 이벤트가 존재하지 않습니다.");
        }
        notices = result;
        exports.notices = notices;
    })
    .catch((err) => {
        console.log(err);
    })  
}

exports.refreshNotices = refreshNotices;
exports.refreshLosts = refreshLosts;
exports.removeReservation = removeReservation;
exports.moveFirstReservationIntoWait = moveFirstReservationIntoWait;
exports.changeBoarding = changeBoarding;
exports.startTodayDate = startTodayDate;
exports.setAttractions = setAttractions;
exports.refreshWaitTimeAttractions = refreshWaitTimeAttractions;