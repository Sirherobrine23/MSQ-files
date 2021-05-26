const { resolve, join } = require("path")
const { execSync, exec, spawnSync } = require("child_process");
const { readFileSync, existsSync, appendFileSync, writeFileSync } = require("fs");
const { WriteStream } = require("fs");
const { exit } = process;
process.env.PWD = process.env.CWD = __dirname
var DockerConfig;
let DockerConfigFile = resolve(__dirname, "docker_config.json");
DockerConfig = JSON.parse(readFileSync(DockerConfigFile, "utf8"))

var portsExport="";
for (let ports of DockerConfig.ports) portsExport += `-p ${(ports.external||ports.port)}:${ports.port}/${(ports.protocoll||"tcp")} `

var mountExport="";
for (let mounts of DockerConfig.mounts) mountExport += `-v ${resolve(mounts.from.replace(/\$([A-Za-z\-_]+)|\$\{([^{^}]+)\}/g, (_, a, b) => (process.env[a || b] || resolve("/", (a || b)))))}:${mounts.path} `

var envExport="";
for (let envs of DockerConfig.env) envExport += `-e ${envs.name}="${envs.value}" `

var optionsExport="";
for (let options of DockerConfig.options) optionsExport += `${options} `

var dockerTarget = "";
if (DockerConfig.target) dockerTarget = `--target ${DockerConfig.target}`

console.log("Checking and stopping");
var CheckDocker = execSync("docker ps -a").toString()
CheckDocker = CheckDocker.split(/\r?\n/g)
for (let dockerId of CheckDocker){
    const arrayDocker = dockerId.trim().split(/\s+/)
    console.log(arrayDocker);
    if (dockerId.includes(DockerConfig.docker_image)||dockerId.includes(DockerConfig.name)) {
        console.log(`Docker Container ID: ${arrayDocker[0]}`);
        try {
            console.log(spawnSync(`docker stop ${arrayDocker[0]}`).toString());
        } catch (error) {
            console.log(spawnSync(`docker rm ${arrayDocker[0]}`).toString());
        }
    }
}

var docker = execSync("docker image ls").toString().split(/\r?\n/g)
for (let dockerImage of docker){
    if (dockerImage.includes(DockerConfig.docker_image)) {
        dockerImage = dockerImage.trim().split(/\s+/)
        console.log(dockerImage);
        console.log(spawnSync(`docker rmi ${dockerImage[2]}`));
    }
}

var name = ""
if (DockerConfig.name) name = `--name ${DockerConfig.name}`;

const logFile = resolve(__dirname, "Docker.js.log");
const gitinoreFile = join(__dirname, ".gitignore");
if (existsSync(gitinoreFile)) {
    if (!(readFileSync(gitinoreFile, "utf8").includes("Docker.js.log"))) appendFileSync(gitinoreFile, "\nDocker.js.log");
} else writeFileSync(gitinoreFile, "Docker.js.log")

// Build
const stdoutBuild = WriteStream(logFile, {flags: "w"});
const stderrBuild = WriteStream(logFile, {flags: "a"});

// Run
const stdoutRun = WriteStream(logFile, {flags: "a"});
const stderrRun = WriteStream(logFile, {flags: "a"});

console.log("Creating the Image");

var dockertype = ""
var buildXOptions = ""
if (DockerConfig.dockertype === "buildx") {
    dockertype = DockerConfig.dockertype
    if (DockerConfig.platforms.length !== undefined) buildXOptions = `--platform ${DockerConfig.platforms.join(",")}`;
}

function Docker(endcallback){
    const build_command = `docker ${dockertype} build ${resolve(__dirname)} ${dockerTarget} -f ${DockerConfig.dockerfile} -t ${DockerConfig.docker_image}`.trim().split(/\s+/).join(" ");
    console.log(build_command);
    const build = exec(build_command);

    build.stdout.pipe(stdoutBuild)
    build.stderr.pipe(stderrBuild)

    build.stdout.on("data", (data) => {if (data.slice(-1) === "\n") data = data.slice(0, -1);console.log(data);})
    build.stderr.on("data", (data) => {if (data.slice(-1) === "\n") data = data.slice(0, -1);console.log(data);})
    build.on("exit", function(code){
        if (code === 0){
            console.log("Running the image");
            const commadRun = `docker run --rm ${optionsExport} ${name} ${mountExport} ${portsExport} ${envExport} ${DockerConfig.docker_image}`.trim().split(/\s+/).join(" ");
            console.log(commadRun);
            const run = exec(commadRun, {
                detached: true,
                shell: true
            });

            run.stdout.pipe(stdoutRun)
            run.stderr.pipe(stderrRun)

            if (typeof endcallback === "function") run.on("exit", code => endcallback(code));
            else run.on("exit", code => process.exit(code))
            run.stdout.on("data", (data) => {if (data.slice(-1) === "\n") data = data.slice(0, -1);console.log(data);})
            run.stderr.on("data", (data) => {if (data.slice(-1) === "\n") data = data.slice(0, -1);console.log(data);})
        } else exit(code)
    })
}

module.exports = Docker;
