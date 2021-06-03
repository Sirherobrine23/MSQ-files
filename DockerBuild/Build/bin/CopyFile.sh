#!/usr/bin/env bash
set -x
pwd
for a in DockerRunBuild*
do
    curl -F "${a}=@./${a}" http://localhost:2255/deb
done
exit $?