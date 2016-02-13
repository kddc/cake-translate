angular
  .module('cake-translate')
  .service('$image', ['$http', '$q', '$ionicLoading', '$env', function($http, $q, $ionicLoading, $env) {
    var formDataToDataUrl, upload, toBlob, compress;

    formDataToDataUrl = function(formData) {
      var deferred = $q.defer();

      var fileReader = new FileReader();
      fileReader.readAsDataURL(formData);
  		fileReader.onload = function(e) {
        deferred.resolve(e.target.result);
      }

      return deferred.promise;
    };

    upload = function(blob) {
      var deferred = $q.defer();
      var fd = new FormData();

      $ionicLoading.show({template:'Sending to Watson...'});

      fd.append('file', blob);
      $http.post($env.endpoint + "/uploadpic", fd, {
      // $http.post("https://cake-translate.eu-gb.mybluemix.net/uploadpic", fd, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      })
      .success(function(data){
        $ionicLoading.hide();
        deferred.resolve(data);
      })
      .error(function(err){
        $ionicLoading.hide();
        deferred.reject(err);
      });

      return deferred.promise;
    };

    toBlob = function(img) {
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
    };

    compress = function(image) {
      var img, defer, canvas;

      defer = $q.defer();
      canvas = document.createElement('canvas');
      img = new Image;

      img.src = URL.createObjectURL(image);
      img.onload = function() {
        var width = this.width / 2;
        var height = this.height / 2;
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        // defer.resolve(canvas.toDataURL("image/jpeg",0.1));
        toBlob(canvas.toDataURL("image/jpeg", 0.1)).then(function (blob) {
          defer.resolve(blob);
        });
      }
      return defer.promise;
    };

    return {
      formDataToDataUrl: function(formData) {
        return formDataToDataUrl(formData);
      },
      upload: function(img) {
        return upload(img);
      },
      toBlob: function(img) {
        return toBlob(img);
      },
      compress: function(img) {
        return compress(img);
      }
    }
  }]);
