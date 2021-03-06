/**
 * Authorize and authenticated users
 * Authenticated users is assigned a token which needs to be appended to urls on request
 * contains routes to:
 * Register admins
 * Allow admins to register other users and
 * login
 * Author - Anyaegbulam Melody Ogonna Daniel
 */

/* eslint-disable consistent-return */
const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Database: DB } = require('../models/miniORM');

// Activate Database;
const dburl = process.env.DATABASE_URL || 'localhost';
const db = new DB('capstone', 'root', '', dburl);
db.createConnection(() => {
  console.log('connected to database');
});

const router = express.Router();
router.use(bodyparser.urlencoded({ extended: true }));

// Handle user login. Both for admin and normal user
router.post('/login', (request, response) => {
  // eslint-disable-next-line prefer-destructuring
  const email = request.body.email;
  // eslint-disable-next-line prefer-destructuring
  const password = request.body.password;
  // check if email and password is filled out
  if (email === '' || password === '') {
    return response.json({ stutus: 'error', message: 'Email or Password is Empty' });
  }
  // Selectall fields from the users table where email is matched.
  db.selectAll('users', `email=${mysql.escape(email)}`, (result) => {
    const user = result[0] || 'none';
    console.log(result);
    if (user !== 'none') {
      // compare password if user exists
      bcrypt.compare(password, user.password).then((res) => {
        if (res === true) {
          const token = jwt.sign({ data: user.id }, 'secrets', { expiresIn: '1h' });
          response.json({ status: 'success', data: { token, UserId: user.id } });
        }
        response.json({ status: 'error', message: 'Wrong password' });
      });
    }
    if (user === 'none') {
      response.json({ status: 'error', message: 'Wrong email' });
    }
  });
});

// Handle registration for admin
router.post('/admin-register', (request, response) => {
  // eslint-disable-next-line prefer-destructuring
  const fullname = request.body.fullname;
  // eslint-disable-next-line prefer-destructuring
  const username = request.body.username;
  // eslint-disable-next-line prefer-destructuring
  const email = request.body.email;
  // eslint-disable-next-line prefer-destructuring
  const password = request.body.password;
  // eslint-disable-next-line prefer-destructuring
  const confirmPassword = request.body.cpassword;

  // Regular expression to test valid email
  const emailformat = /\w+\.?@\w+\.\w+/;

  // Regular expression to test valid username
  const usernameFormat = /\W+/;

  // Create user
  const createUser = () => {
    // Hash password
    bcrypt.genSalt(12, (error, salt) => {
      if (error) {
        return response.json({ status: 'error', message: 'Error occured during registration' });
      }

      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          return response.json({ status: 'error', message: 'Error occured during registration' });
        }

        // Let's make a MySQL escaped field of arrays first
        // eslint-disable-next-line max-len
        const fields = [fullname, username, email, hash, 1];
        db.InsertUser((result) => {
          const token = jwt.sign({ data: result.insertId }, 'secrets', { expiresIn: '1h' });
          return response.json({ status: 'success', data: { token, UserId: result.insertId } });
        }, ...fields);
      });
    });
  };

  // validation for submitted fields
  if (fullname === '' || username === '' || email === '' || password === '' || confirmPassword === '') {
    return response.json({ status: 'error', message: 'Please fill out every field' });
  }
  if (emailformat.test(email) === false) {
    return response.json({ status: 'error', message: 'Please enter a valid email' });
  }
  if (password.length < 8) {
    return response.json({ status: 'error', message: 'Password is too short' });
  }
  if (password !== confirmPassword) {
    return response.json({ status: 'error', message: 'Password and Confirm password field don\'t match' });
  }
  if (username.length < 5) {
    return response.json({ status: 'error', message: 'Username is too small, should be upto 5 charaters' });
  }
  if (usernameFormat.test(username) === true) {
    return response.json({ status: 'error', message: 'Username cannot contain special charaters or spaces' });
  }

  (() => {
    db.selectAll('users', `email=${mysql.escape(email)}`, (result) => {
      if (result.length > 0) {
        response.json({ status: 'error', message: 'A user with that email already exists' });
      }
      if (result.length <= 0) {
        db.selectAll('users', `username=${mysql.escape(username)}`, (results) => {
          if (results.length > 0) {
            response.json({ status: 'error', message: 'A user with that username already exists' });
          }
          if (results.length <= 0) {
            // Validations passed, let's create a new administator shall we?
            createUser();
          }
        });
      }
    });
  })();
});

// Handle registration for normal users
router.post('/register', (request, response) => {
  // Let's check if the request is validated first
  // eslint-disable-next-line prefer-destructuring
  const userToken = request.query.token;
  if (!userToken) {
    return response.json({ status: 'error', message: 'Unauthorized' });
  }

  // eslint-disable-next-line prefer-destructuring
  const fullname = request.body.fullname;
  // eslint-disable-next-line prefer-destructuring
  const username = request.body.username;
  // eslint-disable-next-line prefer-destructuring
  const email = request.body.email;
  // eslint-disable-next-line prefer-destructuring
  const password = request.body.password;
  // eslint-disable-next-line prefer-destructuring
  const confirmPassword = request.body.cpassword;

  // Regular expression to test valid email
  const emailformat = /\w+\.?@\w+\.\w+/;

  // Regular expression to test valid username
  const usernameFormat = /\W+/;

  // Create user
  const createUser = () => {
    // Generate salt to Hash password
    bcrypt.genSalt(12, (error, salt) => {
      if (error) {
        return response.json({ status: 'error', message: 'Error occured during registration' });
      }

      // Hash password
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          return response.json({ status: 'error', message: 'Error occured during registration' });
        }

        // Let's make a MySQL escaped field of arrays first
        // eslint-disable-next-line max-len
        const fields = [fullname, username, email, hash];
        db.InsertUser((result) => {
          const token = jwt.sign({ data: result.insertId }, 'secrets', { expiresIn: '1h' });
          return response.json({ status: 'success', data: { token, UserId: result.insertId } });
        }, ...fields);
      });
    });
  };

  // eslint-disable-next-line consistent-return
  const validateInput = () => {
    // validation for submitted fields
    if (fullname === '' || username === '' || email === '' || password === '' || confirmPassword === '') {
      return response.json({ status: 'error', message: 'Please fill out every field' });
    }
    if (emailformat.test(email) === false) {
      return response.json({ status: 'error', message: 'Please enter a valid email' });
    }
    if (password.length < 8) {
      return response.json({ status: 'error', message: 'Password is too short' });
    }
    if (password !== confirmPassword) {
      return response.json({ status: 'error', message: 'Password and Confirm password field don\'t match' });
    }
    if (username.length < 5) {
      return response.json({ status: 'error', message: 'Username is too small, should be upto 5 charaters' });
    }
    if (usernameFormat.test(username) === true) {
      return response.json({ status: 'error', message: 'Username cannot contain special charaters or spaces' });
    }

    (() => {
      db.selectAll('users', `email=${mysql.escape(email)}`, (result) => {
        if (result.length > 0) {
          response.json({ status: 'error', message: 'A user with that email already exists' });
        }
        if (result.length <= 0) {
          db.selectAll('users', `username=${mysql.escape(username)}`, (results) => {
            if (results.length > 0) {
              response.json({ status: 'error', message: 'A user with that username already exists' });
            }
            if (results.length <= 0) {
              // Validations passed, let's create a new administator shall we?
              return createUser();
            }
          });
        }
      });
    })();
  };

  // Decode token and validate user permission
  (() => {
    console.log('decode token');
    try {
      const userId = jwt.verify(userToken, 'secrets');
      db.selectOne('users', userId, (result) => {
        const currentUser = result[0];
        if (currentUser) {
          if (currentUser.is_admin === 1) {
            console.log(currentUser.is_admin);
            validateInput();
          }
          if (currentUser.is_admin === 0) {
            return response.json({ status: 'error', message: 'You don\'t have enough permisson to perform this action ' });
          }
        }
        if (!currentUser) {
          return response.json({ status: 'error', message: 'Invalid user' });
        }
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        response.json({ status: 'error', message: 'Session expired, please login again' });
      } else if (error.name === 'JsonWebTokenError') {
        response.json({ status: 'error', message: 'Error occured while validating user' });
      }
    }
  })();
});

module.exports = router;
