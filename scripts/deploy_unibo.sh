#!/bin/bash

site="site181925"
host="bess"

deploy_path="/home/web/$site/html/"

read -p "Username: " username
read -sp "Password: " password
echo

connection_string="$username@$host.cs.unibo.it"
gocker_connection_string="$username@gocker.cs.unibo.it"

# Copy files to deploy host
./scripts/exp.sh $password scp -r ./{api,client,config,index.js,package.json} $connection_string:$deploy_path

# Run commands on deploy host
expect \
    -c "set timeout 600" \
    -c "eval spawn ssh $connection_string" \
    -c "expect \"assword:\"" \
    -c "send \"$password\\r\"" \
    -c "expect \"$ \"" \
    -c "send \"cd $deploy_path\\r\"" \
    -c "expect \"$ \"" \
    -c "send \"export PATH=\\\$PATH:/usr/local/node/bin\\r\"" \
    -c "expect \"$ \"" \
    -c "send \"npm install --only=prod\\r\"" \
    -c "expect \"$ \"" \
    -c "send \"sed -i '1iprocess.env.NODE_ENV = '\\\\''production'\\\\'';\\\\n' index.js\\r\"" \
    -c "expect \"$ \"" \
    -c "send \"chmod -R 777 ./*\\r\"" \
    -c "expect \"$ \"" \
    -c "send \"ssh $gocker_connection_string\\r\"" \
    -c "expect \"assword:\"" \
    -c "send \"$password\\r\"" \
    -c "expect \"(gocker): \"" \
    -c "send \"restart $site\\r\"" \
    -c "expect \"(gocker): \"" \
    -c "send \"exit\\r\"" \
    -c "expect \"$ \"" \
    -c "send \"exit\\r\""
