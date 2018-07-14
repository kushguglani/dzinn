function getAuth(){

var auth = '110ec58a-b123-4ac4-7171-c87q4we3b8d1';
return auth;
}
var _URL = window.URL || window.webkitURL;
app.controller('post-administration-controller',($scope,$rootScope,$http)=>{
    $scope.tasks=[];
    $scope.usersDetails=[];
    $scope.search="";
    $http
    .post('/searchTasks/all/all',{authenticate:getAuth()})
    .then((response)=>{
        let temp=[];
        for(let i=0;i<response.data.length;i++)
        {
            if(!response.data[i].complete)
                temp.push(response.data[i]);
        }
       $scope.tasks=temp;
    });
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
    $scope.deleteTask=(_id)=>
    {
        if(window.confirm('Are you sure, you want to delete this task?'))
        {
            $http
            .post('/deleteTask',{
                _id:_id,
                authenticate:getAuth()
            })
            .then((response)=>{

                var temp=[];
                for(var i=0;i<$scope.tasks.length;i++)
                {
                    if($scope.tasks[i]._id==_id)
                    continue;
                    temp.push($scope.tasks[i]);
                }
                $scope.tasks=temp;
            });
       
        }
    }
});
$(window).ready(()=>{
    
$(".category-image").change(function (e) {
    var file, img;
    let input=this;
    if ((file = this.files[0])) {
        if(this.files[0].size/(1024*1024)>5)
        {
            $(input).val('');
            alert("Max file size 5 mb");
        }
        img = new Image();
        img.onload = function () {
            if(this.width!=335||this.height!=366)
            {
            $(input).val('');
            alert("Dimensions required are 335*366 (Width*Height)");
            }
        };
        img.src = _URL.createObjectURL(file);
    }
});
 
$(".image").change(function (e) {
    var file, img;
    let input=this;
    if ((file = this.files[0])) {
        if(this.files[0].size/(1024*1024)>5)
        {
            $(input).val('');
            alert("Max file size 5 mb");
        }
        img = new Image();
        img.onload = function () {
            if(this.height!=390)
            {
            $(input).val('');
            alert("Height required is 390px");
            }
        };
        img.src = _URL.createObjectURL(file);
    }
});
$(".icon").change(function (e) {
    var file, img;
    let input=this;
    if ((file = this.files[0])) {
        if(this.files[0].size/(1024*1024)>5)
        {
            $(input).val('');
            alert("Max file size 5 mb");
        }
        img = new Image();
        img.onload = function () {
            if(this.width!=128||this.height!=128)
            {
            $(input).val('');
            alert("Dimensions required are 128*128 (Width*Height)");
            }
        };
        img.src = _URL.createObjectURL(file);
    }
});


})