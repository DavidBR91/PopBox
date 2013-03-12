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
var config = require('./config');
var passport = require('passport');
var bcrypt = require('bcrypt');

var UserSchema = mongoose.Schema({
  name: {type: String, required: true},
  email: {type:String, required: true},

  salt: {type:String, required: true},
  hash: {type:String, required: true}
});

var UserModel = mongoose.model('UserModel', UserSchema);

UserSchema.methods.setPassword = function (password, done) {
    var that = this;
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            that.hash = hash;
            that.salt = salt;
            done(that);
        });
    });
};

// Passport strategy and user serialization

// Passport session setup.
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  UserModel.findById(id, function (err, user) {
    done(err, user);
  });
});

// Use the LocalStrategy within Passport.
passport.use(new LocalStrategy({
    usernameField: 'name'
  },
  function(email, password, done) {
    UserModel.authenticate(email, password, function(err, user) {
      return done(err, user);
    });
  }
));

UserSchema.method('verifyPassword', function(password, callback) {
  bcrypt.compare(password, this.hash, callback);
});

UserSchema.static('authenticate', function(name, password, callback) {
  UserModel.findOne({ name: name }, function(err, user) {
      if (err) {
        return callback(err);
      }
      if (!user) {
        return callback(null, false);
      }
      user.verifyPassword(password, function(err, passwordCorrect) {
        if (err) {
          return callback(err);
        }
        if (!passwordCorrect) {
          return callback(null, false);
        }
        return callback(null, user);
      });
    });
});

//User methods
function addUser(body, cb) {
  'use strict';
  var user = new UserModel({
    name: body.name
  }).setPassword(req.param("password"), function(newUser) {
      newUser.save(function(err) {
        cb(err, newUser.id);
      });
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

function connectToDb (){
  mongoose.connect('mongodb://' + config.userDatabase.host + ':' +
   config.userDatabase.port + '/' + config.userDatabase.name);
}

exports.deleteUser = deleteUser;
exports.addUser = addUser;
exports.getOneUser = getOneUser;
exports.getUsers = getUsers;
exports.connecToDb = connectToDb;
