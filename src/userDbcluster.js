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

function getUsers(cb) {
  'use strict';

  UserModel.find(function (err, users){
    if(err) {} //TODO handle errors
    cb(err, users);
  });
}

function getOneUser(id, cb) {
  'use strict';
  UserModel.findById(id, function(err, user){
    if (err) {} //TODO handle errors
    cb(err, user);
  });
}

function addUser(body, cb) {
  'use strict';
  var user = new UserModel({
    name: body.name,
    password: body.password
  });
  user.save(function (err, userSaved) {
    if (err){} //TODO handle error
    cb(err, user.id);
  });
}

function deleteUser(id, cb) {
  'use strict';
  UserModel.findById(id, function(err, user){
    if (err) {} //TODO handle errors
      user.remove(function(err){
        if (err){}
        cb(err);
      });
  });
}

exports.deleteUser = deleteUser;
exports.addUser = addUser;
exports.getOneUser = getOneUser;
exports.getUsers = getUsers;
