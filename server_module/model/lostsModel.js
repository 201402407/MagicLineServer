const static = require('../static');
const util = require('../util');
const query = require('../query');
const db = require('../db');

exports.addLosts = (classification, name, location, get_date) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.addLosts, [classification, name, location, get_date]);
    })
    .then(result => {
        DB.close(); 
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.getRecentLosts = (_) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.getRecentLosts);
    })
    .then(result => {
        DB.close(); 
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}