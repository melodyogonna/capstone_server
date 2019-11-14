/* eslint-disable consistent-return */
const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
<<<<<<< HEAD
const DB = require('../models/miniORM');
=======
const { Database: DB } = require('../models/miniORM');
>>>>>>> post-routes

// Activate Database;
const db = new DB('capstone');
db.createConnection(() => {
  console.log('connected to database');
});

const router = express.Router();
router.use(bodyparser.urlencoded());

// Handle user login. Both for admin and normal user
router.post('/login', (request, response) => {
  // eslint-disable-next-line prefer-destructuring
  const email = request.body.email;
  // eslint-disable-next-line prefer-destructuring
  const password = request.body.password;
  // check if email and password is filled out
  if (email === '' || password === '') {
<<<<<<< HEAD
    return response.json({ stutus: 'error', message: 'Email or Password is Empty' });
=======
    return response.status(400).json({ stutus: 'error', message: 'Email or Password is Empty' });
>>>>>>> post-routes
  }
  // Selectall fields from the users table where email is matched.
  db.selectAll('users', `email=${mysql.escape(email)}`, (result) => {
    const user = result[0] || 'none';
    console.log(result);
    if (user !== 'none') {
      // compare password if user exists
      bcrypt.compare(password, user.password).then((res) => {
        if (res === true) {
          const token = jwt.sign(user.id, 'secrets');
<<<<<<< HEAD
          response.json({ status: 'success', data: { token, UserId: user.id } });
        }
        response.json({ status: 'error', message: 'Wrong password' });
      });
    }
    if (user === 'none') {
      response.json({ status: 'error', message: 'Wrong email' });
=======
          response.status(200).json({ status: 'success', data: { token, UserId: user.id } });
        }
        response.status(400).json({ status: 'error', message: 'Wrong password' });
      });
    }
    if (user === 'none') {
      response.status(400).json({ status: 'error', message: 'Wrong email' });
>>>>>>> post-routes
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
<<<<<<< HEAD
        return response.json({ status: 'error', message: 'Error occured during registration' });
=======
        return response.status(500).json({ status: 'error', message: 'Error occured during registration' });
>>>>>>> post-routes
      }

      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
<<<<<<< HEAD
          return response.json({ status: 'error', message: 'Error occured during registration' });
=======
          return response.status(500).json({ status: 'error', message: 'Error occured during registration' });
>>>>>>> post-routes
        }

        // Let's make a MySQL escaped field of arrays first
        // eslint-disable-next-line max-len
        const fields = [fullname, username, email, hash, 1];
        db.InsertUser((result) => {
          const token = jwt.sign(result.insertId, 'secrets');
<<<<<<< HEAD
          return response.json({ status: 'success', data: { token, UserId: result.insertId } });
=======
          return response.status(200).json({ status: 'success', data: { token, UserId: result.insertId } });
>>>>>>> post-routes
        }, ...fields);
      });
    });
  };

  // validation for submitted fields
  if (fullname === '' || username === '' || email === '' || password === '' || confirmPassword === '') {
<<<<<<< HEAD
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
=======
    return response.status(400).json({ status: 'error', message: 'Please fill out every field' });
  }
  if (emailformat.test(email) === false) {
    return response.status(400).json({ status: 'error', message: 'Please enter a valid email' });
  }
  if (password.length < 8) {
    return response.status(400).json({ status: 'error', message: 'Password is too short' });
  }
  if (password !== confirmPassword) {
    return response.status(400).json({ status: 'error', message: 'Password and Confirm password field don\'t match' });
  }
  if (username.length < 5) {
    return response.status(400).json({ status: 'error', message: 'Username is too small, should be upto 5 charaters' });
  }
  if (usernameFormat.test(username) === true) {
    return response.status(400).json({ status: 'error', message: 'Username cannot contain special charaters or spaces' });
>>>>>>> post-routes
  }

  (() => {
    db.selectAll('users', `email=${mysql.escape(email)}`, (result) => {
      if (result.length > 0) {
<<<<<<< HEAD
        response.json({ status: 'error', message: 'A user with that email already exists' });
=======
        response.status(400).json({ status: 'error', message: 'A user with that email already exists' });
>>>>>>> post-routes
      }
      if (result.length <= 0) {
        db.selectAll('users', `username=${mysql.escape(username)}`, (results) => {
          if (results.length > 0) {
<<<<<<< HEAD
            response.json({ status: 'error', message: 'A user with that username already exists' });
=======
            response.status(400).json({ status: 'error', message: 'A user with that username already exists' });
>>>>>>> post-routes
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
<<<<<<< HEAD
    return response.json({ status: 'error', message: 'Unauthorized' });
=======
    return response.status(401).json({ status: 'error', message: 'Unauthorized' });
>>>>>>> post-routes
  }

  // eslint-disable-next-line prefer-destructuring
  const fullname = request.body.fullname;
<<<<<<< HEAD
  console.log(fullname)
=======
>>>>>>> post-routes
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
<<<<<<< HEAD
        return response.json({ status: 'error', message: 'Error occured during registration' });
=======
        return response.status(500).json({ status: 'error', message: 'Error occured during registration' });
>>>>>>> post-routes
      }

      // Hash password
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
<<<<<<< HEAD
          return response.json({ status: 'error', message: 'Error occured during registration' });
=======
          return response.status(500).json({ status: 'error', message: 'Error occured during registration' });
>>>>>>> post-routes
        }

        // Let's make a MySQL escaped field of arrays first
        // eslint-disable-next-line max-len
        const fields = [fullname, username, email, hash];
        db.InsertUser((result) => {
          const token = jwt.sign(result.insertId, 'secrets');
<<<<<<< HEAD
          return response.json({ status: 'success', data: { token, UserId: result.insertId } });
=======
          return response.status(200).json({ status: 'success', data: { token, UserId: result.insertId } });
>>>>>>> post-routes
        }, ...fields);
      });
    });
  };

  // eslint-disable-next-line consistent-return
  const validateInput = () => {
    // validation for submitted fields
    console.log('validate user');
    console.log(fullname)
    if (fullname === '' || username === '' || email === '' || password === '' || confirmPassword === '') {
<<<<<<< HEAD
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
=======
      return response.status(400).json({ status: 'error', message: 'Please fill out every field' });
    }
    if (emailformat.test(email) === false) {
      return response.status(400).json({ status: 'error', message: 'Please enter a valid email' });
    }
    if (password.length < 8) {
      return response.status(400).json({ status: 'error', message: 'Password is too short' });
    }
    if (password !== confirmPassword) {
      return response.status(400).json({ status: 'error', message: 'Password and Confirm password field don\'t match' });
    }
    if (username.length < 5) {
      return response.status(400).json({ status: 'error', message: 'Username is too small, should be upto 5 charaters' });
    }
    if (usernameFormat.test(username) === true) {
      return response.status(400).json({ status: 'error', message: 'Username cannot contain special charaters or spaces' });
>>>>>>> post-routes
    }

    (() => {
      console.log('chcek email');
      db.selectAll('users', `email=${mysql.escape(email)}`, (result) => {
        if (result.length > 0) {
<<<<<<< HEAD
          response.json({ status: 'error', message: 'A user with that email already exists' });
=======
          response.status(400).json({ status: 'error', message: 'A user with that email already exists' });
>>>>>>> post-routes
        }
        if (result.length <= 0) {
          db.selectAll('users', `username=${mysql.escape(username)}`, (results) => {
            if (results.length > 0) {
<<<<<<< HEAD
              response.json({ status: 'error', message: 'A user with that username already exists' });
=======
              response.status(400).json({ status: 'error', message: 'A user with that username already exists' });
>>>>>>> post-routes
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
<<<<<<< HEAD
    console.log('decode token');
=======
>>>>>>> post-routes
    try {
      const userId = jwt.verify(userToken, 'secrets');
      db.selectOne('users', userId, (result) => {
        const currentUser = result[0];
        if (currentUser) {
          if (currentUser.is_admin === 1) {
<<<<<<< HEAD
            console.log(currentUser.is_admin);
            validateInput();
          }
          if (currentUser.is_admin === 0) {
            return response.json({ status: 'error', message: 'You don\'t have enough permisson to perform this action ' });
          }
        }
        if (!currentUser) {
          return response.json({ status: 'error', message: 'Invalid user' });
=======
            validateInput();
          }
          if (currentUser.is_admin === 0) {
            return response.status(401).json({ status: 'error', message: 'You don\'t have enough permisson to perform this action ' });
          }
        }
        if (!currentUser) {
          return response.status(403).json({ status: 'error', message: 'Invalid user' });
>>>>>>> post-routes
        }
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
<<<<<<< HEAD
        response.json({ status: 'error', message: 'Session expired, please login again' });
      } else if (error.name === 'JsonWebTokenError') {
        response.json({ status: 'error', message: 'Error occured while validating user' });
=======
        response.status(400).json({ status: 'error', message: 'Session expired, please login again' });
      } else if (error.name === 'JsonWebTokenError') {
        response.status(400).json({ status: 'error', message: 'Error occured while validating user' });
>>>>>>> post-routes
      }
    }
  })();
});

module.exports = router;
