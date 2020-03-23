const router = require('express').Router();
const noticeModel = require('../model/noticeModel');
const static = require('../static');
const util = require('../util');

// 공지사항 데이터 추가
router.post('/addNotice', (req, res) => {
    const title = req.body.title;
    const context = req.body.context;
    const reg_date = static.moment().valueOf();

    noticeModel.addNotice(title, context, reg_date)
    .then(result => {
        if(result.affectedRows > 0) {   // INSERT 정상 처리
            res.sendStatus(200);
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

// 공지사항 데이터 전송
router.get('/getAllNotice', (req, res) => {

    if(util.notices.length === 0) {  // meta data만 있는 경우 (값이 없으면 0인가?)
        console.log("공지사항 is empty");
        res.sendStatus(400);
    }
    else {
        res.json(util.notices);
    }
})

module.exports = router; // router 객체 안에 모든 함수가 넣어져있고, 이를 모듈화하면서 다른 곳에서 사용이 가능하다.