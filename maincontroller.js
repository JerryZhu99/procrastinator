app.controller('mainController', function($scope, $mdSidenav, $mdToast, $mdDialog){
    window.scope = $scope;
    $scope.undoAssignment = {};
    $scope.newAssignment = {};

    if(localStorage.getItem("assignments")==null){
        localStorage.setItem("assignments", "[]");
    }
    if(localStorage.getItem("theme")==null){
        localStorage.setItem("theme", "light");
    }
    $scope.assignments = JSON.parse(localStorage.getItem("assignments"));
    $scope.theme = localStorage.getItem("theme");

    $scope.toggleSearch = function(){
        $scope.showSearch=!$scope.showSearch;
    }
    $scope.showNewAssignment = function(){
        $scope.creating = true;
        $scope.update();
        window.scrollTo(0,0);
    }
    $scope.hideNewAssignment = function(){
        $scope.creating = false;
        $scope.update();
    }
    $scope.addAssignment = function(){
        var assignment = {}
        assignment.name = $scope.newAssignment.name;
        assignment.description = $scope.newAssignment.description;
        assignment.dueDate = $scope.newAssignment.dueDate.toISOString();
        assignment.id - generateID();
        $scope.assignments.push(assignment);
        $scope.newAssignment = {};
        $scope.creating = false;
        if($scope.driveLoaded){
            $scope.updateFile($scope.fileId,$scope.assignments);
        }
        localStorage.setItem("assignments", JSON.stringify($scope.assignments));
    }
    $scope.removeAssignment = function(assignment){
        var index = $scope.assignments.indexOf(assignment);
        $scope.undoAssignment = $scope.assignments.splice(index, 1)[0];
        if($scope.driveLoaded){
            $scope.updateFile($scope.fileId,$scope.assignments);
        }
        localStorage.setItem("assignments", JSON.stringify($scope.assignments));
        $scope.showUndo();
        $scope.removeBrick();
    }
    $scope.startEdit = function(assignment){
        assignment.editing = true;
        assignment.editedName = assignment.name;
        assignment.editedDescription = assignment.description;
        assignment.editedDueDate = new Date(assignment.dueDate);

        $scope.update();
    }
    $scope.editAssignment = function(assignment, save){
        if(!assignment.id){assignment.id = generateID();}
        if(save){
            assignment.name = assignment.editedName;
            assignment.description = assignment.editedDescription;
            assignment.dueDate = assignment.editedDueDate;
        }
        assignment.editing = undefined;
        assignment.editedName = undefined;
        assignment.editedDescription = undefined;
        assignment.editedDueDate = undefined;
        if($scope.driveLoaded){
            $scope.updateFile($scope.fileId,$scope.assignments);
        }
        $scope.update();
        localStorage.setItem("assignments", JSON.stringify($scope.assignments));
    }
    $scope.showUndo = function(){
        var toast = $mdToast.simple()
        .textContent('Removed '+$scope.undoAssignment.name)
        .action('UNDO')
        .highlightAction(true)
        .position('bottom right');
        $mdToast.show(toast).then(function(response) {
            if ( response == 'ok' ) {
                $scope.assignments.push($scope.undoAssignment);
                if($scope.driveLoaded){
                    $scope.updateFile($scope.fileId,$scope.assignments);
                }
                localStorage.setItem("assignments", JSON.stringify($scope.assignments));
                $mdToast.hide(toast);
                $scope.update();
            }
        });
    }
    $scope.getDate = function(assignment){
        return new Date(assignment.dueDate).toDateString();
    }
    $scope.getDateDiff = function(assignment){
        var milliseconds = (new Date(assignment.dueDate).getTime() - new Date().getTime());
        var seconds = milliseconds/1000;
        var minutes = seconds/60;
        var hours = minutes/60;
        var days = Math.ceil(hours/24);
        if(days < 0){
            return "Overdue"
        }else if(days==0){
            return "Due today"
        }else if(days==1){
            return "Due tomorrow"
        }else{
            return "Due in "+days+" days"
        }
    }
    $scope.showSideNav = function(){
        $mdSidenav('left').toggle();
    }
    $scope.showDialog = function(ev, dialog) {
        $mdDialog.show({
            controller: DialogController,
            contentElement: dialog,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        });
    };
    $scope.setTheme = function(theme){
        $scope.theme = theme;
        localStorage.setItem("theme", theme);
    }
    $scope.exportData = function(){
        $scope.exports = JSON.stringify($scope.assignments);
        $scope.export = true;
    };
    $scope.driveAuth = true;
    $scope.driveLoaded = false;
    $scope.checkAuth = function() {
        gapi.auth.authorize({
            'client_id': CLIENT_ID,
            'scope': SCOPES.join(' '),
            'immediate': true
        }, $scope.handleAuthResult);
    }
    $scope.handleAuthResult = function(authResult){
        if (authResult && !authResult.error) {
            $scope.driveAuth = true;
            $scope.loadDriveApi();
        }else{
            $scope.driveAuth = false;
        }
    }
    $scope.handleAuthClick = function() {
        gapi.auth.authorize(
            {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
            $scope.handleAuthResult
        );
        return false;
    }
    $scope.loadDriveApi = function(){
        gapi.client.load('drive', 'v3', $scope.onDriveLoaded);
    }
    $scope.onDriveLoaded = function(){
        $scope.driveLoaded = true;
        $scope.findFile("procrastinator-data.json",function(response){
            console.log(response);
            if(response.files.length == 0){
                $scope.createFile("procrastinator-data.json",JSON.stringify($scope.assignments),function(file){
                    $scope.driveFileId = file.id;
                })
            }else{
                $scope.fileId = response.files[0].id;
                $scope.getFile($scope.fileId, function(file){
                    console.log(file);
                    $scope.assignments = file;
                    $scope.$apply();
                    localStorage.setItem("assignments", JSON.stringify($scope.assignments));
                });
            }
        });
    }
    $scope.createFile = function(name,data,callback) {
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const contentType = 'application/json';

        var metadata = {
            'name': name,
            'mimeType': contentType,
            'parents': [ 'appDataFolder']
        };

        var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n\r\n' +
        data +
        close_delim;

        var request = gapi.client.request({
            'path': '/upload/drive/v3/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
                'Content-Type': 'multipart/related; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody
        });
        if (!callback) {
            callback = function(file) {
                console.log(file)
            };
        }
        request.execute(callback);
    }
    $scope.updateFile = function(fileId,data,callback) {
        var request = gapi.client.request({
            'path': '/upload/drive/v3/files/'+fileId,
            'method': 'PATCH',
            'params': {'uploadType': 'media'},
            'body': data
        });
        if (!callback) {
            callback = function(file) {
                console.log(file)
            };
        }
        request.execute(callback);
    }
    $scope.findFile = function(name, callback){
        var request = gapi.client.request({
            'path': '/drive/v3/files',
            'method': 'GET',
            'params': {'maxResults': '1','q':"name = '"+name+"' ",'spaces':'appDataFolder'}
        });
        if (!callback) {
            callback = function(file) {
                console.log(file)
            };
        }
        request.execute(callback);
    }
    $scope.getFile = function(fileId, callback){
        var request = gapi.client.request({
            'path': '/drive/v3/files/'+fileId,
            'method': 'GET',
            'params': {'alt':'media'}
        });
        if (!callback) {
            callback = function(file) {
                console.log(file)
            };
        }
        request.execute(callback);
    }

});
function DialogController($scope, $mdDialog) {
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}
