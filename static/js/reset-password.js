function getAuth(){

var auth = '110ec58a-b123-4ac4-7171-c87q4we3b8d1';
return auth;
}
app.controller('resetPasswordController',($scope,$http,$rootScope)=>{
    $scope.password="";
    $scope.show=false;

    $scope.newPassword=()=>{
        if($scope.password.length<5)
        {
            $rootScope.showBottomBar("Password minimum length 5 characters!");
            return;
        }
        $http
        .post('/change-password',{
            _id:window.userId,
            password:$scope.password,
            authenticate:getAuth()
        })
        .then((response)=>{
            $rootScope.showBottomBar("Password changed successfully!");
            $scope.show=true;
            setTimeout(()=>{
                window.location.href="/";
            },500)
        });
    }
});