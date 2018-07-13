#!/bin/bash

current_date=`date "+%Y-%m-%d %H:%M:%S"`
hostnamestr=`hostname`
status='success'
if [ $1 -ne 0 ] 
    then {
	  status='failed'
	  } 
fi	
echo  '{"deploy_server": "'$hostnamestr'", "deploy_date": "'$current_date'", "deploy_status": "'$status'", "deploy_script": "'$2'"},' >> /d/var/log/deploy/deploy.log 2>&1
echo -e "#################################  $hostnamestr|$current_date|$2|$status end... ########################################################### \n \n \n"	>> /d/var/log/deploy/nohup.out 2>&1