const router = require('express').Router();
const ticketModel = require('../model/ticketModel');
const userModel = require('../model/userModel');
const attractionModel = require('../model/attractionModel');
const reservationModel = require('../model/reservationModel');
const static = require('../static');
const util = require('../util');

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
            res.sendStatus(500);
        }
        else {
            util.attractions = attractions;
            res.send(attractions);
        }
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
})

// 대기 시간을 포함한 모든 놀이기구 데이터 전송
router.get('/getAllAttractionsWithWaitTime', (req, res) => {
    // 대기 신청중인 놀이기구 정보 가져오기
    // 예약 신청중인 놀이기구 정보 가져오기
    // 대기 시간 포함 모든 놀이기구 데이터 전송
    // 테스트 해보기
    if(Object.keys(util.allAttraction).length === 1) {  // meta data만 있는 경우 (값이 없으면 0인가?)
        console.log("놀이기구 is empty");
    }
    else {
        res.json(util.allAttraction);
    }
})

// 대기 신청중인 놀이기구 고유코드 전송
router.post('/getWaitAttrCode', (req, res) => {
    const nfc_uid = req.body.nfcUid;
    userModel.getWaitAttrCode(nfc_uid)
    .then(result => {
        if(result.length === 0) {   // 존재하지 않음
            res.sendStatus(400);
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

// 대기 신청 현황 페이지에 필요한 대기 신청 놀이기구 정보 및 대기 시간 전송
router.post('/getWaitStatusInfo', (req, res) => {
    const nfc_uid = req.body.nfcUid;
    attractionModel.getWaitStatusInfo(nfc_uid)
    .then(result => {
        if(result.length === 0) {   // 존재하지 않음
            res.sendStatus(400);
        }
        else {
            var userAttr = result[0];
            var attr = util.allAttraction.find((item, idx) => {
                return item.attr_code == userAttr.attr_code;
            });
            userAttr.wait_minute = attr.wait_minute;
            res.send(userAttr);
        }
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
})


module.exports = router;