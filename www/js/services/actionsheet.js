angular
  .module('cake-translate')
  .service('$actionsheet', ['$ionicActionSheet', function($ionicActionSheet) {
    var actionsheet = {
      // Triggered on a button click, or some other target
       showDeleteSheet: function() {

         // Show the action sheet
         var hideSheet = $ionicActionSheet.show({
           buttons: [
             { text: '<b>Share</b> This' },
             { text: 'Move' }
           ],
           destructiveText: 'Delete',
           titleText: 'Modify your album',
           cancelText: 'Cancel',
           cancel: function() {
                // add cancel code..
              },
           buttonClicked: function(index) {
             return true;
           }
         });

         // For example's sake, hide the sheet after two seconds
         $timeout(function() {
           hideSheet();
         }, 2000);

       };
    };

    return actionsheet;

  }]);
