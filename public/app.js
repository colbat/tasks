(function() {
  var app = angular.module('tasks', ['ngRoute', 'ngMessages', 'satellizer', 'toaster']);

  app.config(['$routeProvider', '$authProvider', function($routeProvider, $authProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/home',
        controller: 'TaskController'
      })
      .when('/sign_in', {
        templateUrl: 'partials/sign_in',
        controller: 'UserController'
      })
      .when('/sign_up', {
        templateUrl: 'partials/sign_up',
        controller: 'UserController'
      })
      .otherwise('/');

    $authProvider.loginUrl = '/users/signin';
    $authProvider.signupUrl = '/users/signup';

    $authProvider.facebook({
      url: '/users/auth/facebook',
      // clientId: '648103078655495'
      clientId: '1185205824827748'
    });

    $authProvider.twitter({
      url: '/users/auth/twitter'
    });

    $authProvider.yahoo({
      url: '/users/auth/yahoo'
    });
  }]);

  app.controller('UserController', [
    '$http', '$scope', '$window', '$rootScope', '$auth', 'toaster', '$route',
    function($http, $scope, $window, $rootScope, $auth, toaster, $route) {

      // Sets current user to the root scope when the page is refreshed
      if($window.localStorage.currentUser) {
        $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
      }

      $scope.signupUser = function(user) {
        $auth.signup(user)
          .then(function(response) {
            var currentUser = updateProfilePicture(response.data.user);
            $window.localStorage.currentUser = JSON.stringify(currentUser);
            $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
          })
          .catch(function(response) {
            toaster.pop({
              type: 'error',
              body: response.data.message,
              timeout: 3500,
              limit: 1,
              showCloseButton: true
            });
          });
      };

      $scope.signinUser = function(user) {
        $auth.login({email: user.email, password: user.password})
          .then(function(response) {
            var currentUser = updateProfilePicture(response.data.user);
            $window.localStorage.currentUser = JSON.stringify(currentUser);
            $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
          })
          .catch(function(response) {
            toaster.pop({
              type: 'error',
              body: response.data.message,
              timeout: 3500,
              limit: 1,
              showCloseButton: true
            });
          });
      };

      $scope.logout = function() {
        $auth.logout();
        $rootScope.currentUser = null;
        delete $window.localStorage.currentUser;
        $route.reload();
      };

      $scope.isAuthenticated = function() {
        return $auth.isAuthenticated();
      };

      $scope.facebookLogin = function() {
        $auth.authenticate('facebook')
          .then(function(response) {
            var currentUser = updateProfilePicture(response.data.user);
            $window.localStorage.currentUser = JSON.stringify(currentUser);
            $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
          })
          .catch(function(response) {
            console.log(response.data);
          });
      };

      $scope.twitterLogin = function() {
        $auth.authenticate('twitter')
          .then(function(response) {
            var currentUser = updateProfilePicture(response.data.user);
            $window.localStorage.currentUser = JSON.stringify(currentUser);
            $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
          })
          .catch(function(response) {
            console.log(response.data);
          });
      };

      function updateProfilePicture(user) {
        if(user.facebook) {
          var profileId = user.facebook.profileId;
          var url = '//graph.facebook.com/' + profileId + '/picture';
          user.defaultProfilePicture = url;
          return user;
        }

        if(user.twitter) {
          var screenName = user.twitter.screenName;
          var url = '//twitter.com/' + screenName + '/profile_image';
          user.defaultProfilePicture = url;
          return user;
        }

        if(user.email) {
          var hash = md5(user.email);
          var url = '//gravatar.com/avatar/' + hash;
          user.defaultProfilePicture = url;
          return user;
        }
      }
  }]);


  app.controller('TaskController', [
    '$http', '$scope', '$window', '$rootScope', '$auth', 'toaster',
    function($http, $scope, $window, $rootScope, $auth, toaster) {
      $scope.tasks = [];

      // Fills the tasks array
      getTasks();
      
      $scope.addTask = function(taskToAdd) {
        if(!taskToAdd || !taskToAdd.label) {
          toaster.pop({
            type: 'error',
            body: 'Please name your task.',
            timeout: 3500,
            showCloseButton: true
          });
          return;
        }

        if(!$auth.isAuthenticated()) {
          $scope.tasks.push({
            label: taskToAdd.label,
            done: false,
            archived: false
          });

          toaster.pop({
            type: 'success',
            body: 'Task successfuly added.',
            timeout: 1500,
            showCloseButton: true
          });

          taskToAdd.label = "";
          return;
        }

        $http.post('tasks/add/', {label: taskToAdd.label})
          .success(function(data) {
            getTasks();
            toaster.pop({
              type: 'success',
              body: 'Task successfuly added.',
              timeout: 1500,
              showCloseButton: true
            });
            taskToAdd.label = "";
          })
          .error(function(data) {
            toaster.pop({
              type: 'error',
              body: data.message,
              timeout: 3500,
              showCloseButton: true
            });
          });
      };

      $scope.updateDone = function(task) {
        task.isDone ? task.isDone = false : task.isDone = true;

        if($auth.isAuthenticated()) {
          $http.put('tasks/' + task._id, {isDone: task.isDone}).success(function(data) {
            //
          });
        }
      };

      $scope.flushCompletedTasks = function() {
        if(!$auth.isAuthenticated()) {
          var len = $scope.tasks.length;
          for(var i = 0; i < len; i++) {
            if($scope.tasks[i].isDone) {
              $scope.tasks.splice(i, 1);
              i--;
              len--;
            }
          }
          return;
        }

        $http.delete('tasks/completed/').success(function(data) {
          getTasks();
        });
      };

      $scope.isAuthenticated = function() {
        return $auth.isAuthenticated();
      };

      function getTasks() {
        if(!$auth.isAuthenticated()) {
          $scope.tasks = fillDemoTasks();
        } 
        else {
          $http.get('tasks/')
            .success(function(data) {
              $scope.tasks = data;
            })
            .error(function(data) {
              toaster.pop({
                type: 'error',
                body: data.message,
                timeout: 4500,
                showCloseButton: true
              });
            });
        }
      }

      function fillDemoTasks() {
        return [
          {
            label: 'Thinking about signing up',
            isDone: false,
            isArchived: false
          },
          {
            label: 'Doing that',
            isDone: false,
            isArchived: false
          },
          {
            label: 'Doing and this..',
            isDone: false,
            isArchived: false
          },
          {
            label: 'And after I will do that',
            isDone: false,
            isArchived: false
          },
          {
            label: 'And I will go to this',
            isDone: false,
            isArchived: false
          },
          {
            label: 'Finally I will finish this one',
            isDone: false,
            isArchived: false
          }
        ];
      }
  }]);

  // If the user already has a token from a previous
  // login, we check if it has expired before loading
  // the angular app
  var token = localStorage.satellizer_token;
  if(token) {
    $.post('/users/check_jwt_expired', {token: token}, function(data) {
      if(data.hasExpired) {
        localStorage.removeItem('satellizer_token');
      }
      angular.bootstrap(document, ['tasks']);
    });
  } else {
    angular.bootstrap(document, ['tasks']);
  }
})();
