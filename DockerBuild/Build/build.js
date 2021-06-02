#!/usr/bin/env node
const { exec, execSync } = require("child_process");
const { existsSync, writeFileSync, readFileSync } = require("fs");
const { resolve } = require("path");

// Setting Docker Build
var load_config = {
    image: "dockerruns"
}

console.log(load_config.arch);
const command = `docker buildx build --file Dockerfile --platform=${process.env.arch} -t ${load_config.image.toLocaleLowerCase()} .`
console.log(command);
const build = exec(command, {cwd: resolve(__dirname), maxBuffer: Infinity});
function out(data){
    data = `${data}`.split("\n").filter(data=>{return (data !== "")})
    for (let log of data) console.log(`${arch}: ${log}`);
}
build.stdout.on("data", data => out(data));
build.stderr.on("data", data => out(data));
build.on("exit", code => {if (code !== 0) process.exit(code)});