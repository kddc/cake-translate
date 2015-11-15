// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('cake-translate', ['ionic', 'ngCordova'])
.controller('MainCtrl', function(
	$rootScope,
	$scope,
	$ionicPlatform,
	$ionicLoading,
	$http,
	$cordovaCamera,
	$cordovaFileTransfer,
	$timeout) {

	$scope.results = [];
	$scope.cordovaReady = false;



	$ionicPlatform.ready(function() {
		$scope.$apply(function() {
			$scope.cordovaReady = true;

			// $scope.userAgent = navigator.userAgent;
			// $scope.isBrowser = false;//navigator.camera == undefined;
			// $scope.deviceInformation = ionic.Platform.device();
			// $scope.isWebView = ionic.Platform.isWebView();
  		// $scope.isIPad = ionic.Platform.isIPad();
  		// $scope.isIOS = ionic.Platform.isIOS();
  		// $scope.isAndroid = ionic.Platform.isAndroid();
  		// $scope.isWindowsPhone = ionic.Platform.isWindowsPhone();
			// $scope.currentPlatform = ionic.Platform.platform();
  		// $scope.currentPlatformVersion = ionic.Platform.version();

		});
	});

  $scope.selectPicture = function(vonKamera) {
		try {
			if (vonKamera)
			{
				navigator.camera.getPicture(onSuccess, onFail, {
					quality: 50,
					sourceType:Camera.PictureSourceType.Camera,
					destinationType:Camera.DestinationType.FILE_URI,
					// allowEdit: true,
					// encodingType: Camera.EncodingType.JPEG,
					// saveToPhotoAlbum: false,
				 // popoverOptions: Camera.PopoverOptions,
				 cameraDirection: BACK
				});
			} else {
				navigator.camera.getPicture(onSuccess, onFail, {
					quality: 50,
					sourceType:Camera.PictureSourceType.PHOTOLIBRARY,
					destinationType:Camera.DestinationType.FILE_URI,
					encodingType: Camera.EncodingType.JPEG
				});
			}

		} catch(e) {
			//Wenn auswählen der Kamera oder Library fehl schlägt, fallback auslösen
			var browserUploadFallbackElement = $rootScope.browserUploadFallbackElement;//.click();
			browserUploadFallbackElement[0].click();
		}

		function onSuccess(imageData) {
			var options, ft, image;

			$scope.$apply(function() {
				$scope.pic = imageData;
			});

			$scope.results = [];
			$ionicLoading.show({template:'Sending to Watson...'});

			options = new FileUploadOptions();
			options.fileKey = "file";
			options.fileName = imageData.substr(imageData.lastIndexOf('/') + 1);
			if (cordova.platformId == "android") {
				options.fileName += ".jpg";
			}
			options.mimeType = "image/jpeg";
			options.params = {};

			$cordovaFileTransfer.upload("https://cake-translate.eu-gb.mybluemix.net/uploadpic", imageData, options).then(function(r) {
				var data = JSON.parse(r.response);
				$scope.results = data.labels;
				$ionicLoading.hide();
			}, function(err) {
				$ionicLoading.hide();
				alert("Error");
			});
		};

    function onFail(message) {
      alert('Failed because: ' + message);
    }
  }

	// Für Browser View

	$scope.selectPictureInBrowser = function(e, files) {
		//Möglichkeit ausgewähltes Bild auch im Browser anzuzeigen
		var fileReader = new FileReader();
    fileReader.readAsDataURL(files[0]);
		fileReader.onload = function(e) {
	    $timeout(function() {
	    	$scope.pic = e.target.result;
	    });
    }

		$ionicLoading.show({template:'Sending to Watson...'});
		// Formular vom Browser aus abschicken
		var fd = new FormData();
    fd.append('file', files[0]);
    $http.post("https://cake-translate.eu-gb.mybluemix.net/uploadpic", fd, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
    })
    .success(function(data){
			$scope.results = data.labels;
			$ionicLoading.hide();
    })
    .error(function(err){
			$ionicLoading.hide();
			alert("Error");
    });
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
