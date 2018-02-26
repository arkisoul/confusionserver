var express = require('express');
var bodyParser = require('body-parser');
const User = require('../models/user');
var router = express.Router();

router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* SignUp End Point */
router.post('/signup', (req, res, next) => {
    User.findOne({username: req.body.username})
    .then((user) => {
        if (user != null) {
            let err = new Error(`User ${req.body.username} already exists!`);
            err.status = 403;
            next(err);
        }
        else {
            return User.create({
                username: req.body.username,
                password: req.body.password
            });
        }
    }, (err) => next(err))
    .then((user) => {
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.json({status: 'Registration Successful!', user: user});
    })
    .catch((err) => next(err));
});

/* Login End Point */
router.post('/login', (req, res, next) => {
    if (!req.session.user) {
      var authHeader = req.headers.authorization;
      if(!authHeader) {
        var err = new Error('You are not authenticated');
        res.setHeader('WWW-Authenticate', 'Basic');
        err.status = 401;
        next(err);
        return;
      }

      var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':');
      var username = auth[0];
      var password = auth[1];

      User.findOne({username: username})
      .then((user) => {
        if (user === null) {
            let err = new Error(`User ${username} does not exist!`);
            err.status = 403;
            return next(err);
        }
        else if(user.password !== password) {
            let err = new Error('Your password is incorrect');
            err.status = 403;
            return next(err);
        }
        else {
            req.session.user = 'authenticated';
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain');
            res.end('You are authenticated');
        }
      })
      .catch((err) => next(err));
    }
    else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are already authenticated');
    }
});

/* Logout End Point */
router.get('/logout', (req, res, next) => {
    if(req.session) {
        req.session.destroy();
        res.clearCookie('session-id');
        res.redirect('/');
    }
    else {
        let err = new Error('You are not logged in');
        err.status = 403;
        next(err);
    }
});

module.exports = router;
