#!/bin/bash
cd ~/chocapix-server
sudo pip install --upgrade pip
sudo pip install -r requirements.txt

npm install -g protractor@2.5.1
webdriver-manager update

cd ~/chocapix-client
bower install -f
