const express = require('express');
const mysql = require('mysql');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/color", (req, res) => {
    res.sendFile(path.join(__dirname + "/../frontend/index.html"))
})

app.get("/shape", (req, res) => {
    res.sendFile(path.join(__dirname + "/../frontend/index.html"))
})

app.get("/gallery", (req, res) => {
    res.sendFile(path.join(__dirname + "/../frontend/index.html"))
})

app.get("/home", (req, res) => {
    console.log(__dirname)
    res.sendFile(path.join(__dirname + "/../frontend/index.html"))
})

app.get("/", (req, res) => {
    console.log(__dirname)
    res.sendFile(path.join(__dirname + "/../frontend/index.html"))
})

app.listen(3030, () => {
    console.log("Server on port 3030");
})