const router = require('express').Router();
const lostsModel = require('../model/lostsModel');
const static = require('../static');
const util = require('../util');
const JSON = require('JSON');

// 분실물 데이터 추가
router.post('/addLosts', (req, res) => {
    const classification = req.body.classification;
    const name = req.body.name;
    const location = req.body.location;
    const get_date = static.moment().valueOf();

    lostsModel.addLosts(classification, name, location, get_date)
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

// 분실물 데이터 전송
router.get('/getAllLosts', (req, res) => {
    var redis = static.redis;
    var arr = new Array();
    redis.hvals(static.redisLostsName, (err, obj) => {
        if(err) {
            return res.sendStatus(400);
        }
        obj.forEach(item => {
            arr.push(JSON.parse(item));
        })
        return res.send(arr);  
    })
})

module.exports = router; // router 객체 안에 모든 함수가 넣어져있고, 이를 모듈화하면서 다른 곳에서 사용이 가능하다.