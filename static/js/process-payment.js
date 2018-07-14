function getAuth(){

var auth = '110ec58a-b123-4ac4-7171-c87q4we3b8d1';
return auth;
}
app.controller('process-payment',($scope,$rootScope,$http)=>{
   $scope.tasks=[];
   $scope.userDetails=[];
   $scope.search="";
   $scope.originalTasks=[];
   $scope.getAmount=(assignedTo,messages)=>
    {
        for(let i=0;i<messages.length;i++)
        {
            if(messages[i].messageBy===assignedTo)
            {
                return messages[i].cost;
            }
        }
    }
    $scope.getPayment=(assignedTo,messages)=>
    {
        for(let i=0;i<messages.length;i++)
        {
            if(messages[i].messageBy===assignedTo)
            {
                return Math.round(parseInt(messages[i].cost)*0.87*100)/100;
            }
        }
    }

   $scope.searching=()=>
   {
       let temp=angular.copy($scope.originalTasks);
        let temp2=[];
        for(let i=0;i<temp.length;i++)
        {
            if(temp[i].title.toLowerCase().trim().indexOf($scope.search.trim().toLowerCase().trim())!=-1||(temp[i].transactionId&&temp[i].transactionId.toLowerCase().trim().indexOf($scope.search.trim().toLowerCase().trim())!=-1))
            {
                temp2.push(temp[i]);
            }
        }
        $scope.tasks=temp2;

   }
   $scope.getTasks=()=>
   {
    $http
    .post('/searchTasks/all/all',{authenticate:getAuth()})
    .then((response)=>{
        //Filter the not completed task

        let temp=[];
        for(let i=0;i<response.data.length;i++)
        {
            if(response.data[i].assignedTo&&!response.data[i].paymentProcessed)
            {
                temp.push(response.data[i]);
            }
        }
        $scope.originalTasks=angular.copy(temp);
       $scope.tasks=temp;
     });
   
   }
   $scope.accountNumber="";
   $scope.accountIFSC="";
   $scope.branchName="";
   $scope.getDetails=(_id)=>
   {
       $http
       .get('/getBankDetails/'+_id,{headers:{authenticate:getAuth()}})
       .then((response)=>{
           $scope.accountNumber=response.data.bankName;
           $scope.accountIFSC=response.data.bic;
           $scope.branchName=response.data.iban;
        $('#phoneNumberModal').modal('show');    
       });
   }
   $scope.jobComplete=(x)=>
   {
       if(window.confirm("Are you sure?"))
       {
           $http
           .post('/completeTaskAdmin',{
                _id:x,
                authenticate:getAuth()
           })
           .then((response)=>{
            $scope.getTasks();
           });
       }
   }
   $scope.getTasks();
    $scope.revertTask=(_id)=>
    {
        if(window.confirm("Are you sure?"))
        {
            $http
            .post('/revertTask',{
                _id:_id,
                authenticate:getAuth()
            })
            .then((response)=>{
                $scope.getTasks();
                
            });
        }
    }
    $scope.getUserDetails=(_id)=>
    {
        if(_id)
        {
        for(var i=0;i<$scope.userDetails.length;i++)
        {
            if($scope.userDetails[i]._id===_id)
            {
                return $scope.userDetails[i].name;
            }
        }
        $scope.userDetails.push({
            _id:_id,
            name:""
        });
        $http
        .get('/getBankDetails/'+_id,{headers:{authenticate:getAuth()}})
        .then((response)=>{
            for(var i=0;i<$scope.userDetails.length;i++)
            {
                if($scope.userDetails[i]._id===response.data._id)
                {
                    $scope.userDetails[i].name=response.data.name;
               
                }
            }   
        });
    }
    }
});