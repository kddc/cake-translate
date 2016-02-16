angular
  .module('cake-translate')
  .service('$storage', ['$http', '$q', '$ionicLoading', '$image', '$rootScope', function($http, $q, $ionicLoading, $image, $rootScope) {
    var db = new PouchDB('WortBildPaare');
  	var remoteCouch = false;
    // var saveImageWordsPair, loadAllImageWordsPairs, ShowImageWordsPair, removeImageWordsPair;
    var storage = {
      imageWordPairs: [],
      // speichern der Infos Bild und Text
    	saveImageWordsPair: function(image, results) {
        var deferred = $q.defer();
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
              deferred.resolve(result);
            }
    			});
    		}).catch(function (err) {
    		  alert(err);
    		});
        return deferred.promise;
    	},

    	// lesen der gespeicherten Daten
    	// include_docs: inkl aller Daten eines jeden Dokuments
    	// descending: Sortierung der Einträge nach Id auf-/absteigend
    	loadAllImageWordsPairs: function() {
        // var deferred = $q.defer();
        db.allDocs({include_docs: true, descending: true, attachments: true}, function(err, doc){
    			console.log(doc);
          angular.forEach(doc.rows, function(pair) {
            pair.doc.words = JSON.parse(pair.doc.words);
          });

          storage.imageWordPairs = doc.rows;
          $rootScope.$apply();
          // deferred.resolve(true);
    		});

        // return deferred.promise;
    	},
      loadImageWordPair: function(id) {
        var deferred = $q.defer();
        db.get(id).then(function (doc) {
          deferred.resolve(doc);
        }).catch(function (err) {
          console.log(err);
        });
        return deferred.promise;
      },

    	// entfernen eines Eintrags aus der Setliste
    	removeImageWordsPair: function(index, pair){
        var deferred = $q.defer();
        if(pair != null) {
  				console.log(pair.id);
  				db.remove(pair.doc);
          deferred.resolve(index);
  			}
        return deferred.promise;
  		}
    };

    db.changes({
      since: 'now',
      live: true,
      include_docs: true,
      attachments: true
    }).on('change', function(change) {
      if(change.deleted) {
        var index = _.findIndex(storage.imageWordPairs, ['id', change.id]);
        storage.imageWordPairs.splice(index,1);
      } else {
        change.doc.words = JSON.parse(change.doc.words);
        storage.imageWordPairs.unshift(change);
      }
      $rootScope.$apply();
    });

    return storage;
    //
    // return {
    //   onUpdateImageWordsPairs: function(imageWordPairs) {
    //     return onUpdateImageWordsPairs(imageWordPairs);
    //   },
    //   loadImageWordPair: function(id) {
    //     return loadImageWordPair(id);
    //   },
    //   saveImageWordsPair: function(image, results) {
    //     return saveImageWordsPair(image, results);
    //   },
    //   loadAllImageWordsPairs: function() {
    //     return loadAllImageWordsPairs();
    //   },
    //   removeImageWordsPair: function(index, pair) {
    //     return removeImageWordsPair(index, pair);
    //   }
    // }

  }]);
