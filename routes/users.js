'use strict';

const bcrypt = require('bcrypt-as-promised');
const boom = require('boom');
const express = require('express');
const jwt = require('jsonwebtoken');
const knex = require('../knex');
const router = express.Router();
const { camelizeKeys, decamelizeKeys } = require('humps');

const authorize = function(req, res, next) {
  jwt.verify(req.cookies.token, process.env.JWT_KEY, (err, payload) => {
    if (err) {
      return next(boom.create(401, 'Unauthorized'));
    }

    req.claim = payload;

    next();
  });
};

router.get('/users', authorize, (req, res, next) => {
  knex('users')
    .where('id', req.claim.userId)
    .first()
    .then((user) => {
      if (!user) {
        throw boom.create(404, 'User not found');
      }

      res.send(user);
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/users', (req, res, next) => {
  const { firstName, lastName, email, city, state, password } = req.body;

  if (!email || !email.trim()) {
    return next(boom.create(400, 'Email must not be blank'));
  }

  if (!password || password.length < 8) {
    return next(boom.create(400, 'Password must be at least 8 characters long')); // eslint-disable-line max-len
  }

  knex('users')
    .where('email', email)
    .first()
    .then((existingUser) => {
      if (existingUser) {
        return next(boom.create(400, 'Email already exists'));
      }

      return bcrypt.hash(password, 12);
    })

    .then((hashedPassword) => {
      return knex('users')
        .insert(decamelizeKeys({ firstName, lastName, email, city, state, hashedPassword }), '*'); // eslint-disable-line max-len
    })
    .then((users) => {
      const user = camelizeKeys(users[0]);

      const claim = { userId: user.id };
      const token = jwt.sign(claim, process.env.JWT_KEY, {
        expiresIn: '500 days'
      });

      res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 500),
        secure: router.get('env') === 'production'
      });

      delete user.hashedPassword;

      res.send(user);
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
