// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('cake-translate', ['ionic', 'ngCordova'])
.config(function($sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    "self",
    /(mp3|ogg)$/,
  ]);
})
.filter('trustUrl', function ($sce) {
  return function(url) {
    return $sce.trustAsHtml(url);
  };
})
.controller('MainCtrl', function(
	$rootScope,
	$scope,
	$ionicPlatform,
	$ionicLoading,
	$http,
	$cordovaCamera,
	$cordovaFileTransfer,
	$cordovaFile,
  $cordovaMedia,
	$timeout,
	$image,
	$storage,
	$q,
	$sce,
  $ionicModal) {
  $scope.storage = $storage;
  $storage.loadAllImageWordsPairs();
  $scope.results = [];
  $scope.cordovaReady = false;

  $ionicModal.fromTemplateUrl('templates/results.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

	$ionicPlatform.ready(function() {
		$scope.$apply(function() {
			$scope.cordovaReady = true;
			$scope.window = window;

      // $scope.loadAllImageWordsPairs();
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
					allowEdit: false,
					encodingType: Camera.EncodingType.JPEG,
					saveToPhotoAlbum: false,
				  popoverOptions: CameraPopoverOptions,
					correctOrientation: true
				});
			} else {
				navigator.camera.getPicture(onSuccess, onFail, {
					quality: 50,
					sourceType:Camera.PictureSourceType.PHOTOLIBRARY,
					destinationType:Camera.DestinationType.FILE_URI,
					encodingType: Camera.EncodingType.JPEG,
					correctOrientation: true
				});
			}

		} catch(e) {
			//Wenn auswählen der Kamera oder Library fehl schlägt, fallback auslösen
			var browserUploadFallbackElement = $rootScope.browserUploadFallbackElement;//.click();
			browserUploadFallbackElement[0].click();
		}

		function onSuccess(imageData) {
			$scope.$apply(function() {
				$scope.pic = imageData;
			});

			sendingAppImageToWatson(imageData);
		};

    function onFail(message) {
      alert('Failed because: ' + message);
    }

		function sendingAppImageToWatson(image) {
			$image.toBlob(image).then(function (blob) {
				$image.compress(blob).then(function (blob) {
					$image.upload(blob).then(
						function(data) {
							$scope.results = data.labels;
							$scope.imageSize = data.size;
              $scope.modal.show();
						},
						function(err) {
							$scope.onUploadFail('Upload failed. Want to retry?', sendingAppImageToWatson, image);
						}
					);
				});
			});
		}
  }

	$scope.audio = function(text) {
    var audio = new Audio($env.endpoint + "/voice?text=" + text);
    audio.play();
	}

	// Für Browser View

	$scope.selectPictureInBrowser = function(e, files) {
		//Möglichkeit ausgewähltes Bild auch im Browser anzuzeigen
		$image.formDataToDataUrl(files[0]).then(function(image) {
			$scope.pic = image;
			sendingBrowserImageToWatson(image);
			function sendingBrowserImageToWatson(image) {
				$image.toBlob(image).then(function (blob) {
					$image.compress(blob).then(function (blob) {
						$image.upload(blob).then(
							function(data) {
								console.log(data);
								$scope.results = data.labels;
								$scope.imageSize = data.size;
                $scope.modal.show();
							}, function(err) {
								$scope.onUploadFail('Upload failed. Want to retry?', sendingAppImageToWatson, image);
							}
						);
					});
				});
			}
		});
	}

	// confirmation Dialog mit Moeglichkeit des erneuten Uploads zu Watson
	$scope.onUploadFail = function(message, callback, data) {
		var retryUpload = $scope.window.confirm(message);
		if(retryUpload)	{
				callback(data);
		}
	}
	// speichern der Infos Bild und Text
	$scope.saveImageWordsPair = function(){
		$storage.saveImageWordsPair($scope.pic, $scope.results).then(function(newImageWordsPair) {
      $scope.modal.hide();
    });
	}

	// lesen der gespeicherten Daten
	// include_docs: inkl aller Daten eines jeden Dokuments
	// descending: Sortierung der Einträge nach Id auf-/absteigend
	$scope.loadAllImageWordsPairs = function() {
    $storage.loadAllImageWordsPairs();
	}

	// entfernen eines Eintrags aus der Setliste
	$scope.removeImageWordsPair = function(index, pair){
		// $storage.removeImageWordsPair(index, pair).then(function(index) {
		// 	$scope.allPairs.splice(index,1);
		// });
    $storage.removeImageWordsPair(index, pair);
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
