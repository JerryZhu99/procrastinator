var app = angular.module('App', ['ngMaterial','ngAnimate']);
app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('input', 'default')
    .primaryPalette('grey',{
        'hue-1': '50'
    });
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
