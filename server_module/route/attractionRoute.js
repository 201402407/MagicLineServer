const router = require('express').Router();
const ticketModel = require('../model/ticketModel');
const userModel = require('../model/userModel');
const attractionModel = require('../model/attractionModel');
const reservationModel = require('../model/reservationModel');
const static = require('../static');
const JSON = require('JSON');
const util = require('../util');
const async = require('async');

// 놀이기구 데이터 추가
router.post('/addAttraction', (req, res) => {
    const run_time = req.body.runTime;
    const start_time = req.body.startTime;
    const end_time = req.body.endTime;
    const img_url = req.body.imgUrl;
    attractionModel.addAttraction(
        req.body.name, req.body.personnel, run_time, start_time,
         end_time, req.body.location, req.body.coordinate,
          img_url, req.body.info)
    .then(_ => {
        res.sendStatus(200);
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
}) 

// 모든 놀이기구 데이터 가져오기
router.get('/getAllAttraction', (req, res) => {
    attractionModel.getAllAttraction()
    .then(attractions => {
        if(attractions.length === 0) {
            console.log("empty attraction DB!");
        }
        res.send(attractions);
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
})

// 대기 시간을 포함한 모든 놀이기구 데이터 전송
router.get('/getAllAttractionsWithWaitTime', (req, res) => {
    var redis = static.redis;
    async.waterfall([
        function(callback) {
            redis.lrange(static.redisAttrName, 0, -1, (err, arr) => {
                if(!err) {
                    callback(null, arr);
                }
            });
        },
        function(arg, callback) {
            redis.hgetall(static.redisWaitMinuteName, (err, waits) => {
                if(!err) {
                    callback(null, arg, waits);
                }
            })
        },
        function(attrs, waits, callback) {
            var arr = new Array();
            attrs.forEach(attr_json => {
                var attr_obj = JSON.parse(attr_json);
                if(waits.hasOwnProperty(attr_obj.attr_code)) {
                    attr_obj.wait_minute = Number(waits[attr_obj.attr_code]);
                }
                else {
                    attr_obj.wait_minute = -1;
                }
                arr.push(attr_obj);
            })
            return res.send(arr);
        }
    ]);
})

// 대기 신청중인 놀이기구 고유코드 전송
router.post('/getWaitAttrCode', (req, res) => {
    const nfc_uid = req.body.nfcUid;
    userModel.getWaitAttrCode(nfc_uid)
    .then(result => {
        if(result.length === 0) {   // 존재하지 않음
            res.json({"attr_code" : 0});
        }
        else {
            res.json(result[0]);
        }
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
})

// 대기 신청한 놀이기구 남은 대기 시간 출력
router.post('/getWaitMinuteOfWaitAttr', (req, res) => {
    const nfc_uid = req.body.nfcUid;
    const attr_code = req.body.attrCode;

    userModel.getCountUserWait(nfc_uid, attr_code)
    .then(result => {
        if(result.length == 0) {
            res.sendStatus(400);
        }
        else {
            var count = result[0].counts;
            var redis = static.redis;
            redis.lrange(static.redisAttrName, 0, -1, (err, arr) => {
                if(err) {
                    console.log(err);
                    return res.sendStatus(400);
                }
                
                var attr = arr.find((item, idx) => {
                    return (JSON.parse(item)).attr_code === attr_code;
                })

                attr = JSON.parse(attr);

                if(!attr) {
                    return res.sendStatus(400);
                }
                var wait = util.calculateWaitMinute(attr, count);
                return res.json({"count": count, "wait_minute": wait});
            });
        }
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
})

// 대기 신청 현황 페이지에 필요한 대기 신청 놀이기구 정보 및 대기 시간 전송
router.post('/getWaitStatusInfo', (req, res) => {
    var redis = static.redis;
    const nfc_uid = req.body.nfcUid;
    // getCountUserWait
    attractionModel.getWaitStatusInfo(nfc_uid)
    .then(result => {
        if(result.length === 0) {   // 유저가 존재하지 않음
            return res.sendStatus(400);
        }
        else {
            var userAttr = result[0];
            if(!userAttr.attr_code) { // 대기 신청이 존재하지 않음
                return res.json({"attr_code" : 0});
            }

            return res.send(userAttr);
            // redis.hget(static.redisWaitMinuteName, userAttr.attr_code, (err, wait) => {
            //     if(!err) {
            //         console.log(wait);
            //         userAttr.wait_minute = wait;
            //         return res.send(userAttr);
            //     }
            //     else {
            //         console.log(err);
            //     }
            // });

            /* REDIS에서 데이터 빼오는 작업 vs DB에서 빼오는 작업 */
            // async.waterfall([
            //     function(callback) {
            //         redis.hget(static.redisWaitMinuteName, userAttr.attr_code, (err, wait) => {
            //             if(!err) {
            //                 console.log(wait);
            //                 callback(null, wait);
            //             }
            //             else {
            //                 console.log(err);
            //             }
            //         });
            //     },
            //     function(wait, callback) {
            //         redis.lrange(static.redisAttrName, 0, -1, (err, arr) => {
            //             if(err) {
            //                 console.log(err);
            //             }
            //             var attr = arr.find((item, idx) => {
            //                 return (JSON.parse(item)).attr_code == userAttr.attr_code;
            //             });
            //             var obj = JSON.parse(attr);
            //             obj.wait_minute = Number(wait);
            //             return res.send(obj);
            //         });
            //     }
            // ]);
           
            // redis.hget(static.redisWaitMinuteName, userAttr, (err, wait) => {
            //     redis.lrange(static.redisAttrName, 0, -1, (err, arr) => {
            //         var attr = arr.find((item, idx) => {
            //             return (JSON.parse(item)).attr_code == userAttr.attr_code;
            //         });
            //         console.log(attr);
            //         var attr_obj = attr;
            //         attr_obj.wait_minute = wait;
            //         return res.send(attr_obj);
            //     })
            // })

            // var attr = util.allAttraction.find((item, idx) => {
            //     return item.attr_code == userAttr.attr_code;
            // });
            // userAttr.wait_minute = attr.wait_minute;
            // res.send(userAttr);
        }
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
})


module.exports = router;