angular
  .module('cake-translate')
  .service('$env', [function() {
    var env = {
      endpoint: "https://cake-translate.eu-gb.mybluemix.net"
    };
    return env;
  }]);
