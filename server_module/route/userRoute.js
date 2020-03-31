const router = require('express').Router();
const userModel = require('../model/userModel');
const static = require('../static');
const util = require('../util');

// exports.addUser = 'INSERT INTO user SET nfc_uid = ?, reg_date = ?, attr_code = ?, req_time = ?';    // user DB 추가

// USER DB 생성
// router.post('/addUser', (req, res) => {
//     var nfc_uid = req.body.nfcUid;
//     const reg_date = new Date().getTime();
//     userModel.addUser(ticket_code, nfc_uid)
//     .then(_ => {
//         res.json({result : 1});
//         res.sendStatus(200);
//     })
//     .catch((err) => {
//         res.json({result : 0});
//         console.log(err);
//         // res.status(500).send(err);
//     })
// }) 

router.post('/insertWaitAttr', (req, res) => {
    const nfc_uid = req.body.nfcUid;
    const attr_code = req.body.attrCode;

    // 해당 사용자가 기존 대기 신청이 존재하는지 파악
    userModel.existWaitAttr(nfc_uid)
    .then(result => {   
        if(result.length === 0) {   // 존재하지 않으면 진행
            console.log("사용자 등록 확인 실패. 티켓 등록 필요");
            return res.json({result : '사용자 등록 확인 실패. 티켓 등록 필요'});
        }
        else {
            if(result[0].attr_code && result[0].WAIT_FLAG == 0) {  // 시간 초과된 신청(현재 날의 이전에 신청한 대기)
                console.log("현재 대기 신청중인 놀이기구 존재");
                return res.json({result : '현재 대기 신청중인 놀이기구 존재'});
            }
            else {
                const req_time = static.moment().valueOf();

                // 놀이기구 대기에 필요한 정보 삽입
                userModel.insertWaitAttr(attr_code, req_time, nfc_uid)
                .then(result => {   
                    if(result.affectedRows > 0) {   // 대기 신청 정상 완료
                        res.status(200).json({result : 'success'});
                    }
                    else {
                        console.log("대기 신청 UPDATE 실패");
                        res.sendStatus(400);
                    }
                })
            }
        }
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
})

router.post('/removeWaitAttr', (req, res) => {
    const nfc_uid = req.body.nfcUid;
    
    userModel.removeWaitAttr(nfc_uid)
    .then(result => {
        if(result.affectedRows > 0) {   // 대기 삭제 정상 완료
            util.moveFirstReservationIntoWait(nfc_uid);
            return res.status(200).json({result : 'success'});
        }
        else {
            console.log("신청한 대기 삭제 실패");
            res.sendStatus(400);
        }
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
})

router.post('/nfcTagging', (req, res) => {
    const nfc_uid = req.body.nfcUid;
    const attr_code = req.body.attrCode;
    
    // 놀이기구 코드와 일치하는 지 체크
    userModel.getWaitAttrCode(nfc_uid)
    .then(code => {
        console.log(code.length);
        if(code.length == 0) {   
            return res.send({result : '티켓 등록도 안되어있음..'});
        }
        if(!code[0].attr_code) {  // 대기 신청 존재하지 않으면
            return res.send({result : '대기 신청 존재하지 않음.'});
        }
        // if(code[0].attr_code != attr_code) {
        //     return res.send({result : '해당 놀이기구와 대기 신청한 놀이기구가 다름.'});
        // }

        // 대기 탑승 여부 체크
        userModel.getBoarding(nfc_uid)
        .then(boarding => {
            if(!boarding[0].boarding) {
                return res.send({result : '현재 탑승 불가능'});
            }
    
            // 대기 삭제(여기까지)
            userModel.removeWaitAttr(nfc_uid)
            .then(result => {
                if(result.affectedRows > 0) {   // 대기 삭제까지 정상 완료
                    // 예약 놀이기구 당겨서 대기로 변경
                    util.moveFirstReservationIntoWait(nfc_uid);
                    return res.status(200).json({result : 'success'});
                }
                else {
                    console.log("신청한 대기 삭제 실패");
                    return res.sendStatus(400);
                }
            })
        })
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
    
})

module.exports = router; // router 객체 안에 모든 함수가 넣어져있고, 이를 모듈화하면서 다른 곳에서 사용이 가능하다.