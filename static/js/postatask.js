function getAuth(){

var auth = '110ec58a-b123-4ac4-7171-c87q4we3b8d1';
return auth;
}
app.controller('postATaskController',function($scope,$http,$timeout,$rootScope){

  $scope.title="";
  $scope.description="";
  $scope.tags="";
  $scope.place=""
  $scope.bidType="";
  $scope.taskType="online";
  $scope.categories=[];
  $scope.adding=false;
  $scope.dbTags=[];
  $scope.cost=null;
  $scope.selectedTags=[];
  $scope.tagOverlayStyle={
    "border":"none"
  }
  $scope.removeSelectedTag=function(tagName)
  {
    var temp=[];
    for(var i=0;i<$scope.selectedTags.length;i++)
    {
      if(tagName!=$scope.selectedTags[i])
      {
        temp.push($scope.selectedTags[i]);
      }
    }
    $scope.selectedTags=temp;
  }
  $scope.addSelectedTag=function(temp)
  {
    temp=(temp.indexOf('#')!='0')?('#'+temp):(temp);
    var flag=false;  
    for(var i=0;i<$scope.selectedTags.length;i++)
      {
        if(temp.toLowerCase()==$scope.selectedTags[i].toLowerCase())
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
        $scope.selectedTags.push(temp);
      }

      $scope.dbTags=[];
      
      $scope.tagOverlayStyle={
        "border":"none"
      };
      $scope.tags="";
 
  }
  $scope.tagMagic=function(event)
  {
    if($scope.tags.trim().replace('#','')!=""){
    if(event.keyCode=='13')
    {
      //Pressed Enter
      var temp=$scope.tags.trim().replace(/ /g,'');
      $scope.addSelectedTag(temp);
    }
    else
    {
      $http
      .get('/postataskapis/getTags?tagName='+$scope.tags.trim().replace('#',''))
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
  $scope.addATask=function()
  {
  $scope.place=angular.element(document.getElementById('placeSearch')).val();
    if($scope.title.trim()=="")
    {
      $rootScope.showBottomBar("Please, fill in all the details!");
      return;

    }
    else
    if($scope.description.trim()=="")
    {
      $rootScope.showBottomBar("Please, fill in all the details!");
      return;

    }
    else
    if($scope.cost!=null&&$scope.cost<=0)
    {
      $rootScope.showBottomBar("Cost cannot be less than or equal to zero!");
      return;
    }
    else
    if($scope.date==null)
    {
      $rootScope.showBottomBar("Please, fill in all the details!");
      return;

    }
    else
    if(GetFormattedDate($scope.date)!=GetFormattedDate(new Date())&&$scope.date.getTime()<new Date().getTime())
    {
      $rootScope.showBottomBar("Due Date cannot be of past");
      return;

    }
    else
    if($scope.taskType=='online')
    {
     if($scope.bidType=='')
     {
      $rootScope.showBottomBar("Select the bid type please!");
     }
     else
     {
       var cost=angular.copy($scope.cost);
       if($scope.cost==null)
       cost='N/A';
        $scope.adding=true;
        $http
        .post('/postataskapis/addTask',{
          postedBy:postedBy,
          title:$scope.title.trim(),
          taskType:'online',
          Description:$scope.description.trim(),
          Cost:cost,
          dueDate:GetFormattedDate($scope.date),
          category:$scope.category.name,
          subcategory:$scope.subcategory.name,
          tags:$scope.selectedTags,
          bidType:$scope.bidType
      
        })
        .then(function(response){
          $scope.adding=false;
          if(response.data.result=='no')
            {
              $rootScope.showBottomBar('Some Error Occurred! Please try again.');
              
            }
            else
            {
              $rootScope.showBottomBar('Task posted successfully!');
              window.location.href="/task/"+response.data._id;
              $scope.title="";
              $scope.description="";
              $scope.tags="";
              $scope.place=""
              $scope.bidType="";
              $scope.taskType="online";
              $scope.adding=false;
              $scope.dbTags=[];
              $scope.selectedTags=[];
              $scope.date=null;
              $scope.cost=null; 
            }

        },function(){
          console.log("Some Error occurred!");
        });
      }
    }
    else
    if($scope.taskType=='offline')
    {
      if($scope.place.trim()=="")
      {
        $rootScope.showBottomBar('Please, enter the task address!');
        return;
      }
      var cost=angular.copy($scope.cost);
      if($scope.cost==null)
      cost='N/A';
      $scope.adding=true;
      $http
      .post('/postataskapis/addTask',{
        postedBy:postedBy,
        title:$scope.title.trim(),
        taskType:'offline',
        Description:$scope.description.trim(),
        Cost:cost,
        dueDate:GetFormattedDate($scope.date),
        category:$scope.category.name,
        subcategory:$scope.subcategory.name,
        tags:$scope.selectedTags,
        bidType:$scope.bidType,
        taskAddress:$scope.place
      })
      .then(function(response){
        $scope.adding=false;
        if(response.data.result=='no')
          {
            $rootScope.showBottomBar('Some Error Occurred! Please try again.');
            
          }
          else
          {
            $rootScope.showBottomBar('Task posted successfully!');
            window.location.href="/task/"+response.data._id;
            $scope.title="";
            $scope.description="";
            $scope.tags="";
            $scope.place=""
            $scope.bidType="";
            $scope.taskType="online";
            $scope.adding=false;
            $scope.dbTags=[];
            $scope.selectedTags=[];
            $scope.date="";
            $scope.cost=null; 
          }

      },function(){
        console.log("Some Error occurred!");
      });
    }



  }
  $scope.setTaskOffLine=function()
  {
    $scope.taskType="offline";
    $timeout(setAutoComplete,50);
  }
  $scope.changeSubCategory=function()
  {
    $scope.subcategory=$scope.category.subcategories[0];

  }
  $http.get('/existingCategories',{headers:{authenticate:getAuth()}})
  .then(function(response){
    $scope.categories=response.data;
    $scope.category=$scope.categories[0];
    $scope.subcategory=$scope.category.subcategories[0];
  },function(){

  });

});
function setAutoComplete()
{
  var autocomplete = new google.maps.places.Autocomplete(document.getElementById('placeSearch'));
}

$(document).ready(function(){
  $('[data-toggle="tooltip"]').tooltip();   
});