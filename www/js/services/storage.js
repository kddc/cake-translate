angular
  .module('cake-translate')
  .service('$storage', ['$http', '$q', '$ionicLoading', '$image', function($http, $q, $ionicLoading, $image) {
    var db = new PouchDB('WortBildPaare');
  	var remoteCouch = false;
    var saveImageWordsPair, loadAllImageWordsPairs, ShowImageWordsPair, removeImageWordsPair;

    // speichern der Infos Bild und Text
  	saveImageWordsPair = function(image, results) {
  		$image.toBlob(image).then(function (blob) {
  			var id = new Date().toISOString();
  			var neuesBildWortePaar = {
  				_id: id,
  				// image: $scope.pic,
  				words: angular.toJson(results),
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

  	// lesen der gespeicherten Daten
  	// include_docs: inkl aller Daten eines jeden Dokuments
  	// descending: Sortierung der Einträge nach Id auf-/absteigend
  	loadAllImageWordsPairs = function() {
      var deferred = $q.defer();

  		db.allDocs({include_docs: true, descending: true, attachments: true}, function(err, doc){
  			console.log(doc);
        angular.forEach(doc.rows, function(pair) {
          pair.doc.words = JSON.parse(pair.doc.words);
        });
        deferred.resolve(doc.rows);
  		});

      return deferred.promise;
  	}

  	// spezifische Bild-Worte-Paarung anzeigen
  	// derzeit nicht benötigt
  	// $scope.ShowImageWordsPair = function(currentPair){
  	// 	$scope.$apply(function() {
  	// 		  $scope.pic = currentPair.doc.image;
  	// 			$scope.results = JSON.parse(currentPair.doc.words);
  	// 			$scope.currentRow = currentPair;
  	// 			console.log($scope.currentRow.id);
  	// 		})
  	// }

  	// entfernen eines Eintrags aus der Setliste
  	removeImageWordsPair = function(index, pair){
      var deferred = $q.defer();
      if(pair != null) {
				console.log(pair.id);
				db.remove(pair.doc);
        deferred.resolve(index);
			}
      return deferred.promise;
		}

    return {
      saveImageWordsPair: function(image, results) {
        return saveImageWordsPair(image, results);
      },
      loadAllImageWordsPairs: function() {
        return loadAllImageWordsPairs();
      },
      removeImageWordsPair: function(index, pair) {
        return removeImageWordsPair(index, pair);
      }
    }

  }]);
