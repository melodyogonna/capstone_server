/**
 * Allow authenticated users to perform actions like:
 * See Gifs posted by other employees
 * See articles posted by other employees
 * comment on Gifs posted by other employees
 * comment on articles posted by other employees
 * Get gifs based on category
 */

/* eslint-disable consistent-return */
const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const { Database: DB } = require('../models/miniORM');

// Activate Database;
const db = new DB('capstone');
db.createConnection(() => {
  console.log('connected to database');
});

const router = express.Router();

// Middleware to validate user
const checkToken = (request, response, next) => {
  const userToken = request.query.token;
  if (!userToken) {
    return response.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
  (() => {
    try {
      const userId = jwt.verify(userToken, 'secrets');
      db.selectOne('users', userId, (result) => {
        const currentUser = result[0];
        if (currentUser) {
          next();
        }
        if (!currentUser) {
          return response.status(403).json({ status: 'error', message: 'Invalid user' });
        }
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        response.status(400).json({ status: 'error', message: 'Session expired, please login again' });
      } else if (error.name === 'JsonWebTokenError') {
        response.status(400).json({ status: 'error', message: 'Error occured while validating user' });
      }
    }
  })();
};

router.use(checkToken);

// Return all the GIFS that is not deleted
router.get('/gifs', (request, response) => {
  db.selectAll('gifs', '', (results) => {
    if (results.length < 1) {
      return response.status(200).json({ status: 'success', data: [] });
    }
    if (results.length === 1) {
      if (results[0].is_deleted === 1) {
        return response.status(200).json({ status: 'success', data: [] });
      }
      return response.status(200).json({ status: 'success', data: results });
    }
    if (results.length > 1) {
      const data = results.map((result) => result.is_deleted !== 1);
      return response.status(200).json({ status: 'success', data });
    }
  });
});

// Return all the Posts that is not deleted
router.get('/posts', (request, response) => {
  db.selectAll('posts', '', (results) => {
    if (results.length < 1) {
      return response.status(200).json({ status: 'success', data: [] });
    }
    if (results.length === 1) {
      if (results[0].is_deleted === 1) {
        return response.status(200).json({ status: 'success', data: [] });
      }
      return response.status(200).json({ status: 'success', data: results });
    }
    if (results.length > 1) {
      const data = results.map((result) => result.is_deleted !== 1);
      return response.status(200).json({ status: 'success', data });
    }
  });
});

// Return all the Posts that is not deleted that has a specific id
router.get('/posts/:id', (request, response) => {
  const id = request.params.id
  db.selectOne('posts', id, (results) => {
    if (results.length < 1) {
      return response.status(200).json({ status: 'success', data: [] });
    }
    if (results.length === 1) {
      if (results[0].is_deleted === 1) {
        return response.status(200).json({ status: 'success', data: [] });
      }
      return response.status(200).json({ status: 'success', data: results });
    }
  });
});

// Return all the Gifs that is not deleted that has a specific id
router.get('/posts/:id', (request, response) => {
  const id = request.params.id
  db.selectOne('posts', id, (results) => {
    if (results.length < 1) {
      return response.status(200).json({ status: 'success', data: [] });
    }
    if (results.length === 1) {
      if (results[0].is_deleted === 1) {
        return response.status(200).json({ status: 'success', data: [] });
      }
      return response.status(200).json({ status: 'success', data: results });
    }
  });
});

// Return all the Posts Comments that is not deleted
router.get('/postcomments/:postid', (request, response) => {
  const postId = request.params.postId
  db.selectAll('post_comments', `post=${postId}`, (results) => {
    if (results.length < 1) {
      return response.status(200).json({ status: 'success', data: [] });
    }
    return response.status(200).json({ status: 'success', data: results });
  });
});

// Return all the Gifcomments Comments that is not deleted
router.get('/gifcomments/:gifId', (request, response) => {
  const postId = request.params.gifId
  db.selectAll('gif_comment', `gif_post=${postId}`, (results) => {
    if (results.length < 1) {
      return response.status(200).json({ status: 'success', data: [] });
    }
    return response.status(200).json({ status: 'success', data: results });
  });
});

module.exports = router;
