#!/bin/bash

kill -9 $(lsof -t -i:8080);
kill -9 $(lsof -t -i:8085);
kill -9 $(lsof -t -i:9000);
