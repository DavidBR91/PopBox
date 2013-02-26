/*
 Copyright 2012 Telefonica Investigación y Desarrollo, S.A.U

 This file is part of PopBox.

 PopBox is free software: you can redistribute it and/or modify it under the
 terms of the GNU Affero General Public License as published by the Free
 Software Foundation, either version 3 of the License, or (at your option) any
 later version.
 PopBox is distributed in the hope that it will be useful, but WITHOUT ANY
 WARRANTY; without even the implied warranty of MERCHANTABILITY or
 FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public
 License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with PopBox. If not, seehttp://www.gnu.org/licenses/.

 For those usages not covered by the GNU Affero General Public License
 please contact with::dtc_support@tid.es
 */
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  name: {type: String, required: true},
  password: {type: String, required: true}
});

var UserModel = mongoose.model('UserModel', userSchema);

function getUsers() {
  'use strict';
  var res;
  UserModel.find(function (err, users){
    if(err) {} //TODO handle errors
    else
      res = users;
  });
  return res;
}

function getOneUser(id) {
  'use strict';
  var res;
  UserModel.findById(id, function(err, user){
    if (err) {} //TODO handle errors
    else
      res = user;
  });
  return res;
}

function addUser(body) {
  'use strict';
  var res;
  var user = new UserModel({
    name: body.name,
    password: body.password
  });
  user.save(function (err, user) {
  if (err){} //TODO handle error
    else
      res = user.ObjectId;
  });
  return res;
}

function deleteUser(id, cb) {
  'use strict';
  var res;
  UserModel.findById(id, function(err, user){
    if (err) {} //TODO handle errors
    else
      cb();
  });
}

exports.deleteUser = deleteUser;
exports.addUser = addUser;
exports.getOneUser = getOneUser;
exports.getUsers = getUsers;
exports.userModel = userModel;
