var paypalApi = require('paypal-rest-sdk');
var userDb = require('./userDb.js');
var config = require('./config.js');
var _ = require('underscore');

function increasePayloadLength (req, res) {
  'use strict';
  userDb.authenticate(req.headers['name'], req.headers['password'], function (user, id) {
    if (user !== undefined) {
      var payloadIncrease = req.body.payloadIncrease;
      var customerInfo = _.omit(req.body, 'payloadLength');
      var totalCost = payloadIncrease*0.001;
      var transInfo = {
          "amount": {
            "total": totalCost,
              "currency": "USD",
              "details": {
                "subtotal": totalCost,
                "tax": "1",
                "shipping": "1"
              }
            },
        "description": "This is the payment transaction description."
      };
      var paymentJSON = {
          "intent": "sale",
          "payer": customerInfo,
          "transactions": [transInfo]
      };
      paypalApi.payment.create(paymentJSON, config.paypalConfig, function (err, res) {
        if(err) {
          res.send({errors: [err]}, 400);
        } else {
          userDb.increaseUserPayload(user, payloadIncrease, function (err) {
            if(err) {
              res.send({errors: [err]}, 400);
            } else {
              res.send({ok: true});
            }
          });
        }
      });
    }
  });
}

function increaseExpirationDate (req, res) {
  'use strict';
  userDb.authenticate(req.headers['name'], req.headers['password'], function (user, id) {
    if (user !== undefined) {
      var expirationIncrease = req.body.expirationIncrease;
      var customerInfo = _.omit(req.body, 'expirationIncrease');
      var totalCost = expirationIncrease*10;
      var transInfo = {
          "amount": {
            "total": totalCost,
              "currency": "USD",
              "details": {
                "subtotal": totalCost,
                "tax": "1",
                "shipping": "1"
              }
            },
        "description": "This is the payment transaction description."
      };
      var paymentJSON = {
          "intent": "sale",
          "payer": customerInfo,
          "transactions": [transInfo]
      };
      paypalApi.payment.create(paymentJSON, config.paypalConfig, function (err, res) {
        if(err) {
          res.send({errors: [err]}, 400);
        } else {
          userDb.increaseUserExpiration(user, expirationIncrease, function (err) {
            if(err) {
              res.send({errors: [err]}, 400);
            } else {
              res.send({ok: true});
            }
          });
        }
      });
    }
  });
}

exports.expirationIncrease = expirationIncrease;
exports.increasePayloadLength = increasePayloadLength;
