const express = require('express');
const mysql = require('mysql');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("hello world");
})

app.listen(3030, () => {
    console.log("Server on port 3030");
})