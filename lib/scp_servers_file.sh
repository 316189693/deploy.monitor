#!/bin/bash
sudo su -
scp will@r01.app.com:/var/log/deploy/deploy.log /var/log/deploy_log/deploy_r01.log
scp will@r02.app.com:/var/log/deploy/deploy.log /var/log/deploy_log/deploy_r02.log
scp will@r03.app.com:/var/log/deploy/deploy.log /var/log/deploy_log/deploy_r03.log
scp will@r04.app.com:/var/log/deploy/deploy.log /var/log/deploy_log/deploy_r04.log
exit