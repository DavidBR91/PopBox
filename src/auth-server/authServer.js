var express = require('express');

var app = express.net.createapp();

app.port(5001);
app.use(express.query());
app.use(express.bodyParser());
app.use(express.router());

//Rest API TODO: logic
app.post('/users', function (){});

app.get('/trans/:id_trans', function (){});
app.put('/trans/:id_trans', function (){});
app.post('/trans/:id_trans/payload', function (){});
app.post('/trans/:id_trans/expirationDate', function (){});
app.post('/trans/:id_trans/callback', function (){});
app.post('/trans', function (){});
app.get('/queue/:id', function (){});
app.post('/queue/:id/pop', function (){});
app.get('/queue/:id/peek', function (){});
