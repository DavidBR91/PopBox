var express = require('express');
var mongoose = require('mongoose');
var config = require('./config');
var userDb = require('./userDb');
var utils = require('./utils');

var app = express.createServer();

app.listen(7777);
app.use(express.query());
app.use(express.bodyParser());

mongoose.connect('mongodb://' + config.userDatabase.host + ':' +
   config.userDatabase.port + '/' + config.userDatabase.name);

//Rest API TODO: logic
app.get('/users/:user_id', function (req, res){
  'use strict';
  console.log('entra');
  var id = req.param('user_id', null);
  console.log(id);
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
  console.log(req.body);
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
  console.log(id);
  var id = req.param('user_id', null);
  userDb.updateInfo(id, req.body, function (err){
    if(err){
      res.send({errors: [err]}, 400);
    } else {
      res.send({ok: true}, 200);
    }
  });
});

app.del('/users/user_id', function (req, res){
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

app.get('/trans/:id_trans', function (){});
app.put('/trans/:id_trans', function (){});
app.post('/trans/:id_trans/payload', function (){});
app.post('/trans/:id_trans/expirationDate', function (){});
app.post('/trans/:id_trans/callback', function (){});

app.post('/trans', function (req, res){
  var id = userDb.authenticate(req.name, req.password);
  if(id !== undefined){
    var heads = {};
      heads['content-type'] = 'application/json';
    var options = { host: config.agentHost[0].host,
         port: config.agentHost[0].port, path: '/trans/',
         method: 'POST', headers: heads};
    utils.makeRequest(options, req.body, function (err, response, data){
      if(err){
        res.send({errors: [err]}, 400);
      } else {
        userDb.addTrans(id, data.id, function (err) {
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

app.get('/queue/:id', function (){});
app.post('/queue/:id/pop', function (){});
app.get('/queue/:id/peek', function (){});
