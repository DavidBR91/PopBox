var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
  name: {type: String, required: true },
  email: {type: String, required: true},
  password: {type: String, required: true},
  memUsed: {type: Number, required: true},
  maxReq: {type: Number, required: true}
});

var UserModel = mongoose.model('UserModel', UserSchema);

function addUser(body, cb) {
  'use strict';
  var user = new UserModel({
    name: body.name,
    email: body.email,
    password: body.password,
    memUsed: 0,
    maxReq: 1000
  });
  user.save(function(err){
      cb(err, user.id);
  });
}

function updateInfo(id, body, cb) {
  'use strict';
  UserModel.findById(id, function (err, user){
    if(body.password === user.password){
      UserModel.findByIdandUpdate(id, body, function(){
        cb(err);
      });
    }
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

exports.updateInfo = updateInfo;
exports.deleteUser = deleteUser;
exports.addUser = addUser;
