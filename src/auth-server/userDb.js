var mongoose = require('mongoose');

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
  var id;
  UserModel.findOne({name: name}, function (err, user){
    if(password === user.password) {
      id = user.id;
    }
    cb(id);
  });
}

function updateInfo(id, body, cb) {
  'use strict';
  UserModel.findById(id, function (err, user){
    if((body.name === user.name) && (body.password === user.password)){
      UserModel.findByIdAndUpdate(id, body, function(){
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

function addTrans(idUser, idTrans, cb){
  'use strict';
  UserModel.findById(idUser, function (err, user){
    user.trans.push(idTrans);
    user.save(function(err){
      cb(err);
    });
  });
}

function incMem (idUser, bytes, cb) {
  'use strict';
  UserModel.findById(idUser, function (err, user) {
    var mem = user.memUsed + bytes;
    if(mem <= user.maxMem) {
      user.memUsed = mem;
      user.save(function (err){
        cb(err);
      });
    } else {
        var error = true;
        cb(error);
    }
  });
}

function decMem (idUser, bytes, cb) {
  'use strict';
  UserModel.findById(idUser, function (err, user) {
    user.memUsed = user.memUsed - bytes;
    user.save(function (err) {
      cb(err);
    });
  });
}

exports.getUser = getUser;
exports.updateInfo = updateInfo;
exports.addTrans = addTrans;
exports.authenticate = authenticate;
exports.deleteUser = deleteUser;
exports.addUser = addUser;
exports.incMem = incMem,
exports.decMem = decMem;
