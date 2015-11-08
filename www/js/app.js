// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])
.controller('MainCtrl', function($scope, $ionicPlatform ,$ionicLoading, $http) {

	$scope.results = [];
	$scope.cordovaReady = false;

	$ionicPlatform.ready(function() {
		$scope.$apply(function() {
			$scope.cordovaReady = true;
		});
	});

  $scope.test = function() {
    $http.post("http://localhost:3000/uploadpic2")
      .then(function(data) {
        $scope.results = data;
      });
  }

  $scope.selectPicture = function() {
    // navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
    //   destinationType: Camera.DestinationType.DATA_URL
    // });
    navigator.camera.getPicture(onSuccess, onFail, {
			sourceType:Camera.PictureSourceType.PHOTOLIBRARY,
			destinationType:Camera.DestinationType.FILE_URI
		});

		function onSuccess(imageData) {
			var options, ft;
			$scope.pic = imageData;
			$scope.results = [];

			$ionicLoading.show({template:'Sending to Watson...'});
			options = new FileUploadOptions();
			options.fileKey="image";
			options.fileName=imageData.split('/').pop();
			ft = new FileTransfer();
			ft.upload(imageData, "http://localhost:3000/uploadpic", function(r) {
				$scope.$apply(function() {
					$scope.results = JSON.parse(r.response);
				});
				$ionicLoading.hide();
			}, function(err) {
				alert('err from node', err);
			}, options);
		};

    function onFail(message) {
      alert('Failed because: ' + message);
    }
  }

})
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
