function getAuth(){

var auth = '110ec58a-b123-4ac4-7171-c87q4we3b8d1';
return auth;
}
var handler = StripeCheckout.configure({
    key: 'pk_test_tHBvWLncMLaEuIBy72elvNCP',
    image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
    locale: 'auto',
    token: function(token) {
      var ajax=new XMLHttpRequest();
      ajax.open('POST','/acceptTask',true);
      ajax.onreadystatechange=()=>
      {
        if(ajax.readyState==4&&ajax.status===200)
        {
          if(JSON.parse(ajax.responseText).result)
          {
              window.location.reload();
          }
          else
          {
                window.alert("You card was declined");
          }
        }      
      }
      ajax.setRequestHeader("Content-type","application/json");
      ajax.send(JSON.stringify({_id:window.taskId,token:token.id,assignTo:window.assignedTo,cost:window.cost,authenticate:'110ec58a-b123-4ac4-7171-c87q4we3b8d1'}));
    }
  });
app.controller('inbox-controller',($scope,$rootScope,$http)=>{
    $scope.tasks=[];
    $scope.usersDetails=[];
    $scope.reportJob=(index)=>
    {
  
            if(window.confirm("Are you sure you want to report the task?"))
            {
                $http
                .post('/reportTask',{
                    _id:$scope.tasks[index]._id,
                    authenticate:getAuth()
                })
                .then(()=>{
                    window.location.reload();                    
                })
            }
  
  
  
    }
    $scope.submitFeedbackForTask=(index)=>
    {
        if($scope.tasks[index].feedbackComment.trim()==""||$scope.tasks[index].feedbackTitle.trim()==""||$scope.tasks[index].feedbackRating==0)
        {
            $rootScope.showBottomBar("Please, fill in all the details");
            return;
        }
        $http
        .post('/addTaskFeedback',{
            _id:$scope.tasks[index]._id,
            feedbackComment:$scope.tasks[index].feedbackComment.trim(),
            feedbackTitle:$scope.tasks[index].feedbackTitle.trim(),
            feedbackRating:$scope.tasks[index].feedbackRating,
            authenticate:getAuth()
        })
        .then((response)=>{
            $scope.tasks[index].feedbackPosted=true;
        });
    }
    $scope.jobComplete=(x)=>
    {
        if(window.confirm("Payment will be processed to the customer?"))
        {
            $http
            .post('/completeTask',{
                 _id:x,
                 authenticate:getAuth()
            })
            .then((response)=>{
             window.location.reload();
            });
        }
    }
    $scope.acceptBid=(x,taskId)=>
    {
        window.assignedTo=x.messageBy;
        window.cost=x.cost;
        window.taskId=taskId;
        handler.open({
            name: 'Dzinn',
            description: 'Accept Bid',
            zipCode: true,
            currency: 'eur',
            amount: parseInt(x.cost)*100
          });

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
    $scope.setRating=(index,rating)=>
    {
        $scope.tasks[index].feedbackRating=rating;
    }
    $scope.getTasks=()=>
    {
        $http
        .post('/getTasksPostedByUser',{
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