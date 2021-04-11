const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 3000;
const endPointRoot = "/api/v1"

const app = express();

// Middleware
const RequestLogger = (req, res, next) => {
    res.on("finish", () => {
        // console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`)
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
                case 'PUT':
                    db.query("UPDATE requests SET puts = puts + 1", (err, result) => {
                        if (err) throw err;
                    })
                    break;
                case 'DELETE':
                    db.query("UPDATE requests SET deletes = deletes + 1", (err, result) => {
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
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    next();
})
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/frontend/', express.static(path.join('./')))
app.use('/build/', express.static(path.join(__dirname, '../node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, '../node_modules/three/examples/jsm')))
app.use('/dat.gui/', express.static(path.join(__dirname, '../node_modules/dat.gui')))

app.get(endPointRoot + "/admin", (req, res) => {
    db.promise("SELECT * FROM apikey WHERE apikey1='" + req.query.apikey + "'")
        .then((result) => {
            if (result.length > 0) {
                res.sendFile(path.join(__dirname, './admin.html'))
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
    db.promise(`SELECT * FROM user WHERE email= '${email}'`)
        .then((result) => {
            if (result.length == 0) {
                res.status(401).send()
                throw "Login failed, invalid email or password!"
            } else {
                bcrypt.compare(password, result[0].password)
                    .then((result) => {
                        if (result) {
                            res.status(200).send()
                        } else {
                            res.status(401).send()
                        }
                    })
            }
        }).catch((err) => {
            console.log(err);
        })
})

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, './index.html'))
})


app.get("/documentation", (req, res) => {
    res.sendFile(path.join(__dirname, './documentation/index.html'))
})


app.listen(PORT, () => {
    console.log("Server on port " + PORT);
})