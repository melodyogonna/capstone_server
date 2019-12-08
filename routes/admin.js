/**
 *Allow authenticated users to perform administrative actions like:
 *Admins can create categories
 *Employees can post gifs or articles
 *Employees can update their posts or articles
 *Employees can delete their posts or articles
 *Author - Anyaegbulam Melody Ogonna Daniel
 */

/* eslint-disable consistent-return */
const express = require('express');
// const bodyparser = require('body-parser');
const jwt = require('jsonwebtoken');
const fileupload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

const { Database: DB } = require('../models/miniORM');


// Activate Database;
const dburl = process.env.DATABASE_URL || 'localhost';
const db = new DB('capstone', 'root', '', dburl);
db.createConnection(() => {
  console.log('connected to database');
});

const router = express.Router();
// router.use(bodyparser.urlencoded({ extended: true }));
router.use(fileupload());

// Middleware to validate user
const checkToken = (request, response, next) => {
  const userToken = request.query.token;
  if (!userToken) {
    return response.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
  (() => {
    try {
      const userId = jwt.verify(userToken, 'secrets');
      db.selectOne('users', userId.data, (result) => {
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
        return response.status(403).json({ status: 'error', message: 'Session expired, please login again' });
      } if (error.name === 'JsonWebTokenError') {
        return response.status(400).json({ status: 'error', message: 'Error occured while validating user' });
      }
    }
  })();
};

router.use(checkToken);

// Admins can create a category
router.post('/create-category', (request, response) => {
  const { token } = request.query;
  const { name } = request.body;
  const userId = jwt.verify(token, 'secrets');

  if (!name || name === '') {
    return response.status(400).json({ status: 'error', message: 'Category name cannot be empty' });
  }
  db.selectOne('users', userId.data, (result) => {
    if (result[0].is_admin !== 1) {
      return response.status(401).json({ status: 'error', message: 'You don\'t have enough permission to perform this action' });
    }
    try {
      // eslint-disable-next-line arrow-body-style
      db.InsertCategory((res) => {
        return response.status(400).json({
          status: 'success',
          data: {
            message: 'Category created',
            categoryId: res.insertId,
            category: name,
          },
        });
      }, name);
    } catch (error) {
      return response.status(500).json({ status: 'error', message: 'Error occured while creating category' });
    }
  });
});

// Admins can edit category
router.post('/edit-category/:id', (request, response) => {
  const { token } = request.query;
  const { name } = request.body;
  const { id } = request.params;
  const userId = jwt.verify(token, 'secrets');

  if (!name || name === '') {
    return response.status(400).json({ status: 'error', message: 'Category name cannot be empty' });
  }
  db.selectOne('users', userId.data, (result) => {
    if (result[0].is_admin !== 1) {
      return response.status(401).json({ status: 'error', message: 'You don\'t have enough permission to perform this action' });
    }
    try {
      // eslint-disable-next-line arrow-body-style
      db.updateCategory(id, name, () => {
        return response.status(400).json({
          status: 'success',
          data: {
            message: 'Category updated',
            categoryId: id,
            category: name,
          },
        });
      });
    } catch (error) {
      return response.status(500).json({ status: 'error', message: 'Error occured while creating category' });
    }
  });
});

// Admins can delete a category
router.post('/delete-category/:id', (request, response) => {
  const { token } = request.query;
  const { id } = request.params;
  const userId = jwt.verify(token, 'secrets');

  db.selectOne('users', userId.data, (result) => {
    if (result[0].is_admin !== 1) {
      return response.status(401).json({ status: 'error', message: 'You don\'t have enough permission to perform this action' });
    }
    try {
      // eslint-disable-next-line arrow-body-style
      db.delete('category', id, () => {
        return response.status(400).json({
          status: 'success',
          message: 'Category created',
        });
      });
    } catch (error) {
      return response.status(500).json({ status: 'error', message: 'Error occured while creating category' });
    }
  });
});


// Admins and Employees can create a post
router.post('/create-post/:categoryId', (request, response) => {
  // Let's first get the necessary informations
  const { token } = request.query;
  const { title, body } = request.body;
  const { categoryId: category } = request.params;
  // Validate input
  if (title === '' || body === '' || !title || !body) {
    return response.status(400).json({ status: 'error', message: 'Please write a title and body' });
  }
  if (category === '' || category === undefined) {
    return response.status(400).json({ status: 'error', message: 'Category cannot be empty' });
  }
  db.selectOne('category', category, (results) => {
    if (results.length < 1) {
      return response.status(400).json({ status: 'error', message: 'Selected category does not exist or might have been deleted' });
    }
    const author = jwt.verify(token, 'secrets');
    try {
      const fields = [title, body, `'${Date.now()}'`, category, author.data];
      db.InsertPost((result) => {
        db.selectOne('posts', result.insertId, (postResult) => {
          const post = postResult[0];
          return response.status(200).json({
            status: 'success',
            data: {
              message: 'Article created successfully',
              articleId: post.id,
              createdOn: post.date,
              title: post.title,
            },
          });
        });
      }, ...fields);
    } catch (error) {
      return response.status(500).json({ status: 'error', message: 'Encountered an error while creating post' });
    }
  });
});

// edit a post
router.post('/edit-post/:postId', (request, response) => {
  // Let's first get the necessary informations
  const { token } = request.query;
  const { title, body } = request.body;
  const { postId } = request.params;

  // Validate input
  if (title === '' || body === '') {
    return response.status(400).json({ status: 'error', message: 'Please write a title and body' });
  }
  if (postId === '' || postId === undefined) {
    return response.status(400).json({ status: 'error', message: 'Invalid post' });
  }
  db.selectOne('posts', postId, (results) => {
    if (results.length < 1) {
      return response.status(400).json({ status: 'error', message: 'Selected post does not exist or might have been deleted' });
    }
    const author = jwt.verify(token, 'secrets');
    if (results[0].author !== author.data) {
      return response.status(401).json({ status: 'error', message: 'You can not perform this action' });
    }
    try {
      const fields = [title, body];
      db.updatePost(postId, fields, () => response.status(200).json({ status: 'success', data: { message: 'Updated', articleId: postId } }));
    } catch (error) {
      return response.status(500).json({ status: 'error', message: 'Encountered an error while creating post' });
    }
  });
});

// Delete Post
router.post('/delete-post/:postId', (request, response) => {
  // Let's first get the necessary informations
  const { token } = request.query;
  const { postId } = request.params;

  // Validate input
  if (postId === '' || postId === undefined) {
    return response.status(400).json({ status: 'error', message: 'Invalid post' });
  }

  // Select the post with the id and check if it was made by same user
  db.selectOne('posts', postId, (results) => {
    if (results.length < 1) {
      return response.status(400).json({ status: 'error', message: 'Selected post does not exist or might have been deleted' });
    }
    const author = jwt.verify(token, 'secrets');
    if (results[0].author !== author.data) {
      return response.status(401).json({ status: 'error', message: 'You can not perform this action' });
    }
    try {
      db.delete('posts', postId, () => response.status(200).json({ status: 'success', data: { message: 'Updated', articleId: postId } }));
    } catch (error) {
      return response.status(500).json({ status: 'error', message: 'Encountered an error while creating post' });
    }
  });
});

// Admins/ Employees can create gifs
router.post('/create-gif/:categoryId', (request, response) => {
  // Let's first get the necessary informations
  const { token } = request.query;
  const { title, body } = request.body;
  const { gif } = request.files;
  const { categoryId: category } = request.params;
  // Validate input
  if (title === '' || body === '' || !title || !body) {
    return response.status(400).json({ status: 'error', message: 'Please write a title and a description' });
  }
  if (!gif || gif.mimetype !== 'image/gif') {
    return response.status(400).json({ status: 'error', message: 'Please upload a gif' });
  }
  if (category === '' || category === undefined) {
    return response.status(400).json({ status: 'error', message: 'Category cannot be empty' });
  }
  db.selectOne('category', category, (results) => {
    if (results.length < 1) {
      return response.status(400).json({ status: 'error', message: 'Selected category does not exist or might have been deleted' });
    }
    const author = jwt.verify(token, 'secrets');
    try {
      cloudinary.uploader.upload(gif, { public_id: 'capstone/gifs/' }, (err, res) => {
        if (err) {
          throw err;
        }
        const fields = [title, body, `'${Date.now()}'`, category, res.secureurl, author.data];
        try {
          db.InsertGif((result) => {
            db.selectOne('gifs', result.insertId, (postResult) => {
              const post = postResult[0];
              return response.status(200).json({
                status: 'success',
                data: {
                  message: 'Article created successfully',
                  articleId: post.id,
                  createdOn: post.date,
                  title: post.title,
                },
              });
            });
          }, ...fields);
        } catch (dberr) {
          return response.status(500).json({ status: 'error', message: 'Encountered an error while creating gif' });
        }
      });
    } catch (error) {
      return response.status(500).json({ status: 'error', message: 'Encountered an error while creating gif' });
    }
  });
});


// edit a gif
router.post('/edit-gif/:gifId', (request, response) => {
  // Let's first get the necessary informations
  const { token } = request.query;
  const { title, body } = request.body;
  const { gifId } = request.params;
  const { gif } = request.files;

  // Validate input
  if (title === '' || body === '') {
    return response.status(400).json({ status: 'error', message: 'Please write a title and body' });
  }
  if (gifId === '' || gifId === undefined) {
    return response.status(400).json({ status: 'error', message: 'Invalid post' });
  }
  db.selectOne('gifs', gifId, (results) => {
    if (results.length < 1) {
      return response.status(400).json({ status: 'error', message: 'Selected post does not exist or might have been deleted' });
    }
    const author = jwt.verify(token, 'secrets');
    if (results[0].author !== author.data) {
      return response.status(401).json({ status: 'error', message: 'You can not perform this action' });
    }
    try {
      if (gif) {
        cloudinary.uploader.upload(gif, { public_id: 'capstone/gifs/' }, (err, res) => {
          if (err) {
            return response.status(500).json({ status: 'error', message: 'encountered an error while updating gif' });
          }
          const fields = [title, body, res.secureurl];
          db.updatePost(gifId, fields, () => response.status(200).json({ status: 'success', data: { message: 'Updated', gifId } }));
        });
      } else {
        const fields = [title, body];
        db.updatePost(gifId, fields, () => response.status(200).json({ status: 'success', data: { message: 'Updated', gifId } }));
      }
    } catch (error) {
      return response.status(500).json({ status: 'error', message: 'Encountered an error while creating gif' });
    }
  });
});

router.post('/delete-gif/:gifId', (request, response) => {
  // Let's first get the necessary informations
  const { token } = request.query;
  const { gifId } = request.params;

  // Validate input
  if (gifId === '' || gifId === undefined) {
    return response.status(400).json({ status: 'error', message: 'Invalid gif' });
  }

  // Select the post with the id and check if it was made by same user
  db.selectOne('gifs', gifId, (results) => {
    if (results.length < 1) {
      return response.status(400).json({ status: 'error', message: 'Selected gif does not exist or might have been deleted' });
    }
    const author = jwt.verify(token, 'secrets');
    if (results[0].author !== author.data) {
      return response.status(401).json({ status: 'error', message: 'You can not perform this action' });
    }
    try {
      db.delete('gifs', gifId, () => response.status(200).json({ status: 'success', data: { message: 'Deleted', gifId } }));
    } catch (error) {
      return response.status(500).json({ status: 'error', message: 'Encountered an error while deleting post' });
    }
  });
});
module.exports = router;
