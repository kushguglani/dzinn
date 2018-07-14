function getAuth(){

var auth = '110ec58a-b123-4ac4-7171-c87q4we3b8d1';
return auth;
}
app.controller('editSubCatergoryController',($scope,$rootScope,$http)=>{
    $scope.categories=[];    $scope.getCategories=()=>
    {
        
  $http.get('/existingCategories',{headers:{authenticate:getAuth()}})
        .then((response)=>{
            $scope.categories=response.data;
        });
       
    }
    $scope.deleteSubCategory=(_id,name)=>
    {
        if(window.confirm("Are you sure?"))
       $http
       .post('/deleteSubCategory',{
           _id:_id,
           name:name,
        authenticate:getAuth()
       })
       .then((response)=>{
            $scope.getCategories();
       });
    }
    $scope.getCategories();
});