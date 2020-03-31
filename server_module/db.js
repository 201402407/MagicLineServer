const mariadb = require('mariadb');

// DB랑 연결하기 위한 const 변수
const mainPool = mariadb.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password : '1234',
    database: 'magic_line',
    connectionLimit: 15
});

class main {
    conn() {    // DB와 연결
        return new Promise((resolve, reject) => {
            if(this.connection !== null && this.connection !== undefined) {
                this.close();
                reject('Connection can not be duplicated.');
            } else { resolve(); }
        }).then(_ => {
            return mainPool.getConnection();
        }).then(conn => {
            this.connection = conn;
            return Promise.resolve();
        }).catch(err => {
            this.close();
            return Promise.reject(err);
        });
    }
    query(sql, args) {  // 쿼리로 DB에 요청하는 함수
        return new Promise((resolve, reject) => {
            if(this.connection === undefined || this.connection === null) {
                reject('Not Connected');
            } else { resolve(); }
        }).then(_ => {
            return this.connection.query(sql, args);
        }).catch(err => {
            this.close();
            return Promise.reject(err);
        });
    }
    close() {   // 쿼리로 DB에 요청하고 받으면 DB를 닫는 함수
        return new Promise((resolve) => {
            if(this.connection !== undefined && this.connection !== null) {
                this.connection.release();
                this.connection = null;
            }
            resolve()
        });
    }
}

// class main {
//     async conn() {
//         try {
//             if(this.connection !== null && this.connection !== undefined) {
//                 await this.close();
//                 throw 'Connection can not be duplicated.';
//             }
//             this.connection = await mainPool.getConnection();
//             return Promise.resolve();
//         } catch(e) {
//             console.error(e);
//         }
//     }
//     query(sql, args) {
//         return new Promise((resolve, reject) => {
//             if(this.connection === undefined || this.connection === null) {
//                 reject('Not Connected');
//             } else { resolve(); }
//         }).then(_ => {
//             return this.connection.query(sql, args);
//         }).catch(err => {
//             this.close();
//             return Promise.reject(err);
//         });
//     }
//     close() {
//         return new Promise((resolve) => {
//             if(this.connection !== undefined && this.connection !== null) {
//                 this.connection.release();
//                 this.connection = null;
//             }
//             resolve()
//         });
//     }
// }

exports.main = main;