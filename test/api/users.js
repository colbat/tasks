var mockgoose = require('mockgoose');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var config = require('../../config');
var server = require('../../server');
var connectDB = require('../utils').connectDB;
var disconnectDB = require('../utils').disconnectDB;
var helper = require('../helper');

chai.use(chaiHttp);

describe('Users API', function() {

  before(function(done) {
    connectDB(function(err) {
      done(err);
    });
  });

  after(function() {
    disconnectDB();
  });

  afterEach(function(done) {
    mockgoose.reset();
    done();
  });

  describe('/POST users', function() {

    it('should retrieve all the users', function(done) {
      chai.request(server)
        .post('/users')
        .send({superUserKey: config.SUPER_USER_API_KEY})
        .end(function(err, res) {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.equal(0);
          done();
        });
    });

    it('should not retrieve all the users when not super user', function(done) {
      chai.request(server)
        .post('/users')
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('/POST users/signup', function() {

    it('should sign up a new local user', function(done) {
      chai.request(server)
        .post('/users/signup')
        .send(helper.user)
        .end(function(err, res) {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('user');
          res.body.should.have.property('token');
          res.body.user.email.should.be.equal(helper.user.email);
          done();
        });
    });
  });

  describe('/POST users/signin', function() {

    it('should sign in a local user', function(done) {
      helper.saveWellFormedUser(function(err, user) {
        chai.request(server)
          .post('/users/signin')
          .send({
            email: user.email,
            password: 'test'
          })
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('user');
            res.body.should.have.property('token');
            res.body.user.email.should.be.equal(user.email);
            done();
          });
      });
    });

    it('should not sign in a local user with unknown email', function(done) {
      chai.request(server)
        .post('/users/signin')
        .send({
          email: 'test@test.com',
          password: 'test'
        })
        .end(function(err, res) {
          res.should.have.status(401);
          done();
        });
    });

    it('should not sign in a local user with an incorrect password', function(done) {
      helper.saveWellFormedUser(function(err, user) {
        chai.request(server)
          .post('/users/signin')
          .send({
            email: user.email,
            password: 'badpassword'
          })
          .end(function(err, res) {
            res.should.have.status(401);
            done();
          });
      });
    });
  });

  describe('/DELETE users/:id', function() {

    it('should not delete a user when not authorized', function(done) {
      chai.request(server)
        .del('/users/57dbf32979de682530f8d629')
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });
  });
});