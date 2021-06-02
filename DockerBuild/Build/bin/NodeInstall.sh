#!/bin/bash
set -x
cd /tmp
tag=$(wget -qO- https://api.github.com/repos/nodejs/node/releases | jq -r ".[0].tag_name")

copilerNode(){
    cd /tmp
    mkdir node
    wget -qO- "https://nodejs.org/download/release/${tag}/node-${tag}.tar.gz" | tar xfz - --directory node/
    cd node
    ./configure
    make -j$(nproc)
    make install PREFIX=../NodeOut
    cd ../NodeOut
    cd *
    cp -rfv * /usr
}

case $(uname -m) in
    x86_64)  url="https://nodejs.org/download/release/${tag}/node-${tag}-linux-x64.tar.gz";;
    aarch64) url="https://nodejs.org/download/release/${tag}/node-${tag}-linux-arm64.tar.gz";;
    arm64)   url="https://nodejs.org/download/release/${tag}/node-${tag}-linux-arm64.tar.gz";;
    armv7l)  url="https://nodejs.org/download/release/${tag}/node-${tag}-linux-armv7l.tar.gz";;
    ppc64le) url="https://nodejs.org/download/release/${tag}/node-${tag}-linux-ppc64le.tar.gz";;
    s390x)   url="https://nodejs.org/download/release/${tag}/node-${tag}-linux-s390x.tar.gz";;
    *) copilerNode;;
esac

if [ ! -z "${url}" ];then
    echo "Node URL ${url}"
    mkdir nodetmp/
    if (wget -qO- "${url}" | tar xfz - --directory nodetmp/);then 
        cd nodetmp/*
        cp -rf * /usr
    else
        echo "Error downloading or extracting"
        exit 1
    fi
else
    echo "No URL"
    exit 2
fi

cd /tmp
rm -rf *
exit $?
