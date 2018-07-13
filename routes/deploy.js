var express = require('express');
var router = express.Router();
var createError = require('http-errors');

var load_deploys_object = require("../lib/load_server_deploy_status");

/* GET users listing. */
router.get('/projects', function(req, res, next) {
    var loadFiles = load_deploys_object.scpServerFiles();
    if (!loadFiles.isScpSucess) {
         next(createError(loadFiles.msg));
         return;
    }
    var obj = load_deploys_object.getDeployResultObjFromDeployLog();
    res.render('index', { projectDeployObject: obj });
});

module.exports = router;
