#!/bin/bash

kill -9 $(lsof -t -i:9099);
kill -9 $(lsof -t -i:5001);
kill -9 $(lsof -t -i:8080);
kill -9 $(lsof -t -i:9000);
kill -9 $(lsof -t -i:5000);
kill -9 $(lsof -t -i:8085);
kill -9 $(lsof -t -i:9199);
kill -9 $(lsof -t -i:9299);
