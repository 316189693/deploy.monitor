cd /var/www/deploy.monitoring
git pull origin master
echo  /var/www/tms.deploy.monitoring/log/server.log
npm install >>  /var/www/deploy.monitoring/log/server.log 2>&1
source /root/pm2home
sudo su -
cd /var/www/deploy.monitoring/lib
chmod 777 scp_servers_file.sh
cd /var/www/deploy.monitoring/bin
pm2 start www >>  /var/www/deploy.monitoring/log/server.log 2>&1
echo "server up"