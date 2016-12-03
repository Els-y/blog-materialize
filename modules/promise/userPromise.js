var Promise = require('bluebird');
var User = require('../../models/user');

function findUserByNamePromise(username) {
  var promise = new Promise(function(resolve, reject) {
    User.findOne({username: username}, function(err, user) {
      if (err) {
        // reject(err);
        reject('Database error');
      } else if (!user) {
        // reject(new Error("User doesn't exist"));
        reject("User doesn't exist");
      } else {
        resolve(user);
      }
    });
  });

  return promise;
}

function findUserByEmailPromise(email) {
  var promise = new Promise(function(resolve, reject) {
    User.findOne({email: email}, function(err, user) {
      if (err) {
        // reject(err);
        reject('Database error');
      } else if (!user) {
        // reject(new Error("User doesn't exist"));
        reject("User doesn't exist");
      } else {
        resolve(user);
      }
    });
  });

  return promise;
}

function findUserByIdPromise(id) {
  var promise = new Promise(function(resolve, reject) {
    User.findById(id, function(err, user) {
      if (err) {
        reject('Database error');
      } else if (!user) {
        reject("User doesn't exist");
      } else {
        resolve(user);
      }
    });
  });

  return promise;
}

function findUserNotExistByNameAndEmail(username, email) {
  var promise = new Promise(function(resolve, reject) {
    User.findOne({username: username}, function(err, user) {
      if (err) {
        reject('Database error');
      } else if (user) {
        reject("Username already exists");
      } else {
        resolve();
      }
    });
  }).then(function() {
    return new Promise(function(resolve, reject) {
      User.findOne({email: email}, function(err, user) {
        if (err) {
          reject('Database error');
        } else if (user) {
          reject('Email already exists');
        } else {
          resolve();
        }
      });
    });
  });

  return promise;
}

exports.findUserByNamePromise = findUserByNamePromise;
exports.findUserByEmailPromise = findUserByEmailPromise;
exports.findUserByIdPromise = findUserByIdPromise;
exports.findUserNotExistByNameAndEmail = findUserNotExistByNameAndEmail;
