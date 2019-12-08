// Mini Object Relational Mapper for this project
// Can insert and select from databases tables, cannot create one or delete
// Maps only to MySQL
// Inspiration from Django's ORM and Web2py's DAL.
// Author - Anyaegbulam Melody Ogonna Daniel


const mysql = require('mysql');

class Database {
  constructor(dbName, dbUser = 'root', dbPass = '', dbHost = 'localhost') {
    this.db_name = dbName;
    this.db_user = dbUser;
    this.db_pass = dbPass;
    this.db_host = dbHost;
  }

  // Create connection
  createConnection(callback) {
    this.con = mysql.createConnection({
      host: this.db_host,
      user: this.db_user,
      password: this.db_pass,
      database: this.db_name,
    });

    this.con.connect((err) => {
      if (err) {
        throw (err);
      }
      return callback(`Connected to Database ${this.db_name}`);
    });
  }

  // Database Selections
  // Select all records from a table
  selectAll(tableName, where = '', callback) {
    let whr = '';
    if (where) {
      whr = ` WHERE ${where}`;
    }
    const query = `SELECT * FROM ${tableName}${whr}`;
    // eslint-disable-next-line prefer-destructuring
    const con = this.con;
    con.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      return callback(results);
    });
  }

  // Select one record from a table
  selectOne(tableName, id, callback) {
    const query = `SELECT * FROM ${tableName} WHERE id=${mysql.escape(id)} LIMIT 1`;
    this.con.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      return callback(results);
    });
  }

  // Select records with filter
  select(fields, tableName, where = '', groupby = '', orderby = '', callback) {
    let whr = ''; let grpby = ''; let ordby = '';
    if (where) {
      whr = ` WHERE ${where}`;
    }
    if (groupby) {
      grpby = ` GROUP BY ${groupby}`;
    }
    if (orderby) {
      ordby = ` ORDER BY ${orderby}`;
    }
    const query = `SELECT ${fields} FROM ${tableName}${whr}${grpby}${ordby}`;
    this.con.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      return callback(results);
    });
  }

  // Database Insertions
  // Get information to insert into the user table
  InsertUser(callback, ...fields) {
    let query = '';
    if (fields.length === 4) {
      query = 'INSERT INTO users (fullname, username, email, password) VALUES (?,?,?,?)';
    } else if (fields.length === 5) {
      query = 'INSERT INTO users (fullname, username, email, password, is_admin) VALUES (?,?,?,?,?)';
    }
    this.con.query(query, fields, (err, results) => {
      if (err) {
        throw err;
      }
      return callback(results);
    });
  }

  // Get information to insert into the category table
  InsertCategory(callback, name) {
    const query = `INSERT INTO category (name) VALUES ('${name}')`;
    this.con.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      return callback(results);
    });
  }

  // Get information to insert into the gifs table
  InsertGif(callback, ...fields) {
    const query = 'INSERT INTO gifs (title, description, date, category, url, author) VALUES (?,?,?,?,?,?)';
    this.con.query(query, fields, (err, results) => {
      if (err) {
        throw err;
      }
      return callback(results);
    });
  }

  // Get information to insert into the posts table
  InsertPost(callback, ...fields) {
    const query = 'INSERT INTO posts (title, body, date, category, author) VALUES (?,?,?,?,?)';
    this.con.query(query, fields, (err, results) => {
      if (err) {
        throw err;
      }
      return callback(results);
    });
  }

  // Get information to insert into the gif_comment table
  InsertGifComment(callback, ...fields) {
    const query = 'INSERT INTO gif_comment (body, date, gif_post, author) VALUES (?,?,?,?)';
    this.con.query(query, fields, (err, results) => {
      if (err) {
        throw err;
      }
      return callback(results);
    });
  }

  // Get information to insert into the gif_comment table
  InsertPostComment(callback, ...fields) {
    const query = 'INSERT INTO post_comments (body, date, post, author) VALUES  (?,?,?,?)';
    this.con.query(query, fields, (err, results) => {
      if (err) {
        throw err;
      }
      return callback(results);
    });
  }

  // Update category
  updateCategory(id, name, callback) {
    let query = '';
    if (!name || typeof (name) !== 'string') {
      throw new Error(`Field error, expect a name name to be a string, received ${typeof (name)}`);
    }
    if (!id || typeof (id) !== 'number') {
      throw new Error('Field Error, Expects id to be a number');
    }
    query = `UPDATE category SET name=name WHERE id=${id}`;
    this.con.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      return callback(results);
    });
  }

  // Update gifs
  updateGif(id, fields, callback) {
    let query = '';
    if (!fields || fields.length < 2) {
      throw new Error('Field error, expect a field or array of fields of length 2');
    }
    if (!id || typeof (id) !== 'number') {
      throw new Error('Field Error, Expects id to be a number');
    }
    if (fields.length === 2) {
      query = `UPDATE gifs SET title=${fields[0]}, description=${fields[1]} WHERE id=${id}`;
    } else if (fields.length === 3) {
      query = `UPDATE gifs SET title=${fields[0]}, description=${fields[1]}, url=${fields[2]} WHERE id=${id}`;
    }
    this.con.query(query, (err, result) => {
      if (err) {
        throw err;
      }
      return callback(result);
    });
  }

  // Update posts
  updatePost(id, fields, callback) {
    let query = '';
    if (!fields || fields.length < 2) {
      throw new Error('Field error, expect a field or array of fields of length 2');
    }
    if (!id || typeof (id) !== 'number') {
      throw new Error('Field Error, Expects id to be a number');
    }
    query = `UPDATE posts SET title=${fields[0]}, body=${fields[1]} WHERE id=${id}`;
    this.con.query(query, (err, result) => {
      if (err) {
        throw err;
      }
      return callback(result);
    });
  }

  // Delete a record
  delete(tableName, fieldId, callback) {
    if (!fieldId || typeof fieldId !== 'number') {
      throw new Error('Field Error, Expects id to be a number');
    }
    const query = `UPDATE ${tableName} SET is_deleted=1 WHERE id=${fieldId}`;
    this.con.query(query, (err, result) => {
      if (err) {
        throw err;
      }
      callback(result);
    });
  }
}

// Select First record on results
// Expect result to be array
const first = (result) => {
  if (result.length < 1) {
    return undefined;
  }
  if (result.length === 1) {
    return result;
  }
  return result[0];
};

// Return Last element in record
// Expect result to be array
const last = (result) => {
  if (result.length < 1) {
    return undefined;
  }
  if (result.length === 1) {
    return result;
  }
  return result[result.length - 1];
};

// const Db = new Database('capstone');
// Db.createConnection((message) => message);
// const data = ['a gif comment', 'a date', 1, 1];
// Db.selectAll('users', '', (result) => {
//   console.log(Db.last(result));
// });
module.exports = { Database, first, last };
