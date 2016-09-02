var app = angular.module('App', ['ngMaterial','ngAnimate','masonry']);
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
