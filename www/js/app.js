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
	$cordovaFile,
	$timeout,
	$image,
	$q) {

	var createBlob;

	$scope.results = [];
	$scope.cordovaReady = false;
	var db = new PouchDB('WortBildPaare');
	var remoteCouch = false;


	$ionicPlatform.ready(function() {
		$scope.$apply(function() {
			$scope.cordovaReady = true;
			$scope.window = window;
		});
	});

  $scope.selectPicture = function(vonKamera) {
		try {
			if (vonKamera)
			{
				navigator.camera.getPicture(onSuccess, onFail, {
					quality: 10,
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
					quality: 10,
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

		function onSuccess(image) {
			$scope.$apply(function() {
				$scope.pic = image;
			});

			$image.toBlob(image).then(function (blob) {
				$image.compress(blob).then(function (blob) {
					$image.upload(blob).then(function(data) {
						$scope.results = data.labels;
						$scope.imageSize = data.size;
					});
				});
			});
		};

    function onFail(message) {
      alert('Failed because: ' + message);
    }
  }

	// Für Browser View

	$scope.selectPictureInBrowser = function(e, files) {
		//Möglichkeit ausgewähltes Bild auch im Browser anzuzeigen
		$image.formDataToDataUrl(files[0]).then(function(image) {
			$scope.pic = image;
			$image.toBlob(image).then(function (blob) {
				$image.compress(blob).then(function (blob) {
					$image.upload(blob).then(function(data) {
						$scope.results = data.labels;
						$scope.imageSize = data.size;
					});
				});
			});
		});
	}

	// speichern der Infos Bild und Text
	$scope.saveImageWordsPair = function(){
		createBlob($scope.pic).then(function (blob) {
			var id = new Date().toISOString();
			var neuesBildWortePaar = {
				_id: id,
				// image: $scope.pic,
				words: angular.toJson($scope.results),
				_attachments: {
					"file": {
						content_type: blob.type,
						data: blob
					}
				}
			};
			console.log(neuesBildWortePaar);
			db.put(neuesBildWortePaar, function callback(err, result) {
				if (!err) {
					console.log("neues BildWorte-Paar abgespeichert! ID: " + neuesBildWortePaar._id)
				}
			});
		}).catch(function (err) {
		  alert(err);
		});
	}

	// lesen der gespeicherten Daten
	// include_docs: inkl aller Daten eines jeden Dokuments
	// descending: Sortierung der Einträge nach Id auf-/absteigend
	$scope.loadAllImageWordsPairs = function() {
		db.allDocs({include_docs: true, descending: true, attachments: true}, function(err, doc){
			console.log(doc);
			$scope.$apply(function() {
				$scope.allPairs = doc.rows;
				angular.forEach($scope.allPairs, function(pair) {
					pair.doc.words = JSON.parse(pair.doc.words);
				});
				console.log($scope.allPairs.length);
			});
		});
	}

	// spezifische Bild-Worte-Paarung anzeigen
	// derzeit nicht benötigt
	$scope.ShowImageWordsPair = function(currentPair){
		$scope.$apply(function() {
			  $scope.pic = currentPair.doc.image;
				$scope.results = JSON.parse(currentPair.doc.words);
				$scope.currentRow = currentPair;
				console.log($scope.currentRow.id);
			})
	}

	// entfernen eines Eintrags aus der Setliste
	$scope.removeImageWordsPair = function(index, pair){
			if(pair != null)
			{
				console.log(pair.id);
				db.remove(pair.doc);
				$scope.allPairs.splice(index,1);
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
