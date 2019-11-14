// Mini Object Relational Mapper for this project
// Can insert and select from databases tables, cannot create one.
// Maps only to MySQL
// Inspiration from Django's ORM and Web2py's DAL.


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
      return callback(results[0]);
    });
  }

  // Select one record from a table
  selectOne(tableName, id, callback) {
    const query = `SELECT * FROM ${tableName} WHERE id=${mysql.escape(id)} LIMIT 1`;
    this.con.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      console.log(results);
      return callback(results[0]);
    });
  }

  // Select First record on results
  // Expect result to be array
  static first(result) {
    return result[0];
  }

  // Return Last element in record
  // Expect result to be array
  static last(result) {
    return result[result.length - 1];
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
      return callback(results[0]);
    });
  }

  // Database Insertions
  // Get information to insert into the user table
  InsertUser(callback, ...fields) {
    const query = 'INSERT INTO users (fullname, username, email, password) VALUES (?,?,?,?)';
    this.con.query(query, fields, (err, results) => {
      if (err) {
        throw err;
      }
      return callback(results[0]);
    });
  }

  // Get information to insert into the category table
  InsertCategory(callback, name) {
    const query = `INSERT INTO category (name) VALUES ('${name}')`;
    this.con.query(query, (err, results) => {
      if (err) {
        throw err;
      }
      console.log(results);
      return callback(results[0]);
    });
  }

  // Get information to insert into the gifs table
  InsertGif(callback, ...fields) {
    const query = 'INSERT INTO gifs (title, description, date, gif_category, url, author) VALUES (?,?,?,?,?,?)';
    this.con.query(query, fields, (err, results) => {
      if (err) {
        throw err;
      }
      return callback(results[0]);
    });
  }

  // Get information to insert into the posts table
  InsertPost(callback, ...fields) {
    const query = 'INSERT INTO posts (title, body, date, category, author) VALUES (?,?,?,?,?)';
    this.con.query(query, fields, (err, results) => {
      if (err) {
        throw err;
      }
      return callback(results[0]);
    });
  }

  // Get information to insert into the gif_comment table
  InsertGifComment(callback, ...fields) {
    const query = 'INSERT INTO gif_comment (body, date, gif_post, author) VALUES (?,?,?,?)';
    this.con.query(query, fields, (err, results) => {
      if (err) {
        throw err;
      }
      return callback(results[0]);
    });
  }

  // Get information to insert into the gif_comment table
  InsertPostComment(callback, ...fields) {
    const query = 'INSERT INTO post_comments (body, date, post, author) VALUES  (?,?,?,?)';
    this.con.query(query, fields, (err, results) => {
      if (err) {
        throw err;
      }
      return callback(results[0]);
    });
  }
}

// const Db = new Database('capstone');
// Db.createConnection((message) => message);
// const data = ['a gif comment', 'a date', 1, 1];
// Db.selectAll('users', (result) => {
//   console.log(result);
// });
module.exports = Database;
