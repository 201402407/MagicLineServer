const router = require('express').Router();
const reservationModel = require('../model/reservationModel');
const util = require('../util');

// 예약 테이블에 데이터 추가
router.post('/addReservation', (req, res) => {
    const nfc_uid = req.body.nfcUid;
    const attr_code = req.body.attrCode;
    let order = 1;

    // Order(순번) 얻어오기
    reservationModel.getLastOrder(nfc_uid)
    .then(result => {
        if(result.length != 0) {   // 기존에 예약 존재
            console.log(result[0].reservation_order);
            order = result[0].reservation_order + 1;
        }
        return reservationModel.addReservation(nfc_uid, order, attr_code)
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

router.post('/removeReservation', (req, res) => {
    const nfc_uid = req.body.nfcUid;
    const reservation_order = req.body.reservationOrder;
    util.removeReservation(nfc_uid, reservation_order)
    res.json({result : 'success'});
    // if(util.removeReservation(nfc_uid, reservation_order)) {
    //     res.sendStatus(200);
    // }
    // else {
    //     console.log("asd");
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
            return res.sendStatus(400);
            console.log("추천 존재 X");
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
router.post('/getReservation', (req, res) => {
    const nfc_uid = req.body.nfcUid;
    reservationModel.getReservation(nfc_uid)
    .then(result => {
        if(result.length === 0) {   // 존재하지 않음
            console.log("asd");
        }
        else {
            result.forEach(element => {
                var attr = util.allAttraction.find((item, idx) => {
                    return item.attr_code === element.attr_code;
                });
                element.name = attr.name;
                element.img_url = attr.img_url;
                element.wait_minute = attr.wait_minute;
                // console.log(attr.name + "'s waitTime is " + Math.ceil(attr.wait_minute));
            });
            res.send(result);
        }
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
})

module.exports = router; // router 객체 안에 모든 함수가 넣어져있고, 이를 모듈화하면서 다른 곳에서 사용이 가능하다.