const express = require('express');
const mysql = require('mysql');
const path = require('path');

const conn = mysql.createConnection({
})

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/frontend/', express.static(path.join(__dirname, '../frontend')))
app.use('/build/', express.static(path.join(__dirname, '../node_modules/three/build')))
app.use('/jsm/', express.static(path.join(__dirname, '../node_modules/three/examples/jsm')))
app.use('/dat.gui/', express.static(path.join(__dirname, '../node_modules/dat.gui')))
// 3 POST
// 2 DELETE
// 2 PUT
// 1 GET

app.get("/color", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

app.get("/shape", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

app.get("/gallery", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/admin.html'))
})

app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'))
})

app.listen(3030, () => {
    console.log("Server on port 3030");
})