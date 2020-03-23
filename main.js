// LOAD PACKAGES
const DB = require('./server_module/db');
const static = require('./server_module/static');
const util = require('./server_module/util');
const ticketModel = require('./server_module/model/ticketModel');
const userModel = require('./server_module/model/userModel');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
var express = require('express');

// GET OBJECT
const app = express();
const db = new DB.main();

// SERVER SETTING(CONFIGURE SERVER)
// URL encoded 형식 여부(사용하게 되면)
// json 형식으로 받으면 req.body에 저장하기.
// ex) name=leehaewon&book=node 를 받게된다면 req.body에 { name : 'leehaewon', book : 'node' }
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(function(req, res, next) {
//     next(createError(404));
// })

// RUN SERVER
var port = process.env.PORT || 8000;
var server = app.listen(port, static.serverURL, function(){
    console.log("Express server has started on port " + port)
   });

// CONFIGURE ROUTER
app.use('/ticket', require('./server_module/route/ticketRoute'));
app.use('/user', require('./server_module/route/userRoute'));
app.use('/attr', require('./server_module/route/attractionRoute'));
app.use('/reservation', require('./server_module/route/reservationRoute'));
app.use('/notice', require('./server_module/route/noticeRoute'));
app.use('/losts', require('./server_module/route/lostsRoute'));

// DB에 저장된 모든 놀이기구 데이터 가져와 서버에 저장
util.setAttractions();


/* 서버 내부 데이터 갱신 ScheduleJob */
// 놀이기구 대기 시간 일정 주기로 갱신(놀이기구 전체 남은 대기시간 별도 메모리에 저장하기 위한 함수 호출)
// 10초 마다
const refreshWaitTimeAttraction = schedule.scheduleJob('*/10 * * * * *', () => {
    util.refreshWaitTimeAttractions();
    console.log("******** 놀이기구 대기 시간 갱신 : " + static.moment().format('MM월 DD일, HH시 mm분 ss초') + "\n");
    if(util.allAttraction != null) {
        util.allAttraction.forEach(obj => {
                console.log(obj.name + "의 대기시간은 " + obj.wait_minute + " 입니다.");
                console.log(obj.name + " 놀이기구가 "+ obj.check_remain_minute + " 분 남았을 때의 대기 인원 수 : " + obj.count_remain_time);
        })
    }
    console.log("_________________________________________________________________");
});

// 실제 빠른 주기로 탑승 여부를 갱신하며 FCM 보내는 함수(30초 마다)
const changeBoarding = schedule.scheduleJob('*/30 * * * * *', () => {
    console.log("******** 놀이기구 별 탑승 여부 갱신 : " + static.moment().format('MM월 DD일, HH시 mm분 ss초') + "\n");
    util.changeBoarding();
    console.log("_________________________________________________________________");
})

// 공지 및 이벤트 갱신 함수(10분 마다)
const refreshLosts = schedule.scheduleJob('*/30 * * * * *', () => {
    console.log("******** 공지 및 이벤트 갱신 : " + static.moment().format('MM월 DD일, HH시 mm분') + "\n");
    util.refreshNotices();
    if(util.notices != null) {
        util.notices.forEach(obj => {
            console.log(obj.title);
            console.log(obj.context);
        })
    }
    console.log("_________________________________________________________________");
})

// 분실물 갱신 함수(5분 마다)
const refreshNotices = schedule.scheduleJob('*/30 * * * * *', () => {
    console.log("******** 분실물 갱신 : " + static.moment().format('MM월 DD일, HH시 mm분') + "\n");
    util.refreshLosts();
    if(util.losts != null) {
        util.losts.forEach(obj => {
            console.log("분류 - " + obj.classification + " , 이름 - " + obj.name);
            console.log("분실 장소 - " + obj.location);
        })
    }
    console.log("_________________________________________________________________");
})



/* FCM 알림 테스트 코드 */
// var token = "eHXtpheiSGe7WhLOar6E2A:APA91bFc468DYVncmcvQ3AprlzWjqSjRoSTKzWjkrWmF6L3lwbp_tarKlJHzJjAS1EGK0L4D8QylCF8bi8NihA6pr6M9C0qzyCo5IoTH9qElx-3cIcMrum2cpM7tLj-OVhPFqKktsYys";
// var message = {
//     data : {
//       body: '1시간남았다..',
//       title: "우리의 로떼정보통신"
//     },
//     token: token
//   };

// // Send a message to the device corresponding to the provided
// // registration token.
// static.admin.messaging().send(message)
// .then((response) => {
//     // Response is a message ID string.
//     console.log('Successfully sent message:', response);
// })
// .catch((error) => {
//     console.log('Error sending message:', error);
// });


/* test */



// var attr_code = 11;
// var limit = 90;
// userModel.getImpossibleBoarding(attr_code, limit)
//         .then(tokens => {
//             if(tokens.length === 0) {
//                 console.log("getImpossibleBoarding failed!");
//             }
//             else {
//                 var tokensArr = [];
//                 tokens.forEach(ele => {
//                     tokensArr.push(ele.token_id);
//                 })
//                 // console.log(tokensArr);
                
//                 // var result = Object.keys(tokens).map(function(key) {
//                 //     return [tokens[key].token_id];
//                 // })
//                 // var arr = Object.values(tokens);
//                 // console.log(result);
//                 // console.log(arr);
//             }
//         })
//         .catch((err) => {
//             console.log(err);
//         })



/* temporary */
// 임시로 만든 티켓 생성 코드
var ticket_code = '1111-1111-1111-';
var ticket_temp = 1111;
// schedule.scheduleJob('*/1 * * * * *', () => {
//     const issue_date = static.moment().valueOf();
//     console.log("티켓 생성 완료 : " + ticket_temp);
//     var temp = ticket_code + String(ticket_temp);
//     ticket_temp += 1;
//     ticketModel.addTicket(temp, issue_date)
// })

// 임시로 만든 티켓 등록 코드
// var nfc_uid = 'ghost';
// var uid_temp = 1;
// var token_id = 1;
// schedule.scheduleJob('*/1 * * * * *', () => {
//     var temp = nfc_uid + String(uid_temp);
//     const reg_date = static.moment().valueOf();
//     var temp2 = ticket_code + String(ticket_temp);
//     userModel.addUser(temp, reg_date, token_id);
//     ticketModel.insertUidInTicket(temp, temp2);
//     uid_temp += 1;
//     token_id += 1;
//     ticket_temp += 1;
//     console.log("티켓 등록 완료 : " + nfc_uid + "" + uid_temp);
// })

// 임시로 만든 대기 신청 코드
// var nfc_uid = 'ghost';
// var uid_temp = 112;
// var attr_code = 11;
// schedule.scheduleJob('*/1 * * * * *', () => {
//     var temp = nfc_uid + String(uid_temp);
//     const req_time = static.moment().valueOf();
//     userModel.insertWaitAttr(attr_code, req_time, temp);
//     uid_temp += 1;
//     console.log("대기 신청 완료 : " + temp);
// })