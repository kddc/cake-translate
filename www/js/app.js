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

	$scope.resize = function(image) {
		var defer = $q.defer();
	  var canvas = document.createElement('canvas');

	  // var width = img.width;
	  // var height = img.height;
		//
	  // // calculate the width and height, constraining the proportions
	  // if (width > height) {
	  //   if (width > max_width) {
	  //     //height *= max_width / width;
	  //     height = Math.round(height *= max_width / width);
	  //     width = max_width;
	  //   }
	  // } else {
	  //   if (height > max_height) {
	  //     //width *= max_height / height;
	  //     width = Math.round(width *= max_height / height);
	  //     height = max_height;
	  //   }
	  // }

	  // resize the canvas and draw the image data into it
		var img = new Image;
	 	img.src = URL.createObjectURL(image);
		img.onload = function() {
			canvas.width = 600;
		  canvas.height = 400;
		  var ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, 600, 400);
			defer.resolve(canvas.toDataURL("image/jpeg",0.1));
		}
	  // canvas.width = 50;
	  // canvas.height = 50;
	  // var ctx = canvas.getContext("2d");
	  // ctx.drawImage(img, 0, 0, 50, 50);
	  // return canvas.toDataURL("image/jpeg",0.7); // get the data from canvas as 70% JPG (can be also PNG, etc.)
		return defer.promise;
	}

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

		function onSuccess(imageData) {
			var options, ft, image, path;

			$scope.$apply(function() {
				$scope.pic = imageData;
			});

			$scope.results = [];
			$ionicLoading.show({template:'Sending to Watson...'});

			createBlob($scope.pic).then(function (blob) {
				$scope.log = blob.type;
				$scope.resize(blob).then(function (data) {
					createBlob(data).then(function (blob) {
						theBlob = blob;
							// success
						$ionicLoading.show({template:'Sending to Watson...'});

						// Formular vom Browser aus abschicken
						var fd = new FormData();
						// console.log($scope.resize(files[0]));
						// blob.lastModifiedDate = new Date();
						// blob.name = "file.jpg";
						// blob["type"] = "text/plain";
						// var file = new File([blob], "file.jpg");
						// console.log(blob);
						// console.log(file);
						// console.log(file);
						console.log(theBlob);
						// console.log(files[0]);
						fd.append('file', theBlob);
						// $http.post("http://localhost:3000/uploadpic", fd, {
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
							alert(err);
						});

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
		var fileReader = new FileReader();
    fileReader.readAsDataURL(files[0]);
		fileReader.onload = function(e) {
	    $timeout(function() {
				$scope.pic = e.target.result;
				createBlob($scope.pic).then(function (blob) {
					console.log(blob);
					$scope.log = blob.type;
					$scope.resize(blob).then(function (data) {
						$scope.pic = data;
						createBlob(data).then(function (blob) {
							console.log(blob);
							theBlob = blob;
  							// success
							$ionicLoading.show({template:'Sending to Watson...'});

							// Formular vom Browser aus abschicken
							var fd = new FormData();
							// console.log($scope.resize(files[0]));
							// blob.lastModifiedDate = new Date();
							// blob.name = "file.jpg";
							// blob["type"] = "text/plain";
							// var file = new File([blob], "file.jpg");
							// console.log(blob);
							// console.log(file);
							// console.log(file);
							console.log(theBlob);
							console.log(files[0]);
					    fd.append('file', theBlob);
							// $http.post("http://localhost:3000/uploadpic", fd, {
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
								alert(err);
					    });
						});
					});
				});
	    });
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

	createBlob = function(img) {
		var deferred = $q.defer();
		var blob;
		match = img.match("data:image/(jpeg|png);base64,");
		if(match && match.length) {
			blob = blobUtil.base64StringToBlob(img.replace(match[0], ""), "image/" + match[1]);
		} else {
			blob = blobUtil.imgSrcToBlob(img);
		}
		blob.then(function(blob) {
			blob.lastModifiedDate = new Date();
			if( blob.type = "image/jpeg" ) {
				blob.name = Math.random().toString(36).substring(7) + ".jpg";
			} else {
				blob.name = Math.random().toString(36).substring(7) + ".png";
			}
			deferred.resolve(blob);
		});
		return deferred.promise;
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
