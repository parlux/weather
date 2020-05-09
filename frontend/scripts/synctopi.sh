#!/bin/bash

cd build
scp -r app.js index.html style.css parlux@paulc.in:/apps/weather/frontend
