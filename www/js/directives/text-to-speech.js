angular
  .module('cake-translate')
  .directive('textToSpeech', function($http, $env) {
    return {
      restrict: 'A',
      scope: {
        result: "=textToSpeech"
      },
      link: function ($scope, element, attrs) {
        $scope.element = element;
        console.log($env.endpoint + "/voice?text=" + $scope.result.label_name);
        $scope.result.audio = new Audio($env.endpoint + "/voice?text=" + $scope.result.label_name);
        $scope.result.audio.addEventListener('canplaythrough', function() {
          $scope.element.css("display","block")
        }, false);
        $scope.result.play = function() {
          $scope.result.audio.play();
        }
      }
    };
  });
