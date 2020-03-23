// Route : POST, GET 등 REST API를 통해 값을 가져와서 활용 및 리턴
const router = require('express').Router();
const ticketModel = require('../model/ticketModel');
const userModel = require('../model/userModel');
const static = require('../static');
const util = require('../util');

// 티켓 데이터 추가
router.post('/addTicket', (req, res) => {
    const ticket_code = req.body.ticketCode;
    var nfc_uid = req.body.nfcUid;
    // const temp = static.moment();
    // const ttemp = new Date().toLocaleString("ko-KR", {timeZone: "Asia/Seoul"});
    const issue_date = static.moment().valueOf();
    // const temp3 = temp.unix();
    const temp5 = static.moment().format('YYYY-MM-DD HH:mm:ss');
    // const issue_date = new Date().getTime();
    // var temp = issue_date + issue_date;
    // console.log(temp);
    const temp = static.moment({hour: 0}).valueOf();
    const temp2 = static.moment({hour: 0}).format('YYYY-MM-DD HH:mm:ss');
    const temp3 = new Date(2020, 3, 5, 0, 0, 0, 0);
    // const temp4 = static.moment([2020, 2, 5, 0, 0, 0, 0]).valueOf();
    // console.log(temp);
    // if(!nfc_uid) {  // null check
    //     nfc_uid = null;
    // }
    ticketModel.addTicket(ticket_code, issue_date)
    .then(_ => {
        res.sendStatus(200);
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    })
}) 

// 티켓 등록
router.post('/registTicket', (req, res) => {
    const ticket_code = req.body.ticketCode;
    const nfc_uid = req.body.nfcUid;
    // const reg_date = new Date().getTime();
    const reg_date = static.moment().valueOf();
    const token_id = req.body.tokenId;

    // USER DB에 UID가 이미 존재하는지 확인
    userModel.existUser(nfc_uid)
    .then(result => {
        if(!result) {   // 존재하지 않으면
            // USER DB 생성
            return userModel.addUser(nfc_uid, reg_date, token_id)
        }
        else {
            // USER DB 안에 존재하는 nfc_uid 데이터의 티켓 등록 날짜 제거
            return userModel.updateRegDateInUser(nfc_uid, reg_date, token_id)
        }
    })
    .then(_ => {
        ticketModel.existTicket(ticket_code)
        .then(result => {
            if(result.length === 0) {   // 존재하지 않으면
                res.json({result : 'ticket code does not exist!'});
            }
            else {
                if(result[0].nfc_uid) {    // 이미 등록된 티켓인 경우
                    res.json({result : 'already ticket has registed!'});
                }
                else {
                    // ticket DB 안에 nfc_uid 삽입
                    ticketModel.insertUidInTicket(nfc_uid, ticket_code)
                    .then(_ => {
                        res.json({result : 'success', registDate : reg_date});
                    })
                }                
            }
        })
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    });
})

// 티켓 등록 조회
router.post('/getTodayRegisteredTicket', (req, res) => {
    const nfc_uid = req.body.nfcUid;

    ticketModel.getTodayRegisteredTicket(nfc_uid, util.startTodayDate)
    .then(result => {
        if(result.length == 0) {   // 존재하지 않으면
            res.sendStatus(400);
            console.log("존재 X");
        }
        else {
            res.json(result[0]);
        }
    })
    .catch((err) => {
        res.sendStatus(500);
        console.log(err);
    });
})

module.exports = router; // router 객체 안에 모든 함수가 넣어져있고, 이를 모듈화하면서 다른 곳에서 사용이 가능하다.