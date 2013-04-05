var express = require('express');
var mongoose = require('mongoose');
var config = require('./config');
var userDb = require('./userDb');

var app = express.net.createapp();

app.port(5001);
app.use(express.query());
app.use(express.bodyParser());
app.use(express.router());

mongoose.connect('mongodb://' + config.userDatabase.host + ':' +
   config.userDatabase.port + '/' + config.userDatabase.name);

//Rest API TODO: logic
app.post('/users', function (req, res){
  'use strict';
  var misingParam = (req.body.name === undefined) ||
    (req.body.password === undefined) ||
    (req.body.email === undefined);
  if(missingParam) {
    res.send(400);
  } else {
    userDb.addUser(req.body, function (err){
      if(err){
        res.send(400);
      } else {
        res.send(200);
      }
    });
  }
});

app.put('users/user_id', function (req, res){
  'use strict';
  var id = req.param('user_id', null);
  userDb.updateinfo(id, req.body, function (err){
    if(err){
      res.send(400);
    } else {
      res.send(200);
    }
  });
});

app.del('user/user_id', function (req, res){
  'use strict';
  var id = req.param('user_id', null);
  userDb.deleteUser(id, function (err){
    if(err){
      res.send(400);
    } else {
      res.send(200);
    }
  });
});

app.get('/trans/:id_trans', function (){});
app.put('/trans/:id_trans', function (){});
app.post('/trans/:id_trans/payload', function (){});
app.post('/trans/:id_trans/expirationDate', function (){});
app.post('/trans/:id_trans/callback', function (){});
app.post('/trans', function (){});
app.get('/queue/:id', function (){});
app.post('/queue/:id/pop', function (){});
app.get('/queue/:id/peek', function (){});
