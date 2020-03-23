require('moment-timezone');

const serverURL = "ec2-15-165-28-140.ap-northeast-2.compute.amazonaws.com"

// FCM 설정
const admin = require('firebase-admin');
var fcmAccount = require('./ghost-liner-firebase-adminsdk.json');
admin.initializeApp({
    credential : admin.credential.cert(fcmAccount)
});
exports.admin = admin;

// URL 주소
exports.serverURL = serverURL;

// 서울 로컬 타임존 설정
var moment = require('moment');
moment.tz.setDefault("Asia/Seoul");
exports.moment = moment;
