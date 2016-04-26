'use strict';

var async = require('async');
var router = require('express').Router();
var constants = require('../Constants');


router.get('/constants', function (req, res, next) {
  console.log("CONSTANTS", constants);
  res.send(constants)
});

router.post('/', function (req, res, next) {

});

router.put('/', function (req, res, next) {

});

router.delete('/', function (req, res, next) {

});

module.exports = router;