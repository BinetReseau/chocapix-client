#!/bin/bash

echo "# Chocapix - Tests"
echo ""

if [ -z $1 ] || [ $1 = "help" ]
then
    echo "Ce programme permet de lancer les tests E2E de Chocapix."
    echo "## Utilisation"
    echo "./test.sh help           affiche ces instructions"
    echo "./test.sh install        affiche les instructions d'installation nécessaires pour pouvoir lancer les tests"
    echo "./test.sh run            lance les tests E2E"
elif [ $1 = "install" ]
then
    echo "## Installation"
    echo "Voici les instructions pour pouvoir lancer les tests E2E"
    echo ""
    echo "1. Installer protractor : npm install -g protractor"
    echo "2. Installer chocapix-server dans le dossier parent (chocapix-client et chocapix-server doivent être au même niveau)"
    echo "   Il est impératif que vous puissiez lancer le serveur via ./managy.py runserver"
    echo ""
    echo "Une fois ceci effectué, vous pouvez lancer les tests simplement via ./test.sh run"
elif [ $1 = "run" ]
then
    echo "Lancement des tests"
    cd ../chocapix-server
    sed -i '.save' 's/bars_django\.settings\.dev_local/bars_django.settings.test/' bars_django/wsgi.py
    sed -i '.save' 's/bars_django\.settings\.dev_local/bars_django.settings.test/' manage.py

    yes "yes" | ./resetdb.sh
    ./manage.py runserver &
    sleep 5

    cd ../chocapix-client

    protractor test/e2e/conf.js

    kill %1
    cd ../chocapix-server
    sed -i '.save' 's/bars_django\.settings\.test/bars_django.settings.dev_local/' bars_django/wsgi.py
    sed -i '.save' 's/bars_django\.settings\.test/bars_django.settings.dev_local/' manage.py

fi
