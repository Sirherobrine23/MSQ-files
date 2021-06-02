#!/usr/bin/env node
const { compile } = require("nexe");
const { resolve, join } = require("path");
const options = require("minimist")(process.argv.slice(2));
const nexeCopiler = {
    name: "Docker-Run-Build",
    build: true,
    input: resolve(__dirname, "index.js"),
    output: join(__dirname,  `DockerRunBuild_${process.platform}_${process.arch}`),
    resources: [
        "package*.json"
    ]
}
if (options.t || options.target) nexeCopiler.target = (options.t || options.target)
console.log(nexeCopiler);
// Build Binarie
compile(nexeCopiler).then(() => {console.log("success")})