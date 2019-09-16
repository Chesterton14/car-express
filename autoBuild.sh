#!/usr/bin/env bash
git pull origin master
npm i
nodemon ./bin/www
