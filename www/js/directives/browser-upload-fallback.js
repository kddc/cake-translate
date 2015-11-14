angular
  .module('cake-translate')
  .directive('browserUploadFallbackElement', function($rootScope) {

    return {
      restrict: 'A',
      link: function ($scope, element, attrs) {
        $rootScope.browserUploadFallbackElement = element;
      }
    };
  });
