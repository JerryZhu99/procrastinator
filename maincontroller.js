app.controller('mainController', function($scope, $mdSidenav, $mdToast, $mdDialog){
    window.scope = $scope;
    $scope.undoAssignment = {};
    $scope.newAssignment = {};
    $scope.lightOptions = ["#FFFFFF","#E0E0E0","#FF8A80","#B388FF","#8C9EFF","#82B1FF","#A7FFEB","#B9F6CA","#F4FF81","#FFD180"];
    $scope.darkOptions = ["#424242","#757575","#C62828","#4527A0","#283593","#1565C0","#00695C","#2E7D32","#827717","#E65100"];
    $scope.options = $scope.lightOptions;
    $scope.priorities = [{name:"Maximum",icon:"error",color:"#F44336"},
    {name:"High",icon:"warning",color:"#FF9800"},
    {name:"Medium",icon:"info_outline",color:"#9E9E9E"},
    {name:"Low",icon:"low_priority",color:"#3F51B5"}]

    if(localStorage.getItem("assignments")==null){
        localStorage.setItem("assignments", "[]");
    }
    if(localStorage.getItem("theme")==null){
        localStorage.setItem("theme", "light");
    }
    $scope.assignments = JSON.parse(localStorage.getItem("assignments"));
    $scope.theme = localStorage.getItem("theme");
    if($scope.theme=="dark"){
        $scope.options = $scope.darkOptions;
        for(var i=0;i<$scope.assignments.length;i++){
            var a = $scope.assignments[i];
            var index = $scope.lightOptions.indexOf(a.color);
            if(index>=0)
            a.color = $scope.darkOptions[index];
        }
    }else{
        $scope.options = $scope.lightOptions;
        for(var i=0;i<$scope.assignments.length;i++){
            var a = $scope.assignments[i];
            var index = $scope.darkOptions.indexOf(a.color);
            if(index>=0)
            a.color = $scope.lightOptions[index]
        }
    }
    $scope.toggleSearch = function(){
        $scope.showSearch=!$scope.showSearch;
    }
    $scope.showNewAssignment = function(){
        $scope.creating = true;
        window.scrollTo(0,0);
    }
    $scope.hideNewAssignment = function(){
        $scope.creating = false;
        $scope.newAssignment = {};
    }
    $scope.addAssignment = function(){
        var assignment = {}
        assignment.name = $scope.newAssignment.name;
        assignment.description = $scope.newAssignment.description;
        assignment.dueDate = $scope.newAssignment.dueDate.toISOString();
        assignment.approximate = $scope.newAssignment.approximate;
        assignment.color = $scope.newAssignment.color;
        assignment.id = generateID();
        $scope.assignments.push(assignment);
        $scope.newAssignment = {};
        $scope.creating = false;
        if($scope.driveLoaded){
            $scope.updateFile($scope.fileId,$scope.assignments, $scope.checkError);
        }
        localStorage.setItem("assignments", JSON.stringify($scope.assignments));
    }
    $scope.removeAssignment = function(assignment){
        var index = $scope.assignments.indexOf(assignment);
        $scope.undoAssignment = $scope.assignments.splice(index, 1)[0];
        if($scope.driveLoaded){
            $scope.updateFile($scope.fileId,$scope.assignments, $scope.checkError);
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
    }
    $scope.editAssignment = function(assignment, save){
        if(!assignment.id){assignment.id = generateID();}
        if(save){
            assignment.name = assignment.editedName;
            assignment.description = assignment.editedDescription;
            assignment.dueDate = new Date(assignment.editedDueDate).toISOString();
            assignment.approximate = assignment.editedApproximate;
        }
        assignment.editing = undefined;
        assignment.editedName = undefined;
        assignment.editedDescription = undefined;
        assignment.editedDueDate = undefined;
        assignment.editedApproximate = undefined;
        if($scope.driveLoaded){
            $scope.updateFile($scope.fileId,$scope.assignments, $scope.checkError);
        }
        localStorage.setItem("assignments", JSON.stringify($scope.assignments));
    }
    $scope.setPriority = function(assignment,priority){
        assignment.priority = priority;
        if($scope.driveLoaded){
            $scope.updateFile($scope.fileId,$scope.assignments, $scope.checkError);
        }
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
                    $scope.updateFile($scope.fileId,$scope.assignments, $scope.checkError);
                }
                localStorage.setItem("assignments", JSON.stringify($scope.assignments));
                $mdToast.hide(toast);
            }
        });
    }
    $scope.getDate = function(assignment){
        if(assignment.approximate){
            return "~" + new Date(assignment.dueDate).toDateString();
        }else{
            return new Date(assignment.dueDate).toDateString();
        }
    }
    $scope.getDateDiff = function(assignment){
        var milliseconds = (new Date(assignment.dueDate).getTime() - new Date().getTime());
        var seconds = milliseconds/1000;
        var minutes = seconds/60;
        var hours = minutes/60;
        var days = Math.ceil(hours/24);
        if(assignment.approximate){
            if(days < 1){
                return "Due soon"
            }else{
                return "Due in ~"+days+" days"
            }
        }else{
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
    }
    $scope.showSideNav = function(){
        $mdSidenav('left').toggle();
    }
    $scope.showDialog = function(ev, dialog, fullscreen) {
        $mdDialog.show({
            controller: DialogController,
            contentElement: dialog,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen:fullscreen
        });
    };
    $scope.hideDialog = function() {
        $mdDialog.hide();
    };
    $scope.setTheme = function(theme){
        if($scope.theme != theme){
            $scope.theme = theme;
            localStorage.setItem("theme", theme);
            if(theme=="dark"){
                $scope.options = $scope.darkOptions;
                for(var i=0;i<$scope.assignments.length;i++){
                    var a = $scope.assignments[i];
                    var index = $scope.lightOptions.indexOf(a.color);
                    if(index>=0)
                    a.color = $scope.darkOptions[index];
                }
            }else{
                $scope.options = $scope.lightOptions;
                for(var i=0;i<$scope.assignments.length;i++){
                    var a = $scope.assignments[i];
                    var index = $scope.darkOptions.indexOf(a.color);
                    if(index>=0)
                    a.color = $scope.lightOptions[index]
                }
            }
        }
    }
    $scope.checkError = function(file){
        if(file.error){
            console.log(file.error.message);
            var toast = $mdToast.simple()
            .textContent('Google Drive Error: '+file.error.message)
            .action('RETRY')
            .highlightAction(true)
            .position('bottom right');
            $mdToast.show(toast).then(function(response) {
                if ( response == 'ok' ) {
                    if($scope.driveLoaded){
                        $scope.updateFile($scope.fileId,$scope.assignments, $scope.checkError);
                    }
                    $mdToast.hide(toast);
                }
            });
        }
    }
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
                var checkGetError = function(file){
                    if(file.error){
                        console.log(file.error.message);
                        var toast = $mdToast.simple()
                        .textContent('Google Drive Error: '+file.error.message)
                        .action('RETRY')
                        .highlightAction(true)
                        .position('bottom right');
                        $mdToast.show(toast).then(function(response) {
                            if ( response == 'ok' ) {
                                if($scope.driveLoaded){
                                    $scope.getFile($scope.fileId, checkGetError);
                                }
                                $mdToast.hide(toast);
                            }
                        });
                        return;
                    }
                    console.log(file);
                    $scope.assignments = file;
                    if($scope.theme=="dark"){
                        $scope.options = $scope.darkOptions;
                        for(var i=0;i<$scope.assignments.length;i++){
                            var a = $scope.assignments[i];
                            var index = $scope.lightOptions.indexOf(a.color);
                            if(index>=0)
                            a.color = $scope.darkOptions[index];
                        }
                    }else{
                        $scope.options = $scope.lightOptions;
                        for(var i=0;i<$scope.assignments.length;i++){
                            var a = $scope.assignments[i];
                            var index = $scope.darkOptions.indexOf(a.color);
                            if(index>=0)
                            a.color = $scope.lightOptions[index]
                        }
                    }
                    $scope.$apply();
                    localStorage.setItem("assignments", JSON.stringify($scope.assignments));
                };
                $scope.getFile($scope.fileId,checkGetError);
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
