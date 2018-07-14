function getAuth(){

var auth = '110ec58a-b123-4ac4-7171-c87q4we3b8d1';
return auth;
}
app.controller('jobhistory',($scope,$rootScope,$http)=>{
    $scope.tasks=[];
    $scope.usersDetails=[];
        
    $scope.getUserDetails=(_id)=>
    {
        for(var i=0;i<$scope.usersDetails.length;i++)
        {
            if($scope.usersDetails[i]._id==_id)
            {
                return $scope.usersDetails[i].name;
            }
        }
        $scope.usersDetails.push({
            _id:_id,
            name:''
        });
        $http
        .get('/getBankDetails/'+_id,{headers:{authenticate:getAuth()}})
        .then((response)=>{
            for(var i=0;i<$scope.usersDetails.length;i++)
            {
                if($scope.usersDetails[i]._id==response.data._id)
                {
                    $scope.usersDetails[i].name=response.data.name;
                }
            }
        });
    }
    $scope.showDescriptor=(index)=>
    {
        window.location.href='/task/'+$scope.tasks[index]._id;
    }
    $scope.getTasks=()=>
    {
        $http
        .post('/getTasksBiddedByUser',{
            _id:window.userId,
            authenticate:getAuth()
        })
        .then((response)=>{
            $scope.tasks=response.data;
            for(var i=0;i<$scope.tasks.length;i++)
            {
                $scope.tasks[i].show=false;
                if(!$scope.tasks[i].feedbackPosted)
                {
                $scope.tasks[i].feedbackTitle="";
                $scope.tasks[i].feedbackComment="";
                $scope.tasks[i].feedbackRating=0;
                }
            }
        });
    }
    $scope.getTasks();

});