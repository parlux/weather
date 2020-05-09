#!/bin/bash

BUILD_DIR=build

# Read .env
if [ -f .env ]; then
  source .env
fi

# Set any default env variables
: ${API_URL:='https://paulc.in/weather-api'}

# Clean and create build dir
if [ -d ${BUILD_DIR} ]; then
  rm -Rf ${BUILD_DIR};
fi
mkdir ${BUILD_DIR}

# Parse and copy files
cp index.html style.css build
sed "s@%API_URL%@${API_URL}@g" app.js > build/app.js