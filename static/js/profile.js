function getAuth(){

var auth = '110ec58a-b123-4ac4-7171-c87q4we3b8d1';
return auth;
}
app.controller('profile-controller',($scope,$http,$rootScope)=>{
    $scope.user={};
    $scope.original={};
    $scope.skillsSearch="";
    $scope.save=()=>
    {
        let data=angular.copy($scope.user);
        data.skills=data.skills.split(",");
        $http
        .post('/saveData',{
            usersDetails:data,
            authenticate:getAuth()
        })
        .then((response)=>{
            $scope.getData();
        })
    }
    $scope.uploadImage=()=>
    {
        if($scope.check())
        {
            $('#uploadPicModal').modal('show');
        }
    }
    $scope.check=()=>
    {
        return window.userId===window.profileId;
   //     console.log(window.userId===window.profileId);
    }
    $scope.removeSkill=(x)=>
    {
        var temp=[];
        for(var i=0;i<$scope.user.skills.length;i++)
        {
            if(x===$scope.user.skills[i])
            {
                continue;
            }
            temp.push($scope.user.skills[i]);
        }
        $scope.user.skills=temp;
    }
    $scope.addToSkill=(x)=>
    {
        $scope.user.skills.push(x);
    }
    $scope.searchSkills=(event)=>
    {
        if($scope.skillsSearch.trim()==="")
        return;
        if(event.keyCode===13)
        {
            $scope.user.skills.push($scope.skillsSearch);
            $scope.skillsSearch="";
            return;
        }
   
    }
    $scope.getData=()=>
    {
        $http
        .get('/getBankDetails/'+window.profileId,{headers:{authenticate:getAuth()}})
        .then((response)=>{
               $scope.user=response.data;
               $scope.user.editing=false;
               if(!$scope.user.about)
               {
                    $scope.user.about="";
               }
               if(!$scope.user.skills)
               {
                   $scope.user.skills="";
               }
               else
               {
                   $scope.user.skills=response.data.skills.join();
               }
               $scope.original=angular.copy($scope.user);
        });
       
    }
    $scope.getData();
    $scope.cancel=()=>
    {
        $scope.user=angular.copy($scope.original);
    }
});
app.controller('reviews-controller',($scope,$http)=>{
    $scope.reviews=[];
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
    $http
    .post('/getReviewsForaPerson',{
        _id:window.profileId,
        authenticate:getAuth()
    })
    .then((response)=>{
        $scope.reviews=response.data;
    });
});