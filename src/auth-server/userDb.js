var mongoose = require('mongoose');
var _ = require('underscore');
var bcrypt = require('bcrypt');

var UserSchema = mongoose.Schema({
  name: {type: String, required: true },
  email: {type: String, required: true},
  password: {type: String, required: true},
  maxPayload: {type: Number, required: true},
  maxReq: {type: Number, required: true},
  maxExpirationDate: {type: Number, required: true},
  queues: [{type: String, required: false}],
  trans: [{type: String, required: false}]
});

var UserModel = mongoose.model('UserModel', UserSchema);
var salt = bcrypt.genSaltSync(10);

function addUser(body, cb) {
  'use strict';
  bcrypt.hash(body.password, salt, function (err, hash){
    var user = new UserModel({
      name: body.name,
      email: body.email,
      password: hash,
      maxPayload: 20000,
      maxExpirationDate: 1,
      maxReq: 1000
    });
    user.save(function(err){
      cb(err, user.id);
    });
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
    bcrypt.compare(password, user.password, function (err, match){
      if(match === true) {
        res = user;
      }
      cb(res, res.id);
    });
  });
}

function updateInfo(id, body, cb) {
  'use strict';
  UserModel.findByIdAndUpdate(id, _.omit(body, ['maxPayload', 'maxExpirationDate',
    'maxReq', 'queues', 'trans']), function(){
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

function addQueues(user, queues, cb) {
  'use strict';
  for(var i = 0; i< queues.length; i++) {
    user.queues.push(queues[i]);
  }
  user.save(function(err) {
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

function isYourQueue (user, idQueue, cb) {
  'use strict';
  var found;
  var index = user.queues.indexOf(idQueue);
  if (index !== -1) {
    found = true;
  } else {
    found = false;
  }
  cb(found);
}

function checkPayload (userMaxPayload, payloadLength, cb) {
  'use strict';
  var res = false;
  if (payloadLength <= userMaxPayload) {
    res = true;
  }
  cb(res);
}

function checkExpirationDate (userMaxExpirationDate, expirationDate, cb) {
  'use strict';
  var res = false;
  var maxExpirationDate = Math.round(new Date().getTime()) +
    (2592000 * userMaxExpirationDate);
  if(expirationDate <= maxExpirationDate) {
    res = true;
  }
  cb(res);
}

function canAddTrans (user, payloadLength, expirationDate, cb) {
  'use strict';
  var checked = false;
  checkPayload(user.maxPayload, payloadLength, function (res) {
    checked = res;
    checkExpirationDate(user.maxExpirationDate, expirationDate, function (res){
      checked = checked && res;
      cb(checked);
    });
  });
}

function increaseUserPayload (user, payloadIncrease, cb) {
  'use strict';
  user.maxPayload = user.maxPayload + payloadIncrease;
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
exports.isYourTrans = isYourTrans;
exports.addQueues = addQueues;
exports.isYourQueue = isYourQueue;
exports.checkPayload = checkPayload;
exports.canAddTrans = canAddTrans;
