ssh root@localhost "(nohup /root/$1) &>> /var/log/deploy/nohup.out && /root/after_deploy.sh $? $1 || /root/after_deploy.sh $? $1"
