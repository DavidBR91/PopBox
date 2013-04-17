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

app.post('/trans/:id_trans', function (req, res){
  'use strict';
  var idTrans = req.param('id_trans', null);
  userDb.authenticate(req.body.name, req.body.password, function (user, id){
    if(user !== undefined) {
      userDb.isYourTrans(user, idTrans, function (found) {
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
              res.send({ok: true, data: data}, 200);
            }
          });
        }
      });
    }
  });
});

app.put('/trans/:id_trans', function (req, res){
  'use strict';
  var idTrans = req.param('id_trans', null);
  userDb.authenticate(req.body.name, req.body.password, function (user, id){
    if(user !== undefined) {
      userDb.isYourTrans(user, idTrans, function (found){
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
                if((memUsed + req.body.payload.length) <= user.maxMem) {
                  heads = {};
                  heads['content-type'] = 'application/json';
                  heads['accept'] = 'application/json';
                  options = {host: config.agentHosts[0].host,
                    port: config.agentHosts[0].port,
                    path: '/trans/' + idTrans, method: 'PUT',
                    headers: heads};
                  var body = _.omit(req.body, ['name', 'password']);
                  utils.makeRequest(options, body, function (err, response, data) {
                    if(err) {
                      res.send({errors: [err]}, 400);
                    } else {
                      userDb.incMem(user, req.body.payload.length, function (err){
                        res.send({ok: true}, 200);
                      });
                    }
                  });
                }
              }
          });
        } else {
          var heads = {};
          heads['content-type'] = 'application/json';
          heads['accept'] = 'application/json';
          var options = {host: config.agentHosts[0].host,
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
      userDb.canIncMem(user, req.body.payload.length, function (inc){
        if(inc === true) {
          var heads = {};
          heads['content-type'] = 'application/json';
          var options = { host: config.agentHosts[0].host,
            port: config.agentHosts[0].port, path: '/trans/',
            method: 'POST', headers: heads};
          var body = _.omit(req.body, ['name', 'password']);
          var queuesAux = [];
          for (var i = 0; i <= body.queue.length - 1; i++) {
            queuesAux.push(body.queue[i].id);
            body.queue[i].id = body.queue[i].id +
              '-' + id;
          }
          utils.makeRequest(options, body, function (err, response, data){
            if(err){
            res.send({errors: [err]}, 400);
            } else {
              userDb.addTrans(user, data.data, req.body.payload.length, function (err) {
                if(err) {
                  res.send({errors: [err]}, 400);
                } else {
                  console.log(queuesAux);
                  userDb.addQueues(user, queuesAux, function (err) {
                    if (err) {
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
    }
  });
});

app.post('/queue/:id', function (req, res){
  'use strict';
  var idQueue = req.param('id', null);
  userDb.authenticate(req.body, req.body.name, function (user, id) {
    if(user !== undefined) {
      user.isYourQueue(user, idQueue, function (found) {
        if (found === true) {
          var heads = {};
          heads['accept'] = 'application/json';
          idQueue = idQueue + '-' + id;
          var options = {host: config.agentHosts[0].host,
            port: config.agentHosts[0].port,
            path: '/queue/' + idQueue, method: 'GET',
            headers: heads};
          utils.makeRequest(options, null, function (err, response, data) {
            if(err) {
              res.send({errors: [err]}, 400);
            } else {
              res.send({ok: true, data: data.data}, 200);
            }
          });
        }
      });
    }
  });
});

app.post('/queue/:id/pop', function (req, res){
  'use strict';
  var idQueue = req.param('id', null);
  userDb.authenticate(req.body, req.body.name, function (user, id) {
    if(user !== undefined) {
      user.isYourQueue(user, idQueue, function (found) {
        if (found === true) {
          var heads = {};
          heads['accept'] = 'application/json';
          idQueue = idQueue + '-' + id;
          var options = {host: config.agentHosts[0].host,
            port: config.agentHosts[0].port,
            path: '/queue/' + idQueue + '/pop', method: 'POST',
            headers: heads};
          utils.makeRequest(options, null, function (err, response, data) {
            if(err) {
              res.send({errors: [err]}, 400);
            } else {
              res.send({ok: true, data: data.data});
            }
          });
        }
      });
    }
  });
});

app.post('/queue/:id/peek', function (req, res){
 'use strict';
  var idQueue = req.param('id', null);
  userDb.authenticate(req.body, req.body.name, function (user, id) {
    if(user !== undefined) {
      user.isYourQueue(user, idQueue, function (found) {
        if (found === true) {
          var heads = {};
          heads['accept'] = 'application/json';
          idQueue = idQueue + '-' + id;
          var options = {host: config.agentHosts[0].host,
            port: config.agentHosts[0].port,
            path: '/queue/' + idQueue + '/peek', method: 'POST',
            headers: heads};
          utils.makeRequest(options, null, function (err, response, data) {
            if(err) {
              res.send({errors: [err]}, 400);
            } else {
              res.send({ok: true, data: data.data});
            }
          });
        }
      });
    }
  });
});
