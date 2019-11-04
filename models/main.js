const mysql = require('mysql');

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'capstone',
});


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
            date VARCHAR(100),
            gif_category INT,
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
            date VARCHAR(100),
            category INT,
            url VARCHAR(255),
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
            date VARCHAR(100),
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
            date VARCHAR(100),
            post INT,
            author INT,
            FOREIGN KEY (post) REFERENCES posts(id) ON DELETE CASCADE,
            FOREIGN KEY (author) REFERENCES users(id) ON DELETE CASCADE
        )
`;

con.connect((error) => {
  if (error) {
    throw error;
  }
  //  create the user table
  con.query(USER, (err) => {
    if (err) {
      throw err;
    }
    console.log('Created table users or table exists ...');
  });

  // create the category table
  con.query(CATEGORY, (err) => {
    if (err) {
      throw err;
    }
    console.log('Created table category or tables exists');
  });

  // create the gif table
  con.query(GIF, (err) => {
    if (err) {
      throw err;
    }
    console.log('Created table gifs or tables exists');
  });

  // create the posts table
  con.query(POST, (err) => {
    if (err) {
      throw err;
    }
    console.log('Created table posts or tables exists');
  });

  // create the gif comments table
  con.query(GIF_COMMENT, (err) => {
    if (err) {
      throw err;
    }
    console.log('Created table gif_comments or tables exists');
  });

  // create the post comments table
  con.query(POST_COMMENT, (err) => {
    if (err) {
      throw err;
    }
    console.log('Created table posts_comments or tables exists');
  });
});
