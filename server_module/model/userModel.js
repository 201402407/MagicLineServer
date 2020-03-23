const static = require('../static');
// const util = require('../util');
const query = require('../query');
const db = require('../db');

exports.addUser = (nfc_uid, reg_date, token_id) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.addUser, [nfc_uid, reg_date, token_id]);
    })
    .then(_ => {
        return DB.close(); 
    })
    .catch(err => {
        console.log(err);
    });
}

// @return : result(Boolean) => true : 존재. false : 존재하지 않음.
exports.existUser = (nfc_uid) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.existUser, [nfc_uid]);
    })
    .then(result => {
        DB.close();
        if(result.length === 0) {   // 존재하지 않음
            return false;
        }
        return true;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.updateRegDateInUser = (nfc_uid, reg_date) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.updateRegDateInUser, [reg_date, nfc_uid]);
    })
    .then(_ => {
        return DB.close();
    })
    .catch(err => {
        console.log(err);
    });
}

// 오늘 티켓 등록한 사람들의 데이터를 가져오기
exports.getTodayAllUsersWait = (startTodayDate) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.getTodayAllUsersWait, [startTodayDate]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.getWaitAttrCode = (nfc_uid) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.getWaitAttrCode, [nfc_uid]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.existWaitAttr = (nfc_uid) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.existWaitAttr, [nfc_uid]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.insertWaitAttr = (attr_code, req_time, nfc_uid) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.insertWaitAttr, [attr_code, req_time, nfc_uid]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.setPossibleBoarding = (attr_code, limit) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.setPossibleBoarding, [attr_code, limit]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.getImpossibleBoarding = (attr_code, limit) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.getImpossibleBoarding, [attr_code, limit]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.getCountUserWait = (nfc_uid, attr_code) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.getCountUserWait, [nfc_uid, attr_code]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.removeWaitAttr = (nfc_uid) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.removeWaitAttr, [nfc_uid]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

exports.getBoarding = (nfc_uid) => {
    const DB = new db.main();
    return DB.conn()
    .then(_ => {
        return DB.query(query.getBoarding, [nfc_uid]);
    })
    .then(result => {
        DB.close();
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}