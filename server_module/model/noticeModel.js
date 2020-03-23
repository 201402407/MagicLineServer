const static = require('../static');
const util = require('../util');
const query = require('../query');
const db = require('../db');

exports.addNotice = (title, context, reg_date) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.addNotice, [title, context, reg_date]);
    })
    .then(result => {
        DB.close(); 
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.getTodayNotice = (reg_date) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.getTodayNotice, [reg_date]);
    })
    .then(result => {
        DB.close(); 
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}