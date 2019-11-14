const { expect } = require('chai');
const { makeTables, dropTables } = require('../models/main');


const ORM = require('../models/miniORM');

const connect = new ORM('capstone_test');
// Testing ayncronous code is really a pain

describe('Testing ORM for functionality', () => {
  // Create tables before running tests
  before(() => {
    makeTables('capstone_test', () => {
      console.log('jj');
    });
  });

  // Test context for testing ORM connection functionality
  context('Create a database connection', () => {
    it('should connect to database capstone', (done) => {
      connect.createConnection((message) => {
        expect(message).to.be.a('string').and.to.equal('Connected to Database capstone_test');
        done();
      });
    });
  });

  // Test context for inserting into the users table
  context('insert into users table', () => {
    it('insert some data into the users table', (done) => {
      const data = ['melody', 'username', 'jdjjd@hdh.cc', 'hdjdjj'];
      connect.InsertUser((result) => {
        console.log(result);
        expect(result.serverStatus).to.be.an('object').and.to.equal(2);
      }, ...data);
      done();
    });
  });

  // Test context for inserting into the category table
  context('Insert into the catgory table', () => {
    it('should insert a categiry into the database', (done) => {
      connect.InsertCategory((result) => {
        console.log(result);
        expect(result.serverStatus).to.equal(2);
      }, 'melody');
      done();
    });
  });
  // Drop tables after running tests
  after(() => {
    const tables = ['users', 'category', 'gifs', 'posts', 'gif_comment', 'post_comments'];
    dropTables('capstone_test', () => {
      console.log('removed');
      return 'removed';
    }, ...tables);
  });
});
