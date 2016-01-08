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
	$timeout) {

	var createBlob;

	$scope.results = [];
	$scope.cordovaReady = false;
	var db = new PouchDB('WortBildPaare');
	var remoteCouch = false;


	$ionicPlatform.ready(function() {
		$scope.$apply(function() {
			$scope.cordovaReady = true;
			$scope.window = window;
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
			var options, ft, image, path;

			$scope.$apply(function() {
				$scope.pic = imageData;
			});

			sendingAppImageToWatson(imageData);
		};

    function onFail(message) {
      alert('Failed because: ' + message);
    }

		function sendingAppImageToWatson(imageData) {
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
				$scope.imageSize = data;

				$ionicLoading.hide();
			}, function(err) {
				$ionicLoading.hide();
				$scope.onUploadFail('Upload failed. Want to retry?', sendingAppImageToWatson, imageData);
				$scope.error = err;
			});
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

		sendingBrowserImageToWatson(files);

		function sendingBrowserImageToWatson(files) {			
			$scope.results = [];
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
				$scope.imageSize = data;
				$ionicLoading.hide();
			})
			.error(function(err){
				$ionicLoading.hide();
				$scope.onUploadFail('Upload failed. Want to retry?', sendingBrowserImageToWatson, files);
			});
		}
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
			console.log("vor Speichern in DB" + neuesBildWortePaar);
			db.put(neuesBildWortePaar, function callback(err, result) {
				if (!err) {
					console.log("neues BildWorte-Paar abgespeichert! ID: " + neuesBildWortePaar._id)
					alert("New Image-Words-Pair successfully saved!");
				}
			});
		}).catch(function (err) {
		  alert(err);
		});
	}

	createBlob = function(img) {
		match = img.match("data:image/(jpeg|png);base64,");
		if(match && match.length) {
			return blobUtil.base64StringToBlob(img.replace(match[0], ""));
		} else {
			return blobUtil.imgSrcToBlob(img);
		}
	}

	// lesen der gespeicherten Daten
	// include_docs: inkl aller Daten eines jeden Dokuments
	// descending: Sortierung der Einträge nach Id auf-/absteigend
	$scope.loadAllImageWordsPairs = function() {
		$scope.pic = {};
		$scope.results = [];

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
