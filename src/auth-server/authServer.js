var express = require('express');
var mongoose = require('mongoose');
var config = require('./config');
var userDb = require('./userDb');
var utils = require('./utils');
var _ = require('underscore');

var app = express.createServer();

app.listen(7777);
app.use(express.query());
app.use(express.bodyParser());

mongoose.connect('mongodb://' + config.userDatabase.host + ':' +
   config.userDatabase.port + '/' + config.userDatabase.name);

//Rest API TODO: logic
app.get('/users/:user_id', function (req, res){
  'use strict';
  var id = req.param('user_id', null);
  userDb.getUser(id, function (err, user){
    if(err){
      res.send({errors: [err]}, 400);
    } else {
      res.send({ok: true, user: user}, 200);
    }
  });
});

app.post('/users', function (req, res){
  'use strict';
  var missingParam = (req.body.name === undefined) ||
    (req.body.password === undefined) ||
    (req.body.email === undefined);
  if(missingParam) {
    res.send({errors: 'missing param'}, 400);
  } else {
    userDb.addUser(req.body, function (err, id){
      if(err){
        res.send({errors: [err]}, 400);
      } else {
        res.send({ok: true, id: id}, 200);
      }
    });
  }
});

app.put('/users/:user_id', function (req, res){
  'use strict';
  var id = req.param('user_id', null);
  userDb.updateInfo(id, req.body, function (err){
    if(err){
      res.send({errors: [err]}, 400);
    } else {
      res.send({ok: true}, 200);
    }
  });
});

app.del('/users/:user_id', function (req, res){
  'use strict';
  var id = req.param('user_id', null);
  userDb.deleteUser(id, function (err){
    if(err){
      res.send({errors: [err]},400);
    } else {
      res.send({ok: true}, 200);
    }
  });
});

app.get('/trans/:id_trans', function (req, res){
  'use strict';
  var idTrans = req.param('id_trans', null);
  userDb.authenticate(req.body.name, req.body.password, function (user, id){
    if(user !== undefined) {
      user.isYourTrans(user, idTrans, function (found) {
        if(found === true) {
          var heads = {};
          heads['accept'] = 'application/json';
          var options = {host: config.agentHosts[0].host,
            port: config.agentHosts[0].port,
            path: '/trans/' + idTrans, method: 'GET',
            headers: heads};
          utils.makeRequest(options, null, function (err, response, data) {
            if(err) {
              res.send({errors: [err]}, 400);
            }
            else {
              res.send({ok: true, data: data.data}, 200);
            }
          });
        }
      });
    }
  });
});

app.put('/trans/:id_trans', function (){
  'use strict';
  var idTrans = req.param('id_trans', null);
  userDb.authenticate(req.body.name, req.body.password, function (user, id){
    if(user !== undefined) {
      userDb.isyourTrans(user, idTrans, function (found){
        if (req.body.payload !== undefined) {
          var heads = {};
          heads['accept'] = 'application/json';
          var options = {host: config.agentHosts[0].host,
            port: config.agentHosts[0].port,
            path: '/trans/' + idTrans, method: 'GET',
            headers: heads};
            utils.makeRequest(options, null, function (err, response, data) {
              if (err) {
                res.send({errors: [err]}, 400);
              } else {
                var memUsed = user.memUsed - data.payload.length;
                if((memUsed + req.body.payload) <= user.maxMem) {
                  heads = {};
                  heads['content-type'] = 'application/json';
                  heads['accept'] = 'application/json';
                  options = {host: congig.agentHosts[0].host,
                    port: config.agentHosts[0].port,
                    path: '/trans/' + idTrans, method: 'PUT',
                    headers: heads};
                  var body = _.omit(req.body, ['name', 'password']);
                  utils.makeRequest(options, body, function (err, response, data) {
                    if(err) {
                      res.send({errors: [err]}, 400);
                    } else {
                      res.send({ok: true}, 200);
                    }
                  });
                }
              }
          });
        } else {
          var heads = {};
          heads['content-type'] = 'application/json';
          heads['accept'] = 'application/json';
          var options = {host: congig.agentHosts[0].host,
            port: config.agentHosts[0].port,
            path: '/trans/' + idTrans, method: 'PUT',
            headers: heads};
          var body = _.omit(req.body, ['name', 'password']);
            utils.makeRequest(options, body, function (err, response, data) {
              if(err) {
                res.send({errors: [err]}, 400);
              } else {
                res.send({ok: true}, 200);
              }
          });
        }
      });
    }
  });
});

app.post('/trans', function (req, res){
  'use strict';
  userDb.authenticate(req.body.name, req.body.password, function (user, id){
    if(user !== undefined){
      userDb.canIncMem(id, req.payload.length, function (inc){
        if(inc === true) {
          var heads = {};
          heads['content-type'] = 'application/json';
          var options = { host: config.agentHosts[0].host,
            port: config.agentHosts[0].port, path: '/trans/',
            method: 'POST', headers: heads};
          var body = _.omit(req.body, ['name', 'password']);
          utils.makeRequest(options, body, function (err, response, data){
            if(err){
            res.send({errors: [err]}, 400);
            } else {
              userDb.addTrans(user, data.data, req.payload.length(), function (err) {
                if(err) {
                  res.send({errors: [err]}, 400);
                } else {
                res.send({ok: true, id: data.data}, 200);
              }
            });
            }
          });
        }
      });
    }
  });
});

app.get('/queue/:id', function (){});
app.post('/queue/:id/pop', function (){});
app.get('/queue/:id/peek', function (){});
