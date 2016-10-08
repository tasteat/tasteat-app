angular.module('app', ['ionic', 'pascalprecht.translate'])

  .controller('StartCtrl', ['$translate', '$scope', 'FormData', '$state', function ($translate, $scope, FormData, $state) {
    $scope.data = {'searchString': ''};

    document.addEventListener("deviceready", function () {
      $scope.recognition = new SpeechRecognition();
      $scope.recognition.onresult = function (event) {
        if (event.results.length > 0) {
          $scope.data.searchString = event.results[0][0].transcript;
          $scope.$apply();
        }
      };
    }, false);

    $scope.hold = function () {
      $scope.isOnHold = true;
      $scope.recognition.start();
    }
    $scope.release = function () {
      if (!$scope.isOnHold)
        return;
      $scope.recognition.stop();
    }
  
    $scope.search = function() {
      searchData = {'lang': $translate.use(),
                    'fullText': $scope.data.searchString}
      FormData.updateForm(searchData);
      $state.go('app.search_results');
    }
}])

.controller('ResultsCtrl', function ($scope, FormData, Recipe, $ionicLoading) {
  searchData = FormData.getForm();
  $ionicLoading.show();
  Recipe.getRecipes(searchData)
    .then(function(response) {
        $scope.recipes = response.recipes;
        $ionicLoading.hide();
    });
})

.config(function($stateProvider, $urlRouterProvider) {
 $stateProvider
   .state('app', {
   url: "/app",
   abstract: true,
   templateUrl: "templates/menu.html"
 })
 .state('app.start', {
   url: "/start",
   views: {
     'menuContent': {
       templateUrl: "templates/start.html",
       controller: 'StartCtrl'
     }
   }
 })
 .state('app.search_results', {
     url: "/search_results",
     views: {
       'menuContent': {
         templateUrl: "templates/search_results.html",
         controller: 'ResultsCtrl'
       }
     }
   })
 .state('app.my_recipes', {
     url: "/my_recipes",
     views: {
       'menuContent': {
         templateUrl: "templates/my_recipes.html"
       }
     }
   })
   .state('app.prefs', {
     url: "/prefs",
     views: {
       'menuContent': {
         templateUrl: "templates/prefs.html"
       }
     }
   })
   .state('app.about', {
     url: "/about",
     views: {
       'menuContent': {
         templateUrl: "templates/about.html"
       }
     }
   });
 // If none of the above states are matched, use this as the fallback:
 $urlRouterProvider.otherwise('/app/start');
})

.config(function ($translateProvider) {

  $translateProvider.useStaticFilesLoader({
    prefix: 'locale/',
    suffix: '.json'
  });
  $translateProvider.useSanitizeValueStrategy('escape');
  $translateProvider.determinePreferredLanguage();
});
