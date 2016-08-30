
var CLIENT_ID = '865537983767-sgfm44lod6cas7972mha3300p5lepbq2.apps.googleusercontent.com';

var SCOPES = ['https://www.googleapis.com/auth/drive.appdata'];

function checkAuth() {
    var scope = angular.element(document.body).scope();
    scope.checkAuth();
}
