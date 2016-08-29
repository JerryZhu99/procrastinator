var app = angular.module('App', ['ngMaterial']);
app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('input', 'default')
            .primaryPalette('grey',{
                'hue-1': '50'
            })
});
