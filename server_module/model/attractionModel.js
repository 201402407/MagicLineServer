const static = require('../static');
// const util = require('../util');
const query = require('../query');
const db = require('../db');

exports.addAttraction = (name, personnel, run_time, start_time, end_time, location, coordinate, img_url, info) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.addAttraction, [name, personnel, run_time, start_time, end_time, location, coordinate, img_url, info]);
    })
    .then(_ => {
        return DB.close(); 
    })
    .catch(err => {
        console.log(err);
    });
}

exports.getAllAttraction = (_) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
       return DB.query(query.getAllAttraction);
    })
    .then(result => {
         DB.close(); 
         return result;
     })
    .catch(err => {
        console.log(err);
    });
}

exports.getWaitStatusInfo = (nfc_uid) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.getWaitStatusInfo, [nfc_uid]);
    })
    .then(result => {
         DB.close(); 
         return result;
     })
    .catch(err => {
        console.log(err);
    });
}