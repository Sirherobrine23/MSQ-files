#!/usr/bin/env node
const { exec, execSync } = require("child_process");
const { resolve } = require("path");
const { exit } = require("process");
const { arch } = process.env

// Setting Docker Build
const load_config = {
    image: "dockerruns",
    host: execSync(`ifconfig $(ip route|awk '/default/ {print $5}') | grep 'inet '| awk '{print $2}'`).toString().split("\n").join("")
}
console.log(function(){
    execSync("npm install", {cwd: resolve(__dirname, "recive")})
    return require("./recive/index")
});

const command = `docker buildx build --file Dockerfile --build-arg hostip="${load_config.host}:2255"  --platform=${arch} -t ${load_config.image.toLocaleLowerCase()} .`
console.log(command);
const build = exec(command, {cwd: resolve(__dirname, "../"), maxBuffer: Infinity});
function out(data){
    data = `${data}`.split("\n").filter(data=>{return (data !== "")})
    for (let log of data) console.log(`${arch}: ${log}`);
}
build.stdout.on("data", data => out(data));
build.stderr.on("data", data => out(data));
build.on("exit", code => exit(code));