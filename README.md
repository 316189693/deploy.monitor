this is for project deploy report

1. use sh file to generate deploy log on server dev 
  check the piplines on bitbuket, such as https://bitbucket.org/logisticsteam-dev/tms.freightapp.gofuze.io/src/d166694f583e81b90ad0408c1e25c057e40507ce/bitbucket-pipelines.yml,
  we can see a statement:
  ssh -o "StrictHostKeyChecking no" serverName "./git.sh git_tms.sh"
  git.sh as below:
  ssh root@localhost "(nohup /root/$1) &>> /var/log/deploy/nohup.out && /root/after_deploy.sh $? $1 || /root/after_deploy.sh $? $1"
  we used ./lib/after_deploy.sh to generate deploy report, this file do not push to server auto need manually change on servers.
  
 2. nodejs call sh file to cp files from prod servers into dev server
  see file ./scp_servers_file.sh
 
 3. analyze datas and show in frontend page
 see ./load_server_deploy_status.js
 
 4. apache config
  see /opt/lampp/etc/extra/httpd-vhosts.conf in dev server, if any change,
  please run:/opt/lampp/bin/apachectl configtest to test modify correctly.
  after test, use  /opt/lampp/lampp reloadapache to restart apache 
 
 final url for this project:
 http://tms-dev-02.logisticsteam.com/deploy/projects 