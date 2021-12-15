FROM node:latest

WORKDIR /dir/src/app

COPY . .

CMD ["node","uws"]

EXPOSE 8800
