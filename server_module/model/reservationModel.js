const static = require('../static');
const util = require('../util');
const query = require('../query');
const db = require('../db');

exports.getReservation = (nfc_uid) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.getReservation, [nfc_uid]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.addReservation = (nfc_uid, order, attr_code) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.addReservation, [nfc_uid, order, attr_code]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.getFirstReservation = (nfc_uid) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.getFirstReservation, [nfc_uid]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });  
}

exports.getLastOrder = (nfc_uid) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.getLastOrder, [nfc_uid]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });  
}

exports.removeReservation = (nfc_uid, reservation_order) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.removeReservation, [nfc_uid, reservation_order]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.sortReservation = (nfc_uid, reservation_order) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.sortReservation, [nfc_uid, reservation_order]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.changeReservation = (attr_code, nfc_uid, reservation_order) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.changeReservation, [attr_code, nfc_uid, reservation_order]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.getCoordinateOfReservation = (nfc_uid) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.getCoordinateOfReservation, [nfc_uid]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}