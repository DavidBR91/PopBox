var mongoose = require('mongoose');
var _ = require('underscore');

var UserSchema = mongoose.Schema({
  name: {type: String, required: true },
  email: {type: String, required: true},
  password: {type: String, required: true},
  memUsed: {type: Number, required: true},
  maxMem: {type: Number, required: true},
  maxReq: {type: Number, required: true},
  queues: [{type: String, required: false}],
  trans: [{type: String, required: false}]
});

var UserModel = mongoose.model('UserModel', UserSchema);

function addUser(body, cb) {
  'use strict';
  var user = new UserModel({
    name: body.name,
    email: body.email,
    password: body.password,
    maxMem: 200000,
    memUsed: 0,
    maxReq: 1000
  });
  user.save(function(err){
      cb(err, user.id);
  });
}

function getUser(id, cb){
  'use strict';
  UserModel.findById(id, function (err, user){
      cb(err, user);
  });
}

function authenticate(name, password, cb) {
  'use strict';
  var res;
  UserModel.findOne({name: name}, function (err, user){
    if(password === user.password) {
      res = user;
    }
    cb(res, res.id);
  });
}

function updateInfo(id, body, cb) {
  'use strict';
  UserModel.findById(id, function (err, user){
    if((body.name === user.name) && (body.password === user.password)){
      UserModel.findByIdAndUpdate(id, _.omit(body, ['memUsed', 'maxMem',
        'maxReq', 'queues', 'trans']), function(){
        cb(err);
      });
    }
    else
      cb(err);
  });
}

function deleteUser(id, cb) {
  'use strict';
  UserModel.findById(id, function(err, user){
    user.remove(function(err){
      cb(err);
    });
  });
}

function addTrans(user, idTrans, bytes, cb){
  'use strict';
  user.trans.push(idTrans);
  user.memUsed = user.memUsed + bytes;
  user.save(function(err){
    cb(err);
  });
}

function isYourTrans (user, idTrans, cb) {
  'user strict';
  var found;
  var index = user.trans.indexOf(idTrans);
  if(index !== -1) {
    found = true;
  } else {
    found = false;
  }
  cb(found);
}

function canIncMem (user, bytes, cb) {
  'use strict';
  var inc;
  var mem = user.memUsed + bytes;
  if(mem <= user.maxMem) {
    user.memUsed = mem;
    inc = true;
  } else {
    inc = false;
  }
  cb(inc);
}

function incMem (user, bytes, cb) {
  'use strict';
  user.memUsed = user.memUsed + bytes;
  user.save(function (err) {
    cb(err);
  });
}

function decMem (user, bytes, cb) {
  'use strict';
  user.memUsed = user.memUsed - bytes;
  user.save(function (err) {
    cb(err);
  });
}

exports.getUser = getUser;
exports.updateInfo = updateInfo;
exports.addTrans = addTrans;
exports.authenticate = authenticate;
exports.deleteUser = deleteUser;
exports.addUser = addUser;
exports.canIncMem = incMem,
exports.decMem = decMem;
exports.incMem = incMem;
