var mockgoose = require('mockgoose');
var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var config = require('../../config');
var server = require('../../server');
var connectDB = require('../utils').connectDB;
var disconnectDB = require('../utils').disconnectDB;
var createToken = require('../../auth').createToken;
var helper = require('../helper');

chai.use(chaiHttp);

describe('Tasks API', function() {

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

  describe('/GET tasks', function() {

    it('should get the tasks for the signed in user', function(done) {

      helper.saveWellFormedUserWithTask(function(err, user, task) {
        var token = createToken(user);
        chai.request(server)
          .get('/tasks')
          .set('Authorization', 'Bearer ' + token)
          .end(function(err, res) {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.equal(1);
            done();
          });
      });
    });

    it('should not get the tasks for a user when not authenticated', function(done) {
      chai.request(server)
        .get('/tasks')
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('/POST tasks/all', function() {

    it('should retrieve all the tasks for all the users', function(done) {
      chai.request(server)
        .post('/tasks/all')
        .send({superUserKey: config.SUPER_USER_API_KEY})
        .end(function(err, res) {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.equal(0);
          done();
        });
    });

    it('should not retrieve all the tasks for all the users when not super user', function(done) {
      chai.request(server)
        .post('/tasks/all')
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('/POST tasks/add', function() {

    it('should add a task for the signed in user', function(done) {
      helper.saveWellFormedUser(function(err, user) {
        var token = createToken(user);
        chai.request(server)
          .post('/tasks/add')
          .set('Authorization', 'Bearer ' + token)
          .send({label: 'task1'})
          .end(function(err, res) {
            res.should.have.status(200);
            done();
          });
      });
    });

    it('should not add a task with a missing label', function(done) {
      chai.request(server)
        .post('/tasks/add')
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });

    it('should not add a task for a user when not authenticated', function(done) {
      chai.request(server)
        .post('/tasks/add')
        .send({label: 'task1'})
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('/PUT tasks/:id', function() {

    it('should update a task to "done" for the signed in user', function(done) {
      helper.saveWellFormedUserWithTask(function(err, user, task) {
        var token = createToken(user);
        chai.request(server)
          .put('/tasks/' + task._id)
          .set('Authorization', 'Bearer ' + token)
          .send({isDone: true})
          .end(function(err, res) {
            res.should.have.status(200);
            done();
          });
      });
    });

    it('should not update a task for a user when not authenticated', function(done) {
      chai.request(server)
        .put('/tasks/5630f8a4455b683d22f3a084')
        .send({isDone: true})
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('/DELETE tasks/completed', function() {

    it('should delete the completed tasks for the signed in user', function(done) {
      helper.saveWellFormedUserWithTask(function(err, user, task) {
        var token = createToken(user);
        chai.request(server)
          .del('/tasks/completed')
          .set('Authorization', 'Bearer ' + token)
          .end(function(err, res) {
            res.should.have.status(200);
            done();
          });
      });
    });

    it('should not delete the completed tasks for a user when not authenticated', function(done) {
      chai.request(server)
        .del('/tasks/completed')
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });
  });

  describe('/DELETE tasks/:id', function() {

    it('should delete a task for the signed in user', function(done) {
      helper.saveWellFormedUserWithTask(function(err, user, task) {
        var token = createToken(user);
        chai.request(server)
          .del('/tasks/' + task._id)
          .set('Authorization', 'Bearer ' + token)
          .end(function(err, res) {
            res.should.have.status(200);
            done();
          });
      });
    });

    it('should not delete a task for a user when not authenticated', function(done) {
      chai.request(server)
        .del('/tasks/5630f8a4455b683d22f3a084')
        .end(function(err, res) {
          res.should.have.status(400);
          done();
        });
    });
  });
});