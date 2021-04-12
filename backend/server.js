const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 3000;
const endPointRoot = "/api/v1"

const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: '3306',
    password: '123456',
    database: 'dongle'
})

db.connect(err => {
    if (err) throw err;
    console.log("Connected to DB!");
})

db.promise = (sql) => {
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) { reject(new Error()); }
            else { resolve(result); }
        })
    })
}

// Middleware
const RequestLogger = (req, res, next) => {
    res.on("finish", () => {
        console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`)
        if (req.url.includes(endPointRoot)) {
            switch (req.method) {
                case 'GET':
                    db.query("UPDATE requests SET gets = gets + 1", (err, result) => {
                        if (err) throw err;
                    })
                    break;
                case 'POST':
                    db.query("UPDATE requests SET posts = posts + 1", (err, result) => {
                        if (err) throw err;
                    })
                    break;
                default:
                    console.log("none")
            }
        }
    })
    next();
}

app.use(RequestLogger)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://www.richardisa.com')
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    next();
})
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/frontend/', express.static(path.join(__dirname, '../frontend')))
app.use('/build/', express.static(path.join(__dirname, '../node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, '../node_modules/three/examples/jsm')))
app.use('/dat.gui/', express.static(path.join(__dirname, '../node_modules/dat.gui')))

app.get(endPointRoot + "/admin", (req, res) => {
    db.promise("SELECT * FROM apikey WHERE apikey1='" + req.query.apikey + "'")
        .then((result) => {
            if (result.length > 0) {
                res.sendFile(path.join(__dirname, '../frontend/admin.html'))
            } else {
                throw '401 Wrong api key!'
            }
        }).catch((err) => {
            console.log(err)
            res.status(401).send()
        })
})

app.post(endPointRoot + "/admin", (req, res) => {
    db.promise("SELECT * FROM apikey WHERE apikey1='" + req.query.apikey + "'")
        .then((result) => {
            if (result.length > 0) {
                const sql = "SELECT * FROM requests"
                db.query(sql, (err, result) => {
                    if (err) throw err;
                    res.status(200).send(result)
                })
            } else {
                throw '401 Wrong api key!'
            }
        }).catch((err) => {
            console.log(err)
            res.status(401).send()
        })
})

app.post(endPointRoot + "/login", async (req, res) => {
    let email = req.body.email
    let password = req.body.password
    let apikey = req.query.apikey
    db.promise(`SELECT * FROM user WHERE email= '${email}'`)
        .then((result) => {
            console.log(result)
            if (result.length == 0) {
                throw "Login failed, invalid email or password!"
            } else {
                const success = bcrypt.compareSync(password, result[0].password)
                if (success) {
                    res.send({ message: "SuperSecretKey", status: 200 })
                } else {
                    res.send({ message: "Login failed, invalid email or password!", status: 401 })
                }
            }
        }).catch((err) => {
            console.log(err)
        })
})

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

app.get(endPointRoot + '/pins', (req, res) => {
    db.promise("SELECT * FROM apikey WHERE apikey1='" + req.query.apikey + "'")
        .then((result) => {
            if (result.length > 0) {
                db.promise(`SELECT * FROM pin`)
                    .then((result) => {
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).send(JSON.stringify(result));
                    }).catch((err) => {
                        console.log(err)
                        res.send(401).send()
                    })
            } else {
                throw '401 Wrong api key!'
            }
        }).catch((err) => {
            console.log(err)
            res.status(401).send()
        })
})

app.get(endPointRoot + "/documentation", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/documentation/index.html'))
})

app.post(endPointRoot + '/newPin', function (req, res) {
    db.promise("SELECT * FROM apikey WHERE apikey1='" + req.query.apikey + "'")
        .then((result) => {
            if (result.length > 0) {
                const lat = req.body.lat
                const lon = req.body.lon
                const contentType = req.body.contentType
                const pinContent = req.body.pinContent
                const sql = `INSERT INTO pin (type, content, lat, lon) VALUES (${contentType}, "${pinContent}", ${lat}, ${lon})`;
                db.query(sql, (err, result) => {
                    if (err) throw err
                    res.status(200).send()
                })
            } else {
                throw '401 Wrong api key!'
            }
        }).catch((err) => {
            console.log(err)
            res.status(401).send()
        })
})

app.put(endPointRoot + '/editPin', function (req, res) {
    db.promise("SELECT * FROM apikey WHERE apikey1='" + req.query.apikey + "'")
        .then((result) => {
            if (result.length > 0) {
                const id = req.body.id;
                const lat = req.body.lat
                const lon = req.body.lon
                const contentType = req.body.contentType
                const pinContent = req.body.pinContent
                const sql = `UPDATE pin SET type = ${contentType}, content = "${pinContent}", lat = ${lat}, lon = ${lon} WHERE id = ${id}`;
                db.query(sql, (err, result) => {
                    if (err) throw err
                    res.status(200).send()
                })
                db.query("UPDATE requests SET puts = puts + 1", (err, result) => {
                    if (err) throw err;
                })
            } else {
                throw '401 Wrong api key!'
            }
        }).catch((err) => {
            console.log(err)
            res.status(401).send()
        })
})

app.delete(endPointRoot + '/deletePin', function (req, res) {
    db.promise("SELECT * FROM apikey WHERE apikey1='" + req.query.apikey + "'")
        .then((result) => {
            if (result.length > 0) {
                const id = req.body.id;
                const sql = `DELETE FROM pin WHERE id = ${id}`;
                db.query(sql, (err, result) => {
                    if (err) throw err
                    res.status(200).send()
                })
                db.query("UPDATE requests SET deletes = deletes + 1", (err, result) => {
                    if (err) throw err;
                })
            } else {
                throw '401 Wrong api key!'
            }
        }).catch((err) => {
            console.log(err)
            res.status(401).send()
        })
});

app.get(endPointRoot + '/pinIDs', function (req, res) {
    db.promise("SELECT * FROM apikey WHERE apikey1='" + req.query.apikey + "'")
        .then((result) => {
            if (result.length > 0) {
                db.promise(`SELECT id FROM pin`)
                    .then((result) => {
                        console.log(JSON.stringify(result));
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).send(JSON.stringify(result));
                    }).catch((err) => {
                        console.log(err)
                    })
            } else {
                throw '401 Wrong api key!'
            }
        }).catch((err) => {
            console.log(err)
        })
})

app.post(endPointRoot + '/getPin', function (req, res) {
    db.promise("SELECT * FROM apikey WHERE apikey1='" + req.query.apikey + "'")
        .then((result) => {
            if (result.length > 0) {
                const id = req.body.id;
                const sql = `SELECT * FROM pin WHERE id = ${id}`;
                db.promise(sql)
                    .then((result) => {
                        console.log(JSON.stringify(result));
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).send(JSON.stringify(result));
                    }).catch((err) => {
                        console.log(err);
                    })
            } else {
                throw '401 Wrong api key!'
            }
        }).catch((err) => {
            console.log(err)
        })
})

app.listen(PORT, () => {
    console.log("Server on port " + PORT);
})