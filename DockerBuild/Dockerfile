FROM debian:latest
# Install nexe dependencies to build
USER root
ENV DEBIAN_FRONTEND=noninteractive
RUN apt update && \
apt install -y python python3 g++ build-essential make ca-certificates wget curl dpkg-dev unzip zip jq git

# Copy Bin files
COPY ./Build/bin/*.sh /bin/
RUN chmod a+x -v /bin/*.sh && mkdir /home/base
WORKDIR /home/base

# Copiler/Install node
RUN NodeInstall.sh

COPY ./ /home/BUILD
WORKDIR /home/BUILD
RUN npm install && npm run bin
ENTRYPOINT [ "CopyFile.sh" ]