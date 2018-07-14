function getAuth(){

var auth = '110ec58a-b123-4ac4-7171-c87q4we3b8d1';
return auth;
}
app.controller('connectwithadmin',($scope,$rootScope,$http)=>{
    $scope.tasks=[];
    $scope.usersDetails=[];
    $scope.sendMessageToAdmin=(index)=>
    {
        if($scope.tasks[index].messageToAdmin.trim()=="")
        {
            $rootScope.showBottomBar("Enter the message");
        }
        else
        {
            //Send the message here
            $http
            .post('/contact-admin',{
                userId:window.userId,
                _id:$scope.tasks[index]._id,
                authenticate:getAuth(),
                message:$scope.tasks[index].messageToAdmin.trim(),
            authenticate:getAuth()
            })
            .then((response)=>{
                $scope.tasks[index].messageToAdmin="";
                $rootScope.showBottomBar("Message sent to admin");
            });
        }
    }
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
        let temp=$scope.tasks[index].show;
        for(var i=0;i<$scope.tasks.length;i++)
        {
            $scope.tasks[i].show=false;
        }
        $scope.tasks[index].show=!temp;
    }
    $scope.getTasks=()=>
    {
        $http
        .post('/getTasksAssociatedToUser',{
            _id:window.userId,
            authenticate:getAuth()
        })
        .then((response)=>{
            $scope.tasks=response.data;
            for(var i=0;i<$scope.tasks.length;i++)
            {
                $scope.tasks[i].show=false;
                $scope.tasks[i].messageToAdmin="";
            }
        });
    }
    $scope.getTasks();

});