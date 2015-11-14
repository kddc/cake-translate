// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('cake-translate', ['ionic', 'ngCordova'])
.controller('MainCtrl', function($rootScope, $scope, $ionicPlatform ,$ionicLoading, $http, $cordovaCamera, $cordovaFileTransfer, $timeout) {

	$scope.isBrowser = !ionic.Platform.isWebView();

	$scope.results = [];

	$scope.cordovaReady = false;

	$ionicPlatform.ready(function() {
		$scope.$apply(function() {
			$scope.cordovaReady = true;
		});
	});

	$scope.test3 = function(e) {
		angular.element(e.target).next()[0].click()
	}

	$scope.test2 = function(e, files) {
		//Möglichkeit ausgewähltes Bild auch im Browser anzuzeigen
		var fileReader = new FileReader();
    fileReader.readAsDataURL(files[0]);
		fileReader.onload = function(e) {
	    $timeout(function() {
	    	$scope.pic = e.target.result;
	    });
    }

		// Formular vom Browser aus abschicken
		var fd = new FormData();
    fd.append('file', files[0]);
    $http.post("http://localhost:3000/uploadpic", fd, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
    })
    .success(function(data){
			console.log(data);
    })
    .error(function(err){
			console.log(err);
    });
	}

  $scope.test = function() {
    // $http.post("http://localhost:3000/uploadpic2")
		$http.post("https://cake-translate.eu-gb.mybluemix.net/uploadpic2")
      .then(function(data) {
				alert(data);
        $scope.results = data;
      },function(err) {
				alert(err);
				$scope.error = err;
			});
  }

  $scope.selectPicture = function() {
    // navigator.camera.getPicture(onSuccess, onFail, {
		// 	quality: 50,
		// 	sourceType:Camera.PictureSourceType.PHOTOLIBRARY,
    //   destinationType: Camera.DestinationType.DATA_URL
    // });
    navigator.camera.getPicture(onSuccess, onFail, {
			sourceType:Camera.PictureSourceType.PHOTOLIBRARY,
			destinationType:Camera.DestinationType.FILE_URI,
			encodingType: Camera.EncodingType.JPEG
		});

		function onSuccess(imageData) {
			alert("success");
			var options, ft, image;
			// $scope.log = imageData;

			// image = "data:image/jpeg;base64," + imageData;
			image = imageData;

			$scope.$apply(function() {
				$scope.pic = image;
			});

			$scope.results = [];
			// $ionicLoading.show({template:'Sending to Watson...'});


			// var fd = new FormData();
      // fd.append('image', image);
			// $http.post("http://localhost:3000/uploadpic", fd, {
			// 		transformRequest: angular.identity,
			// 		headers: {'Content-Type': undefined}
			// })
			// 	.then(function(r) {
			// 		alert("success");
			// 		$scope.results = JSON.parse(r.response);
			//
			// 	}, function(err) {
			// 		alert(err);
			// 		$scope.error = err;
			// 	});

			// var fd = new FormData();
      //   fd.append('file', file);
      //   $http.post(uploadUrl, fd, {
      //       transformRequest: angular.identity,
      //       headers: {'Content-Type': undefined}
      //   })
      //   .success(function(){
      //   })
      //   .error(function(){
      //   });

			options = new FileUploadOptions();
			options.fileKey = "file";
			options.fileName = image.substr(image.lastIndexOf('/') + 1);

			if (cordova.platformId == "android") {
				options.fileName += ".jpg"
			}

			options.mimeType = "image/jpeg";
			options.params = {}; // if we need to send parameters to the server request
			options.headers = {
				Connection: "Close"
			};
			options.chunkedMode = false;
			$scope.$apply(function() {
				$scope.log = options;
			});
			ft = new FileTransfer();
			// ft.upload(image, "http://localhost:3000/uploadpic", function(r) {
			ft.upload(image, "https://cake-translate.eu-gb.mybluemix.net/uploadpic", function(r) {
				alert(r.response);
				$scope.$apply(function() {
					$scope.results = JSON.parse(r.response);
				});
				// $ionicLoading.hide();
			}, function(err) {
				alert('err from node');
				$scope.$apply(function() {
					$scope.error = err;
				});
			}, options, true);

			// $cordovaFileTransfer.upload("http://localhost:3000/uploadpic", image, options, true).then(function(r) {
			// 	$scope.results = JSON.parse(r.response);
			// }, function(err) {
			// 	$scope.error = err;
			// });


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
