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
      $state.go('app.search_results', {lang : $translate.use()});
    }
}])

.controller('ResultsCtrl', function ($scope, filterFilter, FormData, Recipe, $stateParams, $ionicLoading, $state) {
  searchData = FormData.getForm();
  data = {'lang': $stateParams.lang};
  $ionicLoading.show(); 
  
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

  $scope.tab_classes = {};
  $scope.tab_classes['recipes_tab'] = {
    'search-results-tab': true,
    'search-results-recipe-tab': true,
    'search-results-selected-tab': true,
    'search-results-unselected-tab': false
  };

  $scope.tab_classes['filters_tab'] = {
    'search-results-tab': true,
    'search-results-filter-tab': true,
    'search-results-selected-tab': false,
    'search-results-unselected-tab': true
  };

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
    if (new_value)
      $scope.active_filters['recipe_categories'] = new_value.map(function (cat) {
        return cat.id;
      });
  }, true);

  $scope.$watch('total_time_categories|filter:{selected:true}', function (new_value) {
    $scope.active_filters['total_time_categories'] = new_value;
  }, true);

  $scope.change_servings = function(add_value) {
    var n = parseInt(add_value);
    if (!isNaN(n)) {
      $scope.active_filters['servings'] += n;
      $scope.selected_servings = $scope.active_filters['servings'];
    }
  }

  $scope.apply_filters = function() {    
    $scope.tab_classes['filters_tab']['search-results-selected-tab'] = false;
    $scope.tab_classes['filters_tab']['search-results-unselected-tab'] = true;
    $scope.tab_classes['recipes_tab']['search-results-selected-tab'] = true;
    $scope.tab_classes['recipes_tab']['search-results-unselected-tab'] = false;
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

      return true;
    }, true);
    $scope.filtered_recipes = filtered;
  }

  $scope.clicked_on_tab = function(selected_tab) {
    if ($scope.tab_classes[selected_tab]['search-results-selected-tab'])
      return;
    for (key in $scope.tab_classes) {
      $scope.tab_classes[key]['search-results-selected-tab'] = false;
      $scope.tab_classes[key]['search-results-unselected-tab'] = true;
    }
    $scope.tab_classes[selected_tab]['search-results-selected-tab'] = true;
    $scope.tab_classes[selected_tab]['search-results-unselected-tab'] = false;
    if (selected_tab == 'recipes_tab')
      $scope.apply_filters();
  };

  $scope.select_recipe = function(index) {
	  $state.go('app.show_recipe', {
      obj : $scope.recipes[index],
      reqData : {
        'lang' : $stateParams.lang,
        'id' : $scope.recipes[index]['id']
      }
    });
  }
})

.controller('RecipeCtrl', function ($scope, $stateParams, $ionicLoading, Recipe) {
	$scope.recipe = $stateParams.obj;
  $scope.reqData = $stateParams.reqData;
  $ionicLoading.show();

  Recipe.getRecipe($scope.reqData)
    .then(function(response) {
      try {
        $scope.recipe.ingredients = response.ingredients;
        $scope.recipe.directions = response.directions;
      } catch(err) {
        console.log(err);
      } finally {
        $ionicLoading.hide();
      }
  });

  $scope.tab_classes = {};
  $scope.tab_classes['ingredients_tab'] = {
    'show-recipe-tab': true,
    'show-recipe-ingredients-tab': true,
    'show-recipe-selected-tab': true,
    'show-recipe-unselected-tab': false
  };

  $scope.tab_classes['directions_tab'] = {
    'show-recipe-tab': true,
    'show-recipe-directions-tab': true,
    'show-recipe-selected-tab': false,
    'show-recipe-unselected-tab': true
  };

  $scope.clicked_on_tab = function(selected_tab) {
    if ($scope.tab_classes[selected_tab]['show-recipe-selected-tab'])
      return;
    for (key in $scope.tab_classes) {
      $scope.tab_classes[key]['show-recipe-selected-tab'] = false;
      $scope.tab_classes[key]['show-recipe-unselected-tab'] = true;
    }
    $scope.tab_classes[selected_tab]['show-recipe-selected-tab'] = true;
    $scope.tab_classes[selected_tab]['show-recipe-unselected-tab'] = false;
  };
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
     params: {
      lang: 'en_US'
     },
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
    	obj: null,
      reqData: null
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
