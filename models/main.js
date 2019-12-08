const mysql = require('mysql');


// creating a database model

// create a user table for every staff
const USER = `
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullname VARCHAR(255),
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        is_admin TINYINT(1) DEFAULT 0,
        password VARCHAR(255) NOT NULL,
        deleted TINYINT(1) DEFAULT 0
    )
`;

const CATEGORY = `
        CREATE TABLE IF NOT EXISTS category(
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255)
        )
`;

// Hold the gifs shared by every staff
const GIF = `
        CREATE TABLE IF NOT EXISTS gifs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            date VARCHAR(255),
            category INT,
            url VARCHAR(255),
            author INT,
            deleted TINYINT(1) DEFAULT 0,
            FOREIGN KEY (gif_category) REFERENCES category(id) ON DELETE CASCADE,
            FOREIGN KEY (author) REFERENCES users(id) ON DELETE CASCADE
        )
`;

const POST = `
        CREATE TABLE IF NOT EXISTS posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            body TEXT,
            date VARCHAR(255),
            category INT,
            author INT,
            FOREIGN KEY (category) REFERENCES category(id) ON DELETE CASCADE,
            FOREIGN KEY (author) REFERENCES users(id) ON DELETE CASCADE
        )
`;

// Table for gif comments. Name of commenter and gif commented on refrences users and gif
// table respectively
const GIF_COMMENT = `
        CREATE TABLE IF NOT EXISTS gif_comment (
            id INT AUTO_INCREMENT PRIMARY KEY,
            body TEXT,
            date VARCHAR(255),
            gif_post INT,
            author INT,
            FOREIGN KEY (gif_post) REFERENCES gifs(id) ON DELETE CASCADE,
            FOREIGN KEY (author) REFERENCES users(id) ON DELETE CASCADE
        )
`;

// Table for post comments. Name of commenter and post commented on refrences users and posts
// table respectively
const POST_COMMENT = `
        CREATE TABLE IF NOT EXISTS post_comments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            body TEXT,
            date VARCHAR(255),
            post INT,
            author INT,
            FOREIGN KEY (post) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (author) REFERENCES users(id) ON DELETE CASCADE
        )
`;


const makeTables = (databaseName) => {
  const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: databaseName,
  });

  const tables = [USER, CATEGORY, GIF, POST, GIF_COMMENT, POST_COMMENT];
  return new Promise((resolve, reject) => {
    con.connect((error) => {
      if (error) {
        throw error;
      }
      const createTable = (call) => {
        tables.forEach((table, index) => {
          con.query(table, (err) => {
            if (err) {
              throw err;
            }
            console.log(`Created table ${table} or tables exists`);
            call(index);
          });
        });
      };
      createTable((index) => {
        if (index < (tables.length)) {
          console.log(`Done table with index of ${index}`);
        }
        // eslint-disable-next-line new-cap
        return resolve();
      });
    });
  });
};

// drop tables
const dropTables = (databaseName, ...tables) => {
  const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: databaseName,
  });
  con.connect((err) => {
    if (err) {
      throw err;
    }
  });

  return new Promise((resolve, reject) => {
    ((call) => {
      tables.forEach((table, index) => {
        const query = `DROP TABLE IF EXISTS ${table}`;
        const disable = 'SET foreign_key_checks = 0';
        con.query(disable, (err) => {
          if (err) {
            reject(err);
          }
          con.query(query, (error) => {
            if (error) {
              reject(error);
            }
            console.log(`Dropped table ${table}`);
            return call(index);
          });
        });
      });
    })((index) => {
      if (index < (tables.length)) {
        console.log(`Done table with index of ${index}`);
      }
      return resolve();
    });
  });
};

// makeTables('capstone');
// const tables = ['users', 'category', 'gifs', 'posts', 'gif_comment', 'post_comments'];
// dropTables('capstone', () => {
//   console.log('removed');
// }, ...tables);

module.exports = { makeTables, dropTables };
