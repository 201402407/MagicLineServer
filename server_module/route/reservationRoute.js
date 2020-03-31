const router = require('express').Router();
const reservationModel = require('../model/reservationModel');
const util = require('../util');
const async = require('async');
const static = require('../static');

// 예약 테이블에 데이터 추가
router.post('/addReservation', (req, res) => {
    const nfc_uid = req.body.nfcUid;
    const attr_code = req.body.attrCode;
    const reg_date = static.moment().valueOf();
    let order = 1;

    // Order(순번) 얻어오기
    reservationModel.getLastOrder(nfc_uid)
    .then(result => {
        if(result.length != 0) {   // 기존에 예약 존재
            console.log(result[0].reservation_order);
            order = result[0].reservation_order + 1;
        }
        return reservationModel.addReservation(nfc_uid, order, attr_code, reg_date);
    })
    // 예약 데이터 추가
    .then(result => {
        if(result.affectedRows > 0) {   // INSERT 정상 처리됨(UPDATE, DELETE도 사용 가능)
            res.send({result : "success"});
        }
        else {  // 에러 처리
            console.log("not inserted");
            res.sendStatus(400);
        }
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
})

// // 예약 데이터 삽입
// router.post('/moveReservation', (req, res) => {
//     const nfc_uid = req.body.nfcUid;
//     const attr_code = req.body.attrCode;
//     const prev_order = req.body.prevOrder;
//     const order = req.body.order;
//     const reg_date = static.moment().valueOf();

//     async.waterfall([
//         function(cb) {
//             util.removeReservation(nfc_uid, prev_order);
//             cb();
//         },
//         function(cb) {
//             reservationModel.addReservation(nfc_uid, order, attr_code, reg_date)
//             .then(result => {
//                 if(result.affectedRows > 0) {   // INSERT 정상 처리됨(UPDATE, DELETE도 사용 가능)
                    
//                     reservationModel.sortReservationAfterInsert(nfc_uid, order)
//                     .then(result => {
//                         if(result.affectedRows > 0) {   // INSERT 정상 처리됨(UPDATE, DELETE도 사용 가능)
//                             res.send({"result" : "success"});    
//                         }
//                         else {  // 에러 처리
//                             console.log("sortReservationAfterInsert is fall");
//                             res.sendStatus(400);
//                         }
//                     })
//                 }
//                 else {  // 에러 처리
//                     console.log("addReservation is fail");
//                     res.sendStatus(400);
//                 }
//             })
//             .catch((err) => {
//                 res.sendStatus(500);
//                 console.log(err);
//             })
//         }
//     ])
// })

router.post('/removeReservation', (req, res) => {
    const nfc_uid = req.body.nfcUid;
    const reservation_order = req.body.reservationOrder;
    util.removeReservation(nfc_uid, reservation_order);
    res.json({result : 'success'});
    // if(util.removeReservation(nfc_uid, reservation_order)) {
    //     res.sendStatus(200);
    // }
    // else {
    //     res.sendStatus(500);
    // }
})

router.post('/changeReservation', (req, res) => {
    const attrCodeArr = req.body.attrCodes;
    const nfc_uid = req.body.nfcUid;
    var checkUpdate = true;
    for(var i = 0; i < attrCodeArr.length; i++) {
        const attr_code = attrCodeArr[i];
        reservationModel.changeReservation(attr_code, nfc_uid, i + 1)
        .then(result => {
            if(result.affectedRows > 0) {   // UPDATE 정상 처리됨
                console.log("UPDATE Reservation 성공");
            }
            else {
                console.log("UPDATE Reservation 실패");
                checkUpdate = false;
            }
        })
        .catch((err) => {
            checkUpdate = false;
            res.sendStatus(500);
            console.log(err);
        })
    }
    if(checkUpdate) {
        res.json({result : 'success'});
    }
    else {
        res.sendStatus(500);
    }
})

router.post('/getDataForRecommend', (req, res) => {
    const nfc_uid = req.body.nfcUid;
    reservationModel.getCoordinateOfReservation(nfc_uid)
    .then(result => {
        if(result.length === 0) {
            console.log("추천 존재 X");
            return res.sendStatus(400);
        }
        else {
            // 서버 내 놀이기구 리스트 데이터에서 대기 시간 찾아 넣기
            result.forEach(data => {
                var attr = util.allAttraction.find((item, idx) => {
                    return item.attr_code === data.attr_code;
                });
                console.log(attr.wait_minute);
                data.wait_minute = attr.wait_minute; 
                console.log(data.wait_minute);
            })
            return res.json(result);
        }
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
})

// 예약 신청중인 놀이기구 정보 전송
// 예약 DB에서 nfcUid에 해당하는 모든 예약 데이터의 놀이기구 고유 코드 가져오기
router.post('/getReservationAttrCode', (req, res) => {
    const nfc_uid = req.body.nfcUid;
    reservationModel.getReservationAttrCode(nfc_uid)
    .then(result => {
        if(result.length === 0) {   // 존재하지 않음
            console.log("예약 신청 놀이기구 존재 X");
        }
        res.send(result);
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
})

// 현재 예약중인 정보 가져오기
router.post('/getReservation', (req, res) => {
    const nfc_uid = req.body.nfcUid;
    var redis = static.redis;

    reservationModel.getReservation(nfc_uid)
    .then(result => {
        if(result.length === 0) {   // 존재하지 않음
            console.log("예약 신청 놀이기구 존재 X");
        }
        else {
            var arr = new Array();
            async.forEachLimit(result, 1, function(ele, cb) {   // async 반복문
                async.waterfall([
                    function(callback) {
                        redis.hget(static.redisWaitMinuteName, ele.attr_code, (err, wait) => {
                            if(!err) {
                                // console.log(wait);
                                ele.wait_minute = Number(wait);
                                callback(null, ele);        
                            }
                        });
                    },
                    function(result, err) {
                        arr.push(result);
                        // console.log(arr.length);
                        cb();
                    }
                ]);
            },
            function(err){  // forEachLimit가 끝나면 들어오는 function
                if(err) {
                    res.sendStatus(500);
                    console.log(err);
                }
                else {
                    res.send(arr);
                    // console.log("getReservation For Loop Completed");
                }
            });   
        }
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
})

router.post('/recommendReservation', (req, res) => {
    const attrsArr = req.body.attrCodes;
    const redis = static.redis;
    console.log(attrsArr);
    async.waterfall([
        function(cb) {  // Redis의 놀이기구 데이터 가져오기
            redis.lrange(static.redisAttrName, 0, -1, (err, arr) => {
                if(err) {
                    console.log(err);
                }
                cb(null, arr);
            })
        },
        function(redisAttrs, cb) { 
            var reservationArr = new Array();

            async.forEachLimit(attrsArr, 1, function(attr, cb) { // 예약 놀이기구들 놀이기구 하나씩 For문
                var attr_code = attr.attr_code;
                var reservation_order = attr.reservation_order;
                async.waterfall([
                    function(cb) {  // 현재 대기 시간 가져오기
                        redis.hget(static.redisWaitMinuteName, attr_code, (err, wait) => {
                            if(err) {
                                console.log(err);
                            }
                            else {
                                cb(null, wait);
                            }
                        })
                    },
                    function(wait, err) { // 예상 대기 시간 계산
                        var attr_json = redisAttrs.find((item, idx) => {
                            return (JSON.parse(item)).attr_code == attr_code;
                        });
                        var attr_obj = JSON.parse(attr_json);
                        reservationModel.getReservationCountOfFirstOrder(attr_code)  // 해당 놀이기구 1순위 예약 개수 파악
                        .then(result => {
                            var count = result[0].count;
                            var reservation_wait_minute = util.calculateWaitMinute(attr_obj, count);
                            var obj = {
                                "attr_code" : attr_code,
                                "name" : attr_obj.name,
                                "reservation_order" : reservation_order,
                                "expect_wait_minute" : Number(reservation_wait_minute) + Number(wait)
                            };
                            reservationArr.push(obj);
                            cb();
                        })
                        .catch((err) => {
                            res.sendStatus(500);
                            console.log(err);
                        })
                    }
                ]);
            },
            function(err){  // forEachLimit가 끝나면 들어오는 function
                if(err) {
                    res.sendStatus(500);
                    console.log(err);
                }
                else {
                    res.send(reservationArr);
                    // console.log("getReservation For Loop Completed");
                }
            });
        }
    ])
})

    // attrCodeArr.forEach(attr => {
    //     reservationModel.getReservationCountOfFirstOrder(attr.attr_code)
    //     .then(result => {
    //         async.waterfall([
    //             function(cb) {  // Redis의 놀이기구 데이터 가져오기
    //                 redis.hget(static.redisWaitMinuteName, attr.attr_code, (err, wait) => {
    //                     if(err) {
    //                         console.log(err);
    //                     }

    //                 })
    //             },
    //             function(redisAttrs, callback) {    // 현재 대기 시간 가져오기
                    
    //             }
    //         ])
    //     })
    // })
    
// })

module.exports = router; // router 객체 안에 모든 함수가 넣어져있고, 이를 모듈화하면서 다른 곳에서 사용이 가능하다.