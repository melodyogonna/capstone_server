const { expect } = require('chai');
const { makeTables, dropTables } = require('../models/main');


const ORM = require('../models/miniORM');

const connect = new ORM('capstone_test');
// Testing ayncronous code is really a pain

describe('Testing ORM for functionality', () => {
  // Create tables before running tests
  before((done) => {
    makeTables('capstone_test').then(done());
  });

  // Drop tables after running tests
  after((done) => {
    const tables = ['users', 'category', 'gifs', 'posts', 'gif_comment', 'post_comments'];
    dropTables('capstone_test', ...tables).then(done());
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
        expect(result).to.be.a('Object');
        expect(result.serverStatus).to.equals(2);
        done();
      }, ...data);
    });
  });

  // Test context for inserting into the category table
  context('Insert into the catgory table', () => {
    it('should insert a categiry into the database', (done) => {
      connect.InsertCategory((result) => {
        expect(result.serverStatus).to.equals(2);
        done();
      }, 'melody');
    });
  });

  // Test context for inserting into the gifs table
  context('Insert some data into the gifs table', () => {
    const data = ['A gif post', 'Description of gif post', `${Date.now()}`, 1, 'urls', 1];
    it('should insert some data into the gifs table', (done) => {
      connect.InsertGif((result) => {
        expect(result.serverStatus).to.equals(2);
        done();
      }, ...data);
    });
  });

  // Test context for inserting into the posts table
  context('Insert some data into the posts table', () => {
    const data = ['A post', 'Description body of post', `${Date.now()}`, 1, 1];
    it('should insert some data into the posts table', (done) => {
      connect.InsertPost((result) => {
        expect(result.serverStatus).to.equals(2);
        done();
      }, ...data);
    });
  });

  // Test context for inserting into the gif comments table
  context('Insert some data into the gif comments table', () => {
    const data = ['body of a gif comment', `${Date.now()}`, 1, 1];
    it('should insert some data into the gifs comment table', (done) => {
      connect.InsertGifComment((result) => {
        expect(result.serverStatus).to.equals(2);
        done();
      }, ...data);
    });
  });

  // Test context for inserting into the post comments table
  context('Insert some data into the post comments table', () => {
    const data = ['body of a post comment', `${Date.now()}`, 1, 1];
    it('should insert some data into the posts comment table', (done) => {
      connect.InsertPostComment((result) => {
        expect(result.serverStatus).to.equals(2);
        done();
      }, ...data);
    });
  });

  // Test context for select functionality
  context('Select one item from table', () => {
    it('should select one item from table', (done) => {
      connect.selectOne('users', 1, (result) => {
        expect(result).to.be.a('Array');
        expect(result.length).to.equal(1);
        expect(result[0]).to.be.an('Object');
        expect(result[0].id).to.equal(1);
        done();
      });
    });
    it('should return an empty array', (done) => {
      connect.selectOne('users', 3, (result) => {
        expect(result.length).to.be.lessThan(1);
        done();
      });
    });
  });
});
