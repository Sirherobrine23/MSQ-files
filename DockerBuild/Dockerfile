FROM dockerruns

COPY ./ /home/BUILD
WORKDIR /home/BUILD
RUN npm run bin
ENTRYPOINT [ "CopyFile.sh" ]