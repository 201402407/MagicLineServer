// Model은 DB 접근 및 데이터 리턴
const static = require('../static');
const util = require('../util');
const query = require('../query');
const db = require('../db');

exports.addTicket = (ticket_code, nfc_uid, issue_date) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.addTicket, [ticket_code, nfc_uid, issue_date]);
    })
    .then(_ => {
        return DB.close();
    })
    .catch(err => {
        console.log(err);
    });
}

exports.existTicket = (ticket_code) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.existTicket, [ticket_code]);
    })
    .then(result => {
        DB.close();
        return result;
    })
}

exports.insertUidInTicket = (nfc_uid, ticket_code) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.insertUidInTicket, [nfc_uid, ticket_code]);
    })
    .then(_ => {
        return DB.close();
    })
    .catch(err => {
        console.log(err);
    });
}

exports.getTodayRegisteredTicket = (nfc_uid, reg_date) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.getTodayRegisteredTicket, [nfc_uid, reg_date]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}