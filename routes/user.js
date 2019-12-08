/* eslint-disable camelcase */
/**
 * Allow authenticated users to perform less administrative actions like:
 * See Gifs posted by other employees
 * See articles posted by other employees
 * comment on Gifs posted by other employees
 * comment on articles posted by other employees
 * Get gifs based on category
 * Author - Anyaegbulam Melody Ogonna Daniel
 */

/* eslint-disable consistent-return */

const express = require('express');
const bodyparser = require('body-parser');
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
        return response.status(400).json({ status: 'error', message: 'Session expired, please login again' });
      } if (error.name === 'JsonWebTokenError') {
        return response.status(400).json({ status: 'error', message: 'Error occured while validating user' });
      }
    }
  })();
};

router.use(checkToken);

// Return author name
async function author(id) {
  return new Promise((resolve) => {
    db.selectOne('users', id, (result) => {
      if (result.length === 0) {
        return resolve('unknown author');
      }
      const user = `${result[0].fullname}`;
      return resolve(user);
    });
  });
}

// Return category name
function category(id) {
  return new Promise((resolve) => {
    db.selectOne('category', id, (result) => {
      if (result.length === 0) {
        return resolve('uncategorized');
      }
      const user = `${result[0].name}`;
      return resolve(user);
    });
  });
}

// Return full details
// eslint-disable-next-line arrow-body-style
const fulldetails = (arr) => {
  return new Promise((resolve) => {
    arr.map(async (currentValue, index) => {
      const auth = await author(currentValue.author).then((user) => user);
      const categoryName = await category(currentValue.category).then((c) => c);
      // eslint-disable-next-line no-param-reassign
      currentValue.authorname = auth;
      // eslint-disable-next-line no-param-reassign
      currentValue.categoryName = categoryName;
      if (index === arr.length - 1) {
        // console.log(arr);
        resolve(arr);
      }
    });
  });
};

// Return all the GIFS that is not deleted
router.get('/gifs', async (request, response) => {
  const cat = request.query.category;

  if (cat) {
    try {
      return db.selectAll('gifs', `gif_category=${cat}`, async (results) => {
        if (results.length < 1) {
          return response.status(200).json({ status: 'success', data: [] });
        }
        if (results.length === 1) {
          if (results[0].is_deleted === 1) {
            return response.status(200).json({ status: 'success', data: [] });
          }
          fulldetails(results).then((arr) => response.status(200).json({ status: 'success', data: arr }));
        }
        if (results.length > 1) {
          const data = results.filter((result) => result.is_deleted !== 1);
          fulldetails(data).then((arr) => response.status(200).json({ status: 'success', data: arr }));
        }
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ status: 'error', message: 'Error while retriving posts' });
    }
  }
  try {
    db.selectAll('gifs', '', (results) => {
      if (results.length < 1) {
        return response.status(200).json({ status: 'success', data: [] });
      }
      if (results.length === 1) {
        if (results[0].is_deleted === 1) {
          return response.status(200).json({ status: 'success', data: [] });
        }
        fulldetails(results).then((arr) => response.status(200).json({ status: 'success', data: arr }));
      }
      if (results.length > 1) {
        const data = results.filter((result) => result.is_deleted !== 1);
        fulldetails(data).then((arr) => response.status(200).json({ status: 'success', data: arr }));
      }
    });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ status: 'error', message: 'Error while retriving gifs' });
  }
});

// Return all the GIFS that is not deleted ordered by date
router.get('/gifs-sorted', async (request, response) => {
  const cat = request.query.category;
  const auth = author(1).then((user) => user);
  console.log(await auth);
  if (cat) {
    try {
      return db.select('*', 'gifs', `gif_category=${cat}`, '', 'date ASC', (results) => {
        if (results.length < 1) {
          return response.status(200).json({ status: 'success', data: [] });
        }
        if (results.length === 1) {
          if (results[0].is_deleted === 1) {
            return response.status(200).json({ status: 'success', data: [] });
          }
          fulldetails(results).then((arr) => response.status(200).json({ status: 'success', data: arr }));
        }
        if (results.length > 1) {
          const data = results.filter((result) => result.is_deleted !== 1);
          fulldetails(data).then((arr) => response.status(200).json({ status: 'success', data: arr }));
        }
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ status: 'error', message: 'Error while retriving posts' });
    }
  }
  try {
    db.select('*', 'gifs', '', '', 'date ASC', (results) => {
      if (results.length < 1) {
        return response.status(200).json({ status: 'success', data: [] });
      }
      if (results.length === 1) {
        if (results[0].is_deleted === 1) {
          return response.status(200).json({ status: 'success', data: [] });
        }
        fulldetails(results).then((arr) => response.status(200).json({ status: 'success', data: arr }));
      }
      if (results.length > 1) {
        const data = results.filter((result) => result.is_deleted !== 1);
        fulldetails(data).then((arr) => response.status(200).json({ status: 'success', data: arr }));
      }
    });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ status: 'error', message: 'Error while retriving gifs' });
  }
});


// Return all the Posts that is not deleted
router.get('/posts', (request, response) => {
  const cat = request.query.category;
  // Select by category
  if (cat) {
    try {
      return db.selectAll('posts', `category=${cat}`, (results) => {
        if (results.length < 1) {
          return response.status(200).json({ status: 'success', data: [] });
        }
        if (results.length === 1) {
          if (results[0].is_deleted === 1) {
            return response.status(200).json({ status: 'success', data: [] });
          }
          fulldetails(results).then((arr) => response.status(200).json({ status: 'success', data: arr }));
        }
        if (results.length > 1) {
          const data = results.filter((result) => result.is_deleted !== 1);
          fulldetails(data).then((arr) => response.status(200).json({ status: 'success', data: arr }));
        }
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ status: 'error', message: 'Error while retriving posts' });
    }
  }
  try {
    db.selectAll('posts', '', async (results) => {
      if (results.length < 1) {
        return response.status(200).json({ status: 'success', data: [] });
      }
      if (results.length === 1) {
        if (results[0].is_deleted === 1) {
          return response.status(200).json({ status: 'success', data: [] });
        }
        fulldetails(results).then((arr) => response.status(200).json({ status: 'success', data: arr }));
      }
      if (results.length > 1) {
        const data = await results.filter((result) => result.is_deleted !== 1);
        fulldetails(data).then((arr) => response.status(200).json({ status: 'success', data: arr }));
      }
    });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ status: 'error', message: 'Error while retriving posts' });
  }
});

// Return all the Posts ordered by Date posted that is not deleted
router.get('/posts-sorted', async (request, response) => {
  const cat = request.query.category;
  const me = await author(1).then((user) => user);
  console.log(me);
  if (cat) {
    try {
      return db.select('*', 'posts', `category=${cat}`, '', 'date ASC', (results) => {
        if (results.length < 1) {
          return response.status(200).json({ status: 'success', data: [] });
        }
        if (results.length === 1) {
          if (results[0].is_deleted === 1) {
            return response.status(200).json({ status: 'success', data: [] });
          }
          fulldetails(results).then((arr) => response.status(200).json({ status: 'success', data: arr }));
        }
        if (results.length > 1) {
          const data = results.filter((result) => result.is_deleted !== 1);
          fulldetails(data).then((arr) => response.status(200).json({ status: 'success', data: arr }));
        }
      });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ status: 'error', message: 'Error while retriving posts' });
    }
  }

  try {
    db.select('*', 'posts', '', '', 'date DESC', (results) => {
      if (results.length < 1) {
        return response.status(200).json({ status: 'success', data: [] });
      }
      if (results.length === 1) {
        if (results[0].is_deleted === 1) {
          return response.status(200).json({ status: 'success', data: [] });
        }
        fulldetails(results).then((arr) => response.status(200).json({ status: 'success', data: arr }));
      }
      if (results.length > 1) {
        const data = results.filter((result) => result.is_deleted !== 1);
        fulldetails(data).then((arr) => response.status(200).json({ status: 'success', data: arr }));
      }
    });
  } catch (error) {
    console.log(error);
    return response.status(500).json({ status: 'error', message: 'Error while retriving posts' });
  }
});

// Return a single Posts that is not deleted based on id
router.get('/posts/:id', (request, response) => {
  const postId = request.params.id;
  db.selectOne('posts', postId, (results) => {
    if (results.length < 1) {
      return response.status(200).json({ status: 'success', data: [] });
    }
    if (results.length === 1) {
      if (results[0].is_deleted === 1) {
        return response.status(200).json({ status: 'success', data: [] });
      }
      fulldetails(results).then((arr) => response.status(200).json({ status: 'success', data: arr }));
    }
  });
});

// Return a single gif that is not deleted based on id
router.get('/gifs/:id', (request, response) => {
  const gifId = request.params.id;
  db.selectOne('gifs', gifId, (results) => {
    if (results.length < 1) {
      return response.status(200).json({ status: 'success', data: [] });
    }
    if (results.length === 1) {
      if (results[0].is_deleted === 1) {
        return response.status(200).json({ status: 'success', data: [] });
      }
      fulldetails(results).then((arr) => response.status(200).json({ status: 'success', data: arr }));
    }
  });
});


// Return all the Post comments based on id
router.get('/post-comments/:postId', (request, response) => {
  const { postId } = request.params;
  db.selectAll('post_comments', `post=${postId}`, (results) => {
    if (results.length < 1) {
      return response.status(200).json({ status: 'success', data: [] });
    }
    return response.status(200).json({ status: 'success', data: results });
  });
});

// Return all the gif comments based on Id
router.get('/gif-comments/:gifId', (request, response) => {
  const { gifId } = request.params;
  db.selectAll('post_comments', `gif_post=${gifId}`, (results) => {
    if (results.length < 1) {
      return response.status(200).json({ status: 'success', data: [] });
    }
    return response.status(200).json({ status: 'success', data: results });
  });
});

// add gif comments
router.post('/comment-gif/:gifId', (request, response) => {
  const { gifId } = request.params;
  const { comment_body, comment_author } = request.body;
  if (comment_body === '') {
    return response.status(401).json({ status: 'error', message: 'Empty message body' });
  }
  try {
    const fields = [comment_body, Date.now(), gifId, comment_author];
    db.InsertGifComment(() => response.status(200).json({ status: 'success', message: 'commented' }), ...fields);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ status: 'error', message: 'Encountered an error' });
  }
});

// add post comments
router.post('/comment-post/:postId', (request, response) => {
  const { postId } = request.params;
  const { comment_body, comment_author } = request.body;
  if (comment_body === '') {
    return response.status(401).json({ status: 'error', message: 'Empty message body' });
  }
  try {
    const fields = [comment_body, Date.now(), postId, comment_author];
    db.InsertPostComment(() => response.status(200).json({ status: 'success', message: 'commented' }), ...fields);
  } catch (error) {
    console.log(error);
    return response.status(500).json({ status: 'error', message: 'Encountered an error during commenting' });
  }
});

// Return all categories
router.get('/categories', (request, response) => {
  db.selectAll('category', '', (results) => {
    if (results.length < 1) {
      return response.status(200).json({ status: 'success', data: [] });
    }
    return response.status(200).json({ status: 'success', data: results });
  });
});

// Return a single category
router.get('/category:id', (request, response) => {
  const { id: categoryId } = request.params;
  db.selectOne('category', categoryId, (results) => {
    if (results.length < 1) {
      return response.status(200).json({ status: 'success', data: [] });
    }
    return response.status(200).json({ status: 'success', data: results });
  });
});

module.exports = router;
