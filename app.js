var app = angular.module('App', ['ngMaterial','ngAnimate','masonry','tb-color-picker']);
app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('input-light', 'default')
    .primaryPalette('grey',{
        'hue-1': '50'
    });
    $mdThemingProvider.theme('input-dark')
    .primaryPalette('grey',{
        'hue-1': '800'
    })
    .dark();
    $mdThemingProvider.theme('light')
    .primaryPalette('blue')
    .accentPalette('blue-grey');
    $mdThemingProvider.theme('dark')
    .primaryPalette('blue')
    .accentPalette('blue-grey')
    .dark();
    $mdThemingProvider.alwaysWatchTheme(true);
    $mdThemingProvider.setDefaultTheme('light');

});
app.directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      scope.$watch(attrs.focusMe, function(value) {
        if(value === true) {
          console.log('value=',value);
          $timeout(function() {
            element[0].focus();
          });
        }
      });
    }
  };
});
function generateID() {
    var S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
