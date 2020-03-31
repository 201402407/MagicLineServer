const static = require('./static');
const attractionModel = require('./model/attractionModel');
const reservationModel = require('./model/reservationModel');
const lostsModel = require('./model/lostsModel');
const noticeModel = require('./model/noticeModel');
const userModel = require('./model/userModel');
const schedule = require('node-schedule');
const JSON = require('JSON');

let startTodayDate = static.moment({hour: 0}).valueOf();  // 그 날의 시작 시간.(0시 0분)
let allAttraction = [];

// 그 날의 시작 시간 정시마다 갱신
const getStartTodayDate = schedule.scheduleJob('1 0 0 * * *', () => {
    console.log("******** 그 날의 시작 시간 갱신 : " + static.moment().format('MM월 DD일, HH시 mm분 ss초') + "\n");
    startTodayDate = static.moment().valueOf();
    console.log(static.moment().valueOf());
    console.log(static.moment(startTodayDate).valueOf());
    console.log(static.moment(startTodayDate).format("YYYY-MM-DD HH:mm:ss"));
    
    var redis = static.redis;
    redis.set("startTodayDate", startTodayDate);
    setReservationFlag(startTodayDate);
    setWaitFlag(startTodayDate);

    console.log("_________________________________________________________________");
    exports.startTodayDate = startTodayDate;
})

const setReservationFlag = function(reg_date) {
    reservationModel.setReservationFlag(reg_date)
    .then(result => {
        if(result.affectedRows > 0) {
            console.log("[ " + static.moment().format('MM월 DD일') + "] 예약 FLAG 변경 완료. \n");
        }
        else {
            console.log("예약 플래그 변경할 것 없음.");
        }
    })    
}

const setWaitFlag = function(reg_date) {
    userModel.setWaitFlag(reg_date)
    .then(result => {
        if(result.affectedRows > 0) {
            console.log("[ " + static.moment().format('MM월 DD일') + "] 대기 FLAG 변경 완료. \n");
        }
        else {
            console.log("대기 플래그 변경할 것 없음");
        }
    })    
}

// 놀이기구 초기 데이터 설정
// 10분 남았을 시 대기 인원 수를 계산해서 넣음
const setAttractions = function() {
    attractionModel.getAllAttraction()
    .then(attractions => {
        if(attractions.length === 0) {
            console.log("empty attraction DB!");
        }
        else {
            // setPeopleCountOfRemainTime(5, attractions);

            // redis에 저장
            var redis = static.redis;
            redis.del(static.redisAttrName);

            attractions.forEach(ele => {
                var countRemainTime = getPeopleCountOfRemainTime(5, ele);
                ele.check_remain_minute = 5;
                ele.count_remain_time = countRemainTime;
                
                redis.rpush(static.redisAttrName, JSON.stringify(ele));
                // 대기 시간 초기 설정
                redis.hmset(static.redisWaitMinuteName, ele.attr_code, 0);
            })
        }
    })
}

// 일정시간 미만 남았을 시의 대기 인원 수 계산해서 넣는 함수
const getPeopleCountOfRemainTime = function(minute, attraction) {
    return Math.ceil((((minute * 60) / attraction.run_time) * attraction.personnel));
}

// 대기시간 계산해서 갱신
const refreshWaitTimeAttractions = function() {
    
    userModel.getTodayAllUsersWait()
    .then((result) => {
            var redis = static.redis;

            // for(var i = 0; i < result.length; i++) {
            //     // result.forEach(counts => {
            //         var index = counts.attr_code - 1;
            //         redis.lindex(static.redisAttrName, index, (err, attr) => {
            //             var attr_obj = JSON.parse(attr);
            //             if(err) {
            //                 console.log("redisAttrName have invalid attraction's data!");
            //                 return;
            //             }
            //             if(attr_obj.attr_code != counts.attr_code) {
            //                 console.log("REDIS 내 Attraction Data Index와 DB의 Attraction Data Index가 다름. DB점검 및 서버 재실행 필요.");
            //                 return;
            //             }

            //             var waitMinute = calculateWaitMinute(attr_obj, element.counts);
            //             redis.hmset(static.redisWaitMinuteName, attr_obj.attr_code, waitMinute);
            //         // })
            //     })
            // }
           

            redis.lrange(static.redisAttrName, 0, -1, (err, arr) => {
            if(err) {
                console.log("redisAttrName have invalid attraction's data!");
                return;
            }
            else {
                // result의 인덱스와 REDIS에 저장된 놀이기구 Array의 인덱스가 같다고 가정
                for(var i = 0; i < result.length; i++) {
                    var element = result[i];
                    var attr_obj = JSON.parse(arr[element.attr_code - 1]);
                    if(attr_obj.attr_code != element.attr_code) {
                        console.log("REDIS 내 Attraction Data Index와 DB의 Attraction Data Index가 다름. DB점검 및 서버 재실행 필요.");
                        return;
                    }
                    var waitMinute = calculateWaitMinute(attr_obj, element.counts);
                    redis.hmset(static.redisWaitMinuteName, attr_obj.attr_code, waitMinute);
                }
                console.log("[" + static.moment().format('MM월 DD일, HH시 mm분 ss초') + "]  놀이기구 대기 시간 갱신 완료 . ");
                // arr.forEach(attr_json => {
                    
                //     var attr_obj = JSON.parse(attr_json);
                //     var element = result.find((item, idx) => {
                //         return item.attr_code === attr_obj.attr_code;
                //     })
                //     if(element != null) {
                //         var waitMinute = calculateWaitMinute(attr_obj, element.counts);
                //     }
                //     else {
                //         var waitMinute = 0;
                //     }
                //     redis.hmset(static.redisWaitMinuteName, attr_obj.attr_code, waitMinute);
                //     // console.log("Asd");
                //     // changeBoarding(attr_obj);
                // })
            }
        })
    })
}

// 놀이기구의 대기시간 계산
const calculateWaitMinute = function(attraction, waitCount) {
    if(waitCount == 0) {
        return 0;
    }
    
    var result = (waitCount / attraction.personnel) * attraction.run_time;
    var temp = Math.ceil(result / 60);   // 첫 번째 자리수 올림
    return temp;
}

// 일정시간 미만 남았을 시의 대기 인원 수 중 탑승여부 true로 변경
const changeBoarding = function(attrs) {
    // console.log("탑승 여부 변경 및 FCM 전송 시작");
    attrs.forEach(attr => {
        attr = JSON.parse(attr);

        var attr_code = attr.attr_code;
        var limit = attr.count_remain_time;
        var remainMinute = attr.check_remain_minute;
        userModel.getImpossibleBoarding(attr_code, limit)
        .then(tokens => {
            if(tokens.length === 0) {
                // console.log("attr code! " + attr_code);
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
    })
    console.log("[" + static.moment().format('MM월 DD일, HH시 mm분 ss초') + "]  놀이기구 탑승 여부 변경 및 FCM 완료 . ");
}

// FCM을 통해 메세지 보내기
const sendPushMsg = function(tokenIdArr, remainMinute) {
    tokenIdArr.forEach(ele => {
        var message = {
            data : {
            body: `대기 신청한 놀이기구 ${remainMinute}분 남았습니다. 서둘러 탑승 준비를 마쳐주세요!`,
            title: "World MagicLine - 대기 신청 잔여시간 안내"
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
    console.log(" 예약 순서 : " + reservation_order);
    reservationModel.removeReservation(nfc_uid, reservation_order)
    .then(deleteResult => {
        if(deleteResult.affectedRows > 0) {   // DELETE 정상 처리됨
            reservationModel.sortReservationAfterRemove(nfc_uid, reservation_order)
            .then(result => {
                if(result.affectedRows > 0) {
                    console.log("asdff");
                }
                else {
                    console.log(" sortReservationAfterRemove 실패");
                }
            })
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
    var redis = static.redis;
    lostsModel.getRecentLosts()
    .then(result => {
        if(result.length === 0) {   // 분실물 존재 X
            console.log("현재 분실물이 존재하지 않습니다.");
        }
        else {
            var i = 0;
            redis.del(static.redisLostsName);
            result.forEach(ele => {
                var obj = {
                'classification': ele.classification, 
                'name': ele.name,
                'location': ele.location, 
                'get_date': ele.get_date};

                redis.hmset(static.redisLostsName, i, JSON.stringify(obj));
                i++;
            })
        }
        console.log("[" + static.moment().format('MM월 DD일, HH시 mm분 ss초') + "]  놀이기구 분실물 데이터 업데이트 완료. ");
    })
    .catch((err) => {
        console.log(err);
    })
}

// 놀이기구 공지 데이터 업데이트
const refreshNotices = function() {
    var redis = static.redis;
    noticeModel.getTodayNotice(startTodayDate)
    .then(result => {
        if(result.length === 0) {   // 공지(이벤트) 존재 X
            console.log("현재 공지 또는 이벤트가 존재하지 않습니다.");
        }
        else {
            var i = 0;
            redis.del(static.redisNoticeName);  // 데이터 삭제
            result.forEach(ele => { // 갱신
                var obj = {'title': ele.title, 
                'context': ele.context,
                'reg_date': ele.reg_date};

                redis.hmset(static.redisNoticeName, i, JSON.stringify(obj));
                i++;
            })
        }
        console.log("[" + static.moment().format('MM월 DD일, HH시 mm분 ss초') + "]  놀이기구 공지 데이터 갱신 완료 . ");
    })
    .catch((err) => {
        console.log(err);
    })  
}

exports.calculateWaitMinute = calculateWaitMinute;
exports.refreshNotices = refreshNotices;
exports.refreshLosts = refreshLosts;
exports.removeReservation = removeReservation;
exports.moveFirstReservationIntoWait = moveFirstReservationIntoWait;
exports.changeBoarding = changeBoarding;
exports.startTodayDate = startTodayDate;
exports.setAttractions = setAttractions;
exports.refreshWaitTimeAttractions = refreshWaitTimeAttractions;