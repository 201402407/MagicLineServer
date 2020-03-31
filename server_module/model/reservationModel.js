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

exports.getReservationAttrCode = (nfc_uid) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.getReservationAttrCode, [nfc_uid]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.addReservation = (nfc_uid, order, attr_code, reg_date) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.addReservation, [nfc_uid, order, attr_code, reg_date]);
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

exports.sortReservationAfterRemove = (nfc_uid, reservation_order) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.sortReservationAfterRemove, [nfc_uid, reservation_order]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.sortReservationAfterInsert = (nfc_uid, reservation_order) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.sortReservationAfterInsert, [nfc_uid, reservation_order]);
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

exports.setReservationFlag = (reg_date) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.setReservationFlag, [reg_date]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
} 

exports.getReservationCountOfFirstOrder = (attr_code) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.getReservationCountOfFirstOrder, [attr_code]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
} 