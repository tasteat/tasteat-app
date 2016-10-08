angular.module('app')
.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])
.factory('Recipe', function($http) {
 return {
   getRecipes: function(searchData) {
     return $http.get('http://192.168.0.102:5000/api/recipes?fullText=' + searchData.fullText)
       .then(function (response) {
         return response.data;
       }, function (response) {
           console.log('Got Error: ' + JSON.stringify(response));
       })
   }
 };
})
.factory('FormData', function() {
 return {
   form: {},
   getForm: function() {
     return this.form;
   },
   updateForm: function(form) {
     this.form = form;
   }
 }
})
