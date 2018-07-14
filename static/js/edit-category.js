function getAuth(){

var auth = '110ec58a-b123-4ac4-7171-c87q4we3b8d1';
return auth;
}
app.controller('editCatergoryController',($scope,$rootScope,$http)=>
{
    $scope.categories=[];
    $scope.getCategories=()=>
    {
       
  $http.get('/existingCategories',{headers:{authenticate:getAuth()}})
        .then((response)=>{
            $scope.categories=response.data;
        });
       
    }
    $scope.deleteCategory=(_id)=>
    {
        if(window.confirm("Are you sure?"))
       $http
       .post('/deleteCategory',{
           _id:_id,
        authenticate:getAuth()
       })
       .then((response)=>{
            $scope.getCategories();
       });
    }
    $scope.getCategories();
});