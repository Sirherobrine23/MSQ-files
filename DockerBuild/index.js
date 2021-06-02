#!/usr/bin/env node
const { exec } = require("child_process");
const { resolve } = require("path");
const { existsSync, readFileSync, writeFileSync } = require("fs");
const yaml = require("js-yaml");

// Config Path's
const YamlConfig = resolve(process.cwd(), "DockerConfig.yaml");
const JsonConfig = resolve(process.cwd(), "DockerConfig.json")
const config = {
    name: "DockerRunBuild",
    file: "Dockerfile",
    tag: "BuildTest:latest",
    buildx: false,
    env: [],
    mount: [],
    ports: [],
    options: {
        build: [],
        run: [],
        runArgv: []
    }
}
if (existsSync(YamlConfig)) {
    const ConfigYAML = yaml.load(readFileSync(YamlConfig, "utf8"));
    for (let ar of Object.getOwnPropertyNames(ConfigYAML)) config[ar] = ConfigYAML[ar]
} else if (existsSync(JsonConfig)) {
    const Sh23Config = JSON.parse(readFileSync(JsonConfig, "utf8"));
    for (let ar of Object.getOwnPropertyNames(Sh23Config)) config[ar] = Sh23Config[ar]
} else {
    writeFileSync(YamlConfig, yaml.dump(config))
    throw "Create Config file or Github Test";
}

function log(data){
    const log = `${data}`.split("\n").filter(d=>{return (d !== "")}).join("\n");
    console.log(log)
}

const buildCommand = ["docker",]
if (config.buildx) buildCommand.push("buildx build"); else buildCommand.push("build");
for (let buidlop of config.options.build) buildCommand.push(buidlop);

buildCommand.push(`--file ${config.file}`);
buildCommand.push(`--tag ${config.tag.toLocaleLowerCase()}`);
buildCommand.push(process.cwd())
console.log(buildCommand.join(" "))

const build = exec(buildCommand.join(" "));
build.stdout.on("data", data=>log(data));
build.stderr.on("data", data=>log(data));

build.on("exit", code => {
    if (code === 0){
        const runCommand = ["docker run --rm -i"]
        for (let runs of config.options.run) runCommand.push(runs);
        for (let env of config.env) {
            if (env.file) {
                runCommand.push(`--env-file ${resolve(env.value)}`);
            } else runCommand.push(`--env ${env.name}=${env.value}`);
        }
        
        for (let mount of config.mount) {runCommand.push(`--mount ${resolve(mount.in||mount.to)}:${mount.to}`);}
        
        for (let ports of config.ports) {runCommand.push(`-p ${ports.out||ports.in}:${ports.in}/${ports.protocol||"tcp"}`);}

        runCommand.push(config.tag.toLocaleLowerCase())
        runCommand.push(config.options.runArgv.join(" "))

        console.log(runCommand.join(" "))
        const run = exec(runCommand.join(" "));
        run.stdout.on("data", data=>log(data));
        run.stderr.on("data", data=>log(data));
        run.on("exit", codeR => process.exit(codeR))
    } else process.exit(code)
})