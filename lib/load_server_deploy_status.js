var execFileSync = require('child_process').execFileSync;
var fs = require('fs');
var config = require( "../conf/config.json" );
var moment = require('moment');
var log4js = require('log4js');
var log = log4js.getLogger('errors');
let serverResult = null;

exports.getDeployResultObjFromDeployLog =  function() {
       serverResult = new Array();
       let map = new Map();
       var files = fs.readdirSync(config.log_folder); 
       if (files) {
           for(let i = 0; i< files.length; i++) {
               let data = fs.readFileSync(config.log_folder + files[i]);
               if (data) {
                   data = data.toString().trim();
                   let jsonAryStr = "[" + data.substring(0, data.length - 1) + "]";
                   let jsonAry = JSON.parse(jsonAryStr); 
                   jsonAry.forEach((val)=>{serverResult.push(val)});
               }
           }
           serverResult = sortAryByDeployDate(serverResult);
          let set = new Set();
          serverResult.forEach((ele)=>{set.add(ele.deploy_script)});
          for (let item of set.values()) {
                map.set(item, getLastProjectDeployAry(serverResult, item))
          }
       }
       return strMapToObj(map);
    }; 

function sortAryByDeployDate(serverResult){
    return serverResult.sort((a, b)=>{
        var aDate = moment(a.deploy_date);
    var bDate = moment(b.deploy_date);
    return bDate - aDate;
});

}

function  strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
    obj[k] = v;
  }
  return obj;
}

function getLastProjectDeployAry(serverResult, project) {
     var firstTMs = serverResult.find((ele)=>{return ele.deploy_script == project});
     var date = moment(firstTMs.deploy_date).format('YYYY-MM-DD');
     var ary = serverResult.filter((ele)=>{ return moment(ele.deploy_date).format('YYYY-MM-DD') == date && ele.deploy_script == project;})
               .sort((a, b)=>{ return a.deploy_server > b.deploy_server});

     return keepLastDeployPerServer(ary);
}

function keepLastDeployPerServer(ary){
    if (!ary) {
     return [];
    }
    ary = sortAryByDeployDate(ary);
    var newAry = [];
    ary.forEach((ele)=>{
        var existsOne = newAry.find((item)=>{return ele.deploy_server == item.deploy_server;});
        if (!existsOne) {
            newAry.push(ele);
        }
    });
    return newAry;
}

exports.scpServerFiles = function () {
    let result = {isScpSucess:true, msg:''};
    let isScpSucess = true;
    let exec_script = config.lib_folder+"scp_servers_file.sh";
    try {
       var rst = execFileSync(exec_script);
       if (!rst) {
         result.isScpSucess = false;
         result.msg = rst;
       }
    } catch(err){
        log.error("scp servers fail:");
        log.error(err);
        result.msg = err;
        result.isScpSucess = false;
    }
    return result;
};

