#!/usr/bin/env node
const express = require('express');
const { writeFileSync } = require("fs");
const { join, resolve } = require("path");
const app = express();
const port = 2255;
const fileUpload = require("express-fileupload");

// Express Settings
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 * 1024 },
    "limitHandler": Infinity,
}));

// URi
app.post('/deb', (req, res) => {
    for (let file of Object.getOwnPropertyNames(req.files)){
        file = req.files[file];
        const fileSave = resolve(__dirname, "../../../", file.name);
        console.log("Save in: ", fileSave);
        writeFileSync(fileSave, Buffer.from(file.data))
    }
    res.send("ok")
});
app.listen(port, () => console.log(`listening on http://localhost:${port}`));