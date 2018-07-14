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
             $('.loader-cover').css('display','block');
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
$(document).ready(()=>{
    window.addEventListener('popstate', function() {
        handler.close();
      });
    
});
app.controller('task-edit-controller',($scope,$http,$rootScope,$timeout)=>{
    if(window.showPaymentModal==='true')
    {
        $('#paymentModal').modal('show');
    }
    $scope.title=window.title;
    $scope.description=window.description;
    $scope.tags=window.tags;
    $scope.tagsSearch="";
    $scope.taskAddress=window.taskAddress;
    if($scope.taskAddress!=="No")
    {
        $timeout(setAutoComplete,50);
        
    }
    $scope.Cost=window.Cost==="N/A"?null:parseInt(window.Cost);

    $scope.tagOverlayStyle={
        "border":"none"
      }
      $scope.dbTags=[];
      
      var dateParts = window.dueDate.split("-");
      
      $scope.dueDate= new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
      $scope.addSelectedTag=function(temp)
      {
        temp=(temp.indexOf('#')!='0')?('#'+temp):(temp);
        var flag=false;  
        for(var i=0;i<$scope.tags.length;i++)
          {
            if(temp.toLowerCase()==$scope.tags[i].toLowerCase())
            {
    
                flag=true;
              break;
            }
          }
          if(flag)
          {
            $rootScope.showBottomBar("This tag has already been added!");
          }
          else
          {
            $scope.tags.push(temp);
          }
    
          $scope.dbTags=[];
          
          $scope.tagOverlayStyle={
            "border":"none"
          };
          $scope.tagsSearch="";
     
      }
      $scope.saveTask=()=>
      {
          let data={
              _id:window.taskId
          };
          if($scope.title.trim()==="")
          {
              $rootScope.showBottomBar("Enter the title");
              return;
          }
          data.title=$scope.title;
          if($scope.Cost!=null&&$scope.Cost<0)
          {
              $rootScope.showBottomBar("Cost cannot be less than zero!");
              return;
          }
          data.cost=$scope.Cost?$scope.Cost:"N/A";
          if($scope.dueDate==null)
          {
            $rootScope.showBottomBar("Enter the date");
            return;
      
          }
          data.description=$scope.description;
          if(GetFormattedDate($scope.dueDate)!=window.dueDate&&GetFormattedDate($scope.dueDate)!=GetFormattedDate(new Date())&&$scope.dueDate.getTime()<new Date().getTime())
          {
            $rootScope.showBottomBar("Due Date cannot be of past");
            return;
      
          }
          data.tags=$scope.tags;
          data.dueDate=GetFormattedDate($scope.dueDate);
          if(window.taskAddress!=="No")
          {
            data.taskAddress=angular.element(document.getElementById('placeSearch')).val();
          }
          if(window.confirm("Are you sure?"))
          {
            $('.loader-cover').css('display','block');
            data.authenticate=getAuth()
            $http
            .post('/update-task',data)
            .then((response)=>{
                    window.location.reload();
            });
         
          }
        }
      $scope.tagMagic=function(event)
      {
        if($scope.tagsSearch.trim().replace('#','')!=""){
        if(event.keyCode=='13')
        {
          //Pressed Enter
          var temp=$scope.tagsSearch.trim().replace(/ /g,'');
          $scope.addSelectedTag(temp);
        }
        else
        {
          $http
          .get('/postataskapis/getTags?tagName='+$scope.tagsSearch.trim().replace('#',''))
          .then(function(response){
           // console.log(response.data);
            if(response.data.length!=0)
            {
              $scope.tagOverlayStyle={
                "border":"0.5px solid #757575"
              };
              $scope.dbTags=response.data;
            }
            else
            {
              $scope.dbTags=[];
              
              $scope.tagOverlayStyle={
                "border":"none"
              };
            }
          });
        }
        }
        else
        {
          $scope.dbTags=[];
          
          $scope.tagOverlayStyle={
            "border":"none"
          };
    
        }
      };
    $scope.removeSelectedTag=(index)=>
    {
        let temp=[];
        for(let i=0;i<$scope.tags.length;i++)
        {
            if(i===index)
            continue;
            temp.push($scope.tags[i]);
        }
         $scope.tags=temp;
    }
});
app.controller('delete-task-controller',($scope,$http)=>{
    $scope.deleteTask=(_id)=>
    {
        if(window.confirm("Are you sure?"))
        {
            $('.loader-cover').css('display','block');
            $http
            .post('/deleteTask',{
                _id:_id,
                authenticate:getAuth()
            })
            .then((response)=>{
                window.location.reload();
            });
                
       
        }
    }
});
app.controller('sendMessageController',function($scope,$rootScope,$http){
    $scope.updateBid=(index)=>
    {
        if($scope.data[index].message.trim()=="")
        {
            $scope.showBottomBar("Enter the bid message please!");
            return;
        }
        if($scope.data[index].cost==null)
        {
            $scope.showBottomBar("Enter the cost please!");
            return;
        }
        else
        if($scope.data[index].cost<0)
        {
            $scope.showBottomBar("Cost cannot be less than zero!");
            return;
        }
        else
        if(window.confirm("Are you sure?"))
        {
            $http
            .post('/updateBid',{
                _id:taskId,
                authenticate:getAuth(),
                data:$scope.data[index]
            })
            .then((response)=>{
                $scope.showBottomBar("Bid updated successfully!");
            });
        }
    }
    $scope.taskDetails={};
    $http
    .post('/taskDetails',{
        _id:window.taskId,
        authenticate:getAuth()
    })
    .then((response)=>{
        $scope.taskDetails=response.data;
        $http
        .get('/taskApis/getTasksDetails/'+taskId,{headers:{authenticate:getAuth()}})
        .then(function(response){
            $scope.data=response.data.messages;
            for(var i=0;i<$scope.data.length;i++)
            {
                $scope.data[i].cost=parseInt($scope.data[i].cost);
            }
            if($scope.userId!=$scope.postedBy)
            if($scope.bidType=='closed')
            {
                var temp=[];
                for(var i=0;i<$scope.data.length;i++)
                {
                    if($scope.data[i].messageBy==$scope.userId)
                    {
                        temp.push($scope.data[i]);
                    }
                }
                $scope.data=temp;
            }
            if($scope.taskDetails.assignedTo)
            {
                //Here we need to bring the message to the top
                for(var i=0;i<$scope.data.length;i++)
                {
                    if($scope.data[i].messageBy==$scope.taskDetails.assignedTo)
                    {
                        //Swap with the first one
                        var temp=angular.copy($scope.data[i]);
                        $scope.data[i]=angular.copy($scope.data[0]);
                        $scope.data[0]=angular.copy(temp);
                        $scope.data[0].highLight=true;
                    }
                }   
            }
            $scope.showMessagingBox=$scope.showMessagingBoxCheck();
            
        });
    });
    $scope.sending=false;
    $scope.allowMessaging=false;
    $scope.description='';
    $scope.cost=null;
    $scope.data=[];
    $scope.showMessagingBox=true;
    $scope.userId=userId;
    $scope.postedBy=postedBy;
    $scope.blockMessaging=false;
    $scope.bidType=bidType;
    $scope.acceptBid=(x)=>
    {
        window.assignedTo=x.messageBy;
        window.cost=x.cost;
        handler.open({
            name: 'Dzinn',
            description: "Please provide your payment details for an advance payment to Dzinn. Enter a random zipcode if you don't have one",
            zipCode: false,
            currency: 'eur',
            amount: parseInt(x.cost)*100
          });


       
    }

    if(userId==postedBy)
    {
        $scope.blockMessaging=true;
    }
    if(userId!='No')
    {
        $scope.allowMessaging=true;
    }
    $scope.sendMessage=function()
    {
        if($scope.description==undefined||$scope.description.trim()=='')
        {
            $rootScope.showBottomBar('Please, fill the description!');
        }
        else
        if($scope.cost==null||$scope.cost==undefined)
        {
            $rootScope.showBottomBar("Please, fill the cost!");
        }
        else
        if($scope.cost<0)
        {
            $scope.showBottomBar("Cost cannot be less than zero!");
            return;
        }
        else
        {
            $scope.sending=true;
            $http
            .get('/taskApis/addMessage/'+taskId+'/'+userId+'/'+$scope.description+'/'+$scope.cost+'/'+$scope.postedBy+'/'+$scope.userName,{headers:{authenticate:getAuth()}})
            .then(function(response){
                $scope.sending=false;
                if(response.data.result=='1')
                {
                    $http
                    .get('/taskApis/getTasksDetails/'+taskId,{headers:{authenticate:getAuth()}})
                    .then(function(response){
                        $('#confirmModal').modal('show');
                        $scope.data=response.data.messages;
                        for(var i=0;i<$scope.data.length;i++)
                        {
                            $scope.data[i].cost=parseInt($scope.data[i].cost);
                        }
                        if($scope.userId!=$scope.postedBy)
                        if($scope.bidType=='closed')
                        {
                            var temp=[];
                            for(var i=0;i<$scope.data.length;i++)
                            {
                                if($scope.data[i].messageBy==$scope.userId)
                                {
                                    temp.push($scope.data[i]);
                                }
                            }
                            $scope.data=temp;
                        }
                        $scope.showMessagingBox=$scope.showMessagingBoxCheck();
                        
                  
                    });
                
                }
                else
                {
                    $('#earnModal').modal('show');
                }
            });
        }


    }
    $scope.showMessagingBoxCheck=function()
    {
        for(var i=0;i<$scope.data.length;i++)
        {
            if($scope.data[i].messageBy==userId)
            {
                return false;
            }
        }
        return true;
    }
    if(!$scope.blockMessaging&&!$scope.allowMessaging&&$scope.showMessagingBox)
    {
            $scope.showSignUpBox();
    }
});
function setAutoComplete()
{
  var autocomplete = new google.maps.places.Autocomplete(document.getElementById('placeSearch'));
}
