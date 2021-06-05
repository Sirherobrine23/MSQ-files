#!/usr/bin/env node
const { exec, execSync } = require("child_process");
const { resolve } = require("path");
const { exit } = require("process");
const arch = (process.env.arch || "linux/amd64")

// Setting Docker Build
const load_config = {
    image: "dockerruns",
    host: execSync(`ifconfig $(ip route|awk '/default/ {print $5}') | grep 'inet '| awk '{print $2}'`).toString().split("\n").join("")
}
const Ex = exec("npm install && node index.js", {cwd: resolve(__dirname, "recive")});
Ex.stdout.on("data", data => console.log(data))
Ex.stderr.on("data", data => console.log(data))

const command = `docker buildx build --file Dockerfile --build-arg HOST="${load_config.host}:2255" --network="host" --platform=${arch} -t ${load_config.image.toLocaleLowerCase()} .`;
console.log(command);
const build = exec(command, {cwd: resolve(__dirname, "../"), maxBuffer: Infinity});
function out(data){
    data = `${data}`.split("\n").filter(data=>{return (data !== "")})
    for (let log of data) console.log(`${arch}: ${log}`);
}
build.stdout.on("data", data => out(data));
build.stderr.on("data", data => out(data));
build.on("exit", code => exit(code));
