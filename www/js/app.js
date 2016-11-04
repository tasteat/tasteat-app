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

.controller('ResultsCtrl', function ($scope, filterFilter, FormData, Recipe, $ionicLoading, $state) {
  searchData = FormData.getForm();
  $ionicLoading.show();
  data = {'lang': 'pt_BR'};
  console.log('data = ' + JSON.stringify(data));
  
  Recipe.getFilters(data)
    .then(function(response) {
      try {
        $scope.recipe_categories = response.recipe_categories;
        $scope.total_time_categories = response.total_time_categories;
      } catch(err) {
        console.log(err);
        $scope.recipe_categories = [];
      }
  });
  
  Recipe.getRecipes(searchData)
    .then(function(response) {
      try {
        $scope.recipes = response.recipes;
        $scope.filtered_recipes = response.recipes;
      } catch(err) {
        console.log(err);
        $scope.recipes = [];
      } finally {
        $ionicLoading.hide();
      }
  });

  $scope.active_filters = {};
  $scope.active_filters['recipe_categories'] = [];
  $scope.active_filters['total_time_categories'] = [];
  $scope.active_filters['servings'] = 0;

  $scope.selected_categories = function selected_categories() {
    return filterFilter($scope.recipe_categories, {selected: true});
  };

  $scope.selected_total_times = function selected_total_times() {
    return filterFilter($scope.total_time_categories, {selected: true});
  };

  $scope.selected_servings = 0;

  $scope.$watch('recipe_categories|filter:{selected:true}', function (new_value) {
    $scope.active_filters['recipe_categories'] = new_value.map(function (cat) {
      return cat.id;
    });
  }, true);

  $scope.$watch('total_time_categories|filter:{selected:true}', function (new_value) {
    $scope.active_filters['total_time_categories'] = new_value;
  }, true);

  $scope.$watch('selected_servings', function (new_value) {
    var n = parseInt(new_value);
    if (isNaN(n)) {
      $scope.active_filters['servings'] = 0;
      $scope.selected_servings = '';
    }
    else {
      $scope.active_filters['servings'] = n;
      $scope.selected_servings = n;
    }
  }, true);

  $scope.change_servings = function(add_value) {
    var n = parseInt(add_value);
    if (!isNaN(n)) {
      $scope.active_filters['servings'] += n;
      $scope.selected_servings = $scope.active_filters['servings'];
    }
  }

  $scope.apply_filters = function() {
    var filtered = filterFilter($scope.recipes, function(recipe, index, array) {
      var test_recipe_category = false;
      if ($scope.active_filters['recipe_categories'].length == 0)
        test_recipe_category = true;
      else
        for (var i = 0; i < $scope.active_filters['recipe_categories'].length; i++)
          if (recipe['category'] == $scope.active_filters['recipe_categories'][i]) {
            test_recipe_category = true;
            break;
          }
      if (!test_recipe_category)
        return false;

      var test_time = false;
      if ($scope.active_filters['total_time_categories'].length == 0)
        test_time = true;

      for (var i = 0; i < $scope.active_filters['total_time_categories'].length; i++) {
        var ct = $scope.active_filters['total_time_categories'][i];
        if (recipe['total_time'] >= ct['min'] &&
          recipe['total_time'] <= ct['max']) {
          test_time = true;
          break;
        }
      }
      if (!test_time)
        return false;

      /* Needs changes on server side code to work
      if ($scope.active_filters['servings']) {
        for (ingredient in recipe['ingredients']) {
          var qty = parseFloat(ingredient.qty);
          if (!isNaN(qty))
            recipe['qty'] = $scope.active_filters['servings']*qty/recipe['servings'];
        }
      }*/
      return true;
    }, true);
    $scope.filtered_recipes = filtered;
  }

  $scope.select_recipe = function(index) {
	  $state.go('app.show_recipe', {obj : $scope.recipes[index]});
  }
})

.controller('RecipeCtrl', function ($scope, $stateParams) {
	$scope.recipe = $stateParams.obj;
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
.state('app.show_recipe', {
     url: "/show_recipe",
     params: {
    	obj: null 
     },
     views: {
       'menuContent': {
         templateUrl: "templates/show_recipe.html",
         controller: 'RecipeCtrl'
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
