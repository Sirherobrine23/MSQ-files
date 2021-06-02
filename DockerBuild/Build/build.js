#!/usr/bin/env node
const { exec, execSync } = require("child_process");
const { resolve } = require("path");
const { exit } = require("process");
const { arch } = process.env

// Setting Docker Build
const load_config = {
    image: "dockerruns"
}
const command = `docker buildx build --file Dockerfile --platform=${arch} -t ${load_config.image.toLocaleLowerCase()} .`
console.log(command);
const build = exec(command, {cwd: resolve(__dirname, "../"), maxBuffer: Infinity});
function out(data){
    data = `${data}`.split("\n").filter(data=>{return (data !== "")})
    for (let log of data) console.log(`${arch}: ${log}`);
}
build.stdout.on("data", data => out(data));
build.stderr.on("data", data => out(data));
build.on("exit", code => {
    if (code !== 0) exit(code);
    else {
        const DockerSHADeCamomila = JSON.parse(execSync(`docker manifest inspect -v dockerruns`).toString())[0].Descriptor.digest
        const command = `docker run -v ${resolve(__dirname, "../")}:/home/OUT/ dockerruns@${DockerSHADeCamomila}`
        const getfile = exec(command, {cwd: resolve(__dirname, "../"), maxBuffer: Infinity});
        getfile.stdout.on("data", data => out(data))
        getfile.stderr.on("data", data => out(data))
        getfile.on("exit", cde => exit(cde))
    }
});