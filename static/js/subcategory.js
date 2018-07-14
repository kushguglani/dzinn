function getAuth(){

var auth = '110ec58a-b123-4ac4-7171-c87q4we3b8d1';
return auth;
}
var lat=null;
var lon=null;
app.controller('displayTasksController',function($scope,$rootScope,$http,$timeout,$window){
    $scope.tasks=[];
    $scope.originalTasks=[];
    $scope.taskType='Online';
    $scope.filterStyle={
        "border":"none",
        "height":"0px",
        "padding":"0px"
    };
    $scope.redirect=function(x)
    {
        $window.location.href='/task/'+x._id;
    }
    $scope.show=true;
    $scope.taskDistance=10;
    $scope.taskCost=1000;
    $scope.applyFilter=function()
    {
        $scope.show=false;
        $scope.locationError="";
        $scope.filterStyle={
            "border":"none",
            "height":"0px",
            "padding":"0px"
        };
        if($scope.taskType=='Offline')
        {
            if(lat==null||lon==null)
            {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        lat=position.coords.latitude; 
                        lon=position.coords.longitude;
                    calculateEverything();  
                    },function(error){
                        $scope.tasks=[];
                        for(var i=0;i<$scope.originalTasks.length;i++)
                        {
                            if($scope.originalTasks[i].taskType=='offline'&&($scope.originalTasks[i].Cost==='N/A'||$scope.originalTasks[i].Cost>=$scope.taskCost))
                            {
                                $scope.tasks.push($scope.originalTasks[i]);
                            }
                        }
                        $scope.locationError="Location filter cannot be applied as we couldn't detect your location";
                        $scope.showFilter();
                        $scope.show=true;
                        
                    });
                
                    $timeout(function(){
                    },4000);
                
                }
                else{
                    
                    $scope.tasks=[];
                    for(var i=0;i<$scope.originalTasks.length;i++)
                    {
                        if($scope.originalTasks[i].taskType=='offline'&&($scope.originalTasks[i].Cost==='N/A'||$scope.originalTasks[i].Cost>=$scope.taskCost))
                        {
                            $scope.tasks.push($scope.originalTasks[i]);
                        }
                    }
                    $scope.locationError="Location filter cannot be applied as we couldn't detect your location";
                    
                    $scope.show=true;
                    
                    $scope.showFilter();
                }
                
           
            }
            else
            {
                calculateEverything();
            }
        }
        else
        {
            $scope.tasks=[];
            for(var i=0;i<$scope.originalTasks.length;i++)
            {
                if($scope.originalTasks[i].taskType=='online'&&($scope.originalTasks[i].Cost==='N/A'||$scope.originalTasks[i].Cost>=$scope.taskCost))
                {
                    $scope.tasks.push($scope.originalTasks[i]);
                }
            }
            $scope.show=true;
        }

    }
    function calculateEverything()
    {
        var i; 
        var tempIs=[];
        var count=0;
    for(i=0;i<$scope.tasks.length;i++)
     {
         if($scope.tasks[i].taskAddress!=undefined)
         {
             count++;
             tempIs.push(i);
             $http
             .get('https://maps.googleapis.com/maps/api/geocode/json?address='+$scope.tasks[i].taskAddress+'&key=AIzaSyAaPcCIb_JIRvrEEPCRJ6Sra55YY9gW1Pk')
             .then(function(response){
                
                var tempLat=Number(response.data.results[0].geometry.location.lat);
                var tempLon=Number(response.data.results[0].geometry.location.lng);
                var tempI=tempIs.shift();
                $scope.tasks[tempI].distance=Math.round(getDistance(tempLat,tempLon,lat,lon));
                if(tempIs.length==0)
                {
                   
                    $scope.tasks=[];
                    for(var i=0;i<$scope.originalTasks.length;i++)
                    {
                        if($scope.originalTasks[i].taskType=='offline'&&($scope.originalTasks[i].Cost==='N/A'||$scope.originalTasks[i].Cost>=$scope.taskCost)&&$scope.originalTasks[i].distance>=$scope.taskDistance)
                        {
                            $scope.tasks.push($scope.originalTasks[i]);
                        }
                    }
                  
                    $scope.show=true;
                }
             });
         }
     }
     if(count==0)
     {
        $scope.tasks=[];
        for(var i=0;i<$scope.originalTasks.length;i++)
        {
            if($scope.originalTasks[i].taskType=='offline'&&($scope.originalTasks[i].Cost==='N/A'||$scope.originalTasks[i].Cost>=$scope.taskCost))
            {
                $scope.tasks.push($scope.originalTasks[i]);
            }
        }
        $scope.show=true;
        
     }
   
    }
    $scope.showFilter=function()
    {
        $scope.filterStyle={
            "border":"0.5px solid grey;",
            "height":"auto",
            "padding":"20px"
        }
    }
    $scope.hideFilter=function()
    {
        $scope.filterStyle={
            "border":"none",
            "height":"0px",
            "padding":"0px"
        };
    }
    $http
    .get('/getTasks/'+category+'/'+subcategory,{headers:{authenticate:getAuth()}})
    .then(function(response){
        let temp=[];
        for(let i=0;i<response.data.length;i++)
        if(response.data[i].assignedTo)
        continue;
        else
        temp.push(response.data[i]);
        $scope.tasks=temp;
        $scope.originalTasks=temp;
    });

});

function getDistance(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }
  
  function deg2rad(deg) {
    return deg * (Math.PI/180)
  }