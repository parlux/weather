#!/bin/bash

# scp -r app.js index.html style.css pi@farmsrv.ddns.net:/home/pi/nginx-farmsrv.ddns.net/weather
scp -r app.js index.html style.css parlux@paulc.in:/apps/weather/frontend
