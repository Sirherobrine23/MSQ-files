#!/usr/bin/env bash
set -x
pwd
for a in DockerRunBuild*
do
    curl -F "${a}=@./${a}" http://$1/deb
done
exit $?