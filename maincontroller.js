app.controller('mainController', function($scope, $mdSidenav, $mdToast, $mdDialog){
    window.scope = $scope;
    $scope.theme="light";
    $scope.undoAssignment = {};

    $scope.newAssignment = {};
    if(localStorage.getItem("assignments")==null){
        localStorage.setItem("assignments", "[]")
    }
    $scope.assignments = JSON.parse(localStorage.getItem("assignments"));
    $scope.addAssignment = function(){
        var assignment = {}
        assignment.name = $scope.newAssignment.name;
        assignment.description = $scope.newAssignment.description;
        assignment.dueDate = $scope.newAssignment.dueDate;
        $scope.assignments.push(assignment);
        $scope.newAssignment = {};
        $scope.showNewAssignment = false;

        localStorage.setItem("assignments", JSON.stringify($scope.assignments));
    }
    $scope.removeAssignment = function(assignment){
        var index = $scope.assignments.indexOf(assignment);
        $scope.undoAssignment = $scope.assignments.splice(index, 1)[0];
        localStorage.setItem("assignments", JSON.stringify($scope.assignments));
        $scope.showUndo();
    }
    $scope.showUndo = function(){
        var toast = $mdToast.simple()
        .textContent('Removed '+$scope.undoAssignment.name)
        .action('UNDO')
        .highlightAction(true)
        .highlightClass('md-accent')// Accent is used by default, this just demonstrates the usage.
        .position('top');
        $mdToast.show(toast).then(function(response) {
            if ( response == 'ok' ) {
                $scope.assignments.push($scope.undoAssignment);
                localStorage.setItem("assignments", JSON.stringify($scope.assignments));
                $mdToast.hide(toast);
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
    $scope.showSettings = function(ev) {
        $mdDialog.show({
            controller: DialogController,
            contentElement: '#settings',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        });
    };
    $scope.exportData = function(){
        $scope.exports = JSON.stringify($scope.assignments);
        $scope.export = true;
    };
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
