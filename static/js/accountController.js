function getAuth(){

var auth = '110ec58a-b123-4ac4-7171-c87q4we3b8d1';
return auth;
}
app.controller('accountController',function($scope,$http,$rootScope){
        $scope.saving=false;
        $scope.whetherFirst=true;
        $scope.terms=false;
        if(userId!='No')
        {
            $http
            .get('/getBankDetails/'+userId,{headers:{authenticate:getAuth()}})
            .then(function(response){
                    if(response.data.bankName)
                    {
                        $scope.terms=true;
                        $scope.whetherFirst=false;
                    }
                    $scope.accountNumber=response.data.bankName;
                    $scope.accountIFSC=response.data.bic;
                    $scope.branchName=response.data.iban;

            });
        }
        $scope.save=function()
        {
            if(!$scope.accountNumber||!$scope.accountIFSC||!$scope.branchName)
            {
                $rootScope.showBottomBar("Please, fill in the details first!");
            }
            else
            if(!$scope.terms)
            {
                $rootScope.showBottomBar("Please, check the terms and conditions!");
            }
            else
            {
                $scope.saving=true;
                $http
                .get('/saveBankDetails/'+userId+'/'+$scope.accountNumber+'/'+$scope.accountIFSC+'/'+$scope.branchName.trim(),{headers:{authenticate:getAuth()}})
                .then(function(response){
                    if(response.data.result)
                    {
                        $rootScope.showBottomBar("Details updated successfully!");
                        $http
                        .get('/getBankDetails/'+userId,{headers:{authenticate:getAuth()}})
                        .then(function(response){
                            if($scope.whetherFirst)
                            {
                                window.location.href="/earn";
                            }
                            else
                                window.location.reload();
                        });
                        
                    }
                    else
                    {
                        $rootScope.showBottomBar("There was some problem. Please try again!");
                        $scope.saving=false;
                        
                    }

                });
            }
        }

});