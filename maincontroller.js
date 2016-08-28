app.controller('mainController', function($scope){
    $scope.newAssignment = {};
    $scope.assignments = [
        {
            name: 'Extended Essay',
            description: 'Final Copy',
            dueDate: new Date(2016,8,1,0,0,0,0)
        },
        {
            name: 'Extended Essay',
            dueDate: new Date(2016,8,3,0,0,0,0)
        },
        {
            name: 'Extended Essay',
            description: 'Final Copy',
            dueDate: new Date(2016,8,2,0,0,0,0)
        }
    ];
    $scope.addAssignment = function(){
        var assignment = {}
        assignment.name = $scope.newAssignment.name;
        assignment.description = $scope.newAssignment.description;
        assignment.dueDate = $scope.newAssignment.dueDate;
        $scope.assignments.push(assignment);
        $scope.newAssignment = {};
        $scope.showNewAssignment = false;
    }
    $scope.getDate = function(assignment){
        return new Date(assignment.dueDate).toDateString();
    }
    $scope.getDateDiff = function(assignment){
    var currentTime = new Date()
      var milliseconds = (assignment.dueDate.getTime() - new Date().getTime());
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
});
