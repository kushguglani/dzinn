function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
function GetFormattedDate(x) {
  var todayTime = new Date(x);
  var month = todayTime.getMonth() + 1;
  var day = todayTime.getDate();
  var year = todayTime.getFullYear();
  return day + "-" + month + "-" + year;
}
function getAuth(){

var auth = '110ec58a-b123-4ac4-7171-c87q4we3b8d1';
return auth;
}
var app=angular.module('app',[]);

app.controller('signUpInController',function($scope,$http,$rootScope){

  $scope.mainBox=true;

  $scope.forgotPassword={
    value:"",
    valid:false
  };
  $scope.checkForgotPassword=function(){
      if($scope.forgotPassword.value.trim()!=""&&validateEmail($scope.forgotPassword.value.trim()))
      {
        $scope.forgotPassword.valid=true;
      }
      else
      {
        $scope.forgotPassword.valid=false;
      }
  };
  $scope.forgotPassword=()=>
  {
    if($scope.forgotPassword.valid)
    {
      $http
      .post('/forgotPassword',{
        email:$scope.forgotPassword.value.trim(),authenticate:getAuth()
      })
      .then((response)=>{
        if(response.data.result)
        {
          $rootScope.showBottomBar("A reset password email has been sent to the email!");
        }
        else
        {
          $rootScope.showBottomBar("This email is not registered!");
        }
      })
    }
  }
  $scope.closeForgotPassword=()=>
  {
    $scope.mainBox=true;
  }
  $scope.forgetPassword=function()
  {
    $scope.mainBox=false;
  };
});
app.controller('signInController',function($scope,$rootScope,$http){
  $scope.email={'value':'','valid':false};
  $scope.password={'value':'','valid':false};
  $scope.loggingIn=false;
 
  $scope.signIn=function()
  {
    if($scope.email.valid&&$scope.password.valid)
    {
       $scope.loggingIn=true;
       $http
       .post('/logInUser',{email:$scope.email.value,password:$scope.password.value,authenticate:getAuth()})
       .then(function(response){
         if(response.data.result=="1")
         {
           $('.loader-cover').css('display','block');
           window.location.reload();
           console.log(response.data);
           $rootScope.UUID = response.data.UUID;
         }
         else
         {
           $scope.loggingIn=false;
           $rootScope.showBottomBar("Invalid Credentials!");
         }

       },function(response){
         console.log("Some Error occurred");
       });

    }
    else
    {
      $rootScope.showBottomBar("Please, fill in all the details!");
    }
  }
  $scope.checkEmail=function()
  {
    if($scope.email.value.trim()!=""&&validateEmail($scope.email.value.trim()))
    {
      $scope.email.valid=true;
    }
    else
    {
      $scope.email.valid=false;
    }
  }
  $scope.checkPassword=function()
  {
    if($scope.password.value.trim()!=""&&$scope.password.value.trim().length>=5)
    {
      $scope.password.valid=true;
    }
    else
    {
      $scope.password.valid=false;
    }
  }
});
app.run(function($rootScope,$timeout,$http){
  $rootScope.currentTime=new Date().getTime();
  $rootScope.showAllNotifcations=false;
  $rootScope.showAllNotificationFunc=()=>
  {
    $rootScope.showAllNotifcations=true;
    $rootScope.notifications=$rootScope.allNotifications;
  }
  $rootScope.checkVar=(x)=>
  {
    if(x)
    return true;
    return false;
  }
  $rootScope.showEarnModal=function()
  {
    $('#earnModal').modal('show');
  }
  $rootScope.userId=window.userId;
  document.querySelector('body').style.display='block';
  $rootScope.bottomBarContent="";
  $rootScope.redirectUrl=null;
  $rootScope.notificationCount=0;
  $rootScope.notifications=[];
  $rootScope.userName=userName;
  $rootScope.categoriesOverlayVar=false;
  $rootScope.redirectTo=(taskId)=>
  {
    if(taskId)
    window.location.href="/task/"+taskId;
  }
  $rootScope.categoriesOverlaySetter=function(event)
  {
    event.stopPropagation();
   $rootScope.categoriesOverlayVar=true; 
  }
  $rootScope.categoriesOverlayRemover=function()
  {
    $rootScope.categoriesOverlayVar=false;
  }
  $rootScope.formatDate= function(temp)
  {
      var date = new Date(temp);  
      var options = {  
          weekday: "long", year: "numeric", month: "short",  
          day: "numeric"  
      };  
      return date.toLocaleDateString("en-us", options);
  };
  $rootScope.userTopOverlay={
    'display':'none'
  };
  $rootScope.notificationOverlay={
    'display':'none',
    'border':'none'
  };
  $rootScope.showNotificationOverlay=function(event)
  {
    event.stopPropagation();
    if($rootScope.notifications.length)
    $rootScope.notificationOverlay={
      'display':'block',
      'border':'0.5px solid grey'
    };
    else
    {
      $rootScope.notificationOverlay={
        'display':'block'
      };
    }
    $rootScope.userTopOverlay={
      'display':'none'
    };
    setTimeout(()=>{
      $http
      .get('/clearNotifications/'+userId,{headers:{authenticate:getAuth()}})
      .then(function(response){
        
      });
    },5000);
 
  }
  $rootScope.showUserTopOverlay=function(event)
  {
    event.stopPropagation();
    $rootScope.userTopOverlay={
      'display':'block'
    };
    $rootScope.notificationOverlay={
      'display':'none',
      'border':'none'
   
    };
  }
  $rootScope.hideStuff=function(event){
    $rootScope.userTopOverlay={
      'display':'none'
    };

    if(userId!='No'&&$rootScope.notificationOverlay.display=='block')
    {
      $rootScope.notificationOverlay={
        'display':'none'
      };
      //Clear Notifications here!!
      $http
      .get('/clearNotifications/'+userId,{headers:{authenticate:getAuth()}})
      .then(function(response){
        
      });
    }
  }
  
  $rootScope.checkNotifications=()=>
  {
    $http
    .get('/getNotifications/'+userId,{headers:{authenticate:getAuth()}})
    .then(function(response){
      $rootScope.allNotifications=response.data;
      $rootScope.notificationCount=0;
      let temp=[];
      for(var i=0;i<$rootScope.allNotifications.length;i++)
      {
        if(i<4)
        temp.push($rootScope.allNotifications[i]);
        if(!$rootScope.allNotifications[i].read)
        {
          $rootScope.notificationCount++;      
        }
      }
      if($rootScope.showAllNotifcations)
      {
        $rootScope.notifications=$rootScope.allNotifications;
      }
      else
      {
        $rootScope.notifications=temp;
      }
      setTimeout(()=>{
        $rootScope.checkNotifications();
      },3000);
    });
  }
  if(userId!='No')
  {
   $rootScope.checkNotifications();
  }
  $rootScope.showBottomBar=function(text){
    $rootScope.bottomBarContent=text;
    $rootScope.bottomBarStyle={"bottom":"0px"};
    $timeout(function(){
      $rootScope.bottomBarStyle={"bottom":"-300px"};


    },5000);
  }
});
app.controller('signUpController',function($scope,$rootScope,$http){
//  console.log("Executed");
  $scope.signingIn=false;
  $scope.dialCodes=["+1","+91"];
  $http
  .get('/json/country-codes.json')
  .then((response)=>{
    $scope.dialCodes=response.data;
  });
  $scope.dialCode="+353";
  $scope.email={'value':'','valid':false};
  $scope.name={'value':'','valid':false};
  $scope.phoneNumber={'value':'','valid':false};
  $scope.password={'value':'','valid':false};
  $scope.rpassword={'value':'','valid':false};
  $scope.otp=false;
  $scope.otpValue=null;
  $scope.otpCode=null;
  $scope.register=()=>
  {
    if($scope.otpValue===$scope.otpCode) 
    {
      $scope.signingIn=true;
      $scope.otp=false;
      $http
      .post("/registerUser",{name:$scope.name.value.trim(),email:$scope.email.value.trim(),phoneNumber:$scope.dialCode+$scope.phoneNumber.value,password:$scope.password.value.trim(),authenticate:getAuth()})
      .then(function(response){
        $scope.signingIn=false;
        if(response.data.result==="0")
        {

          $rootScope.showBottomBar("This email or number is already registered!");
        }
        else
        {
          $('.loader-cover').css('display','block');
          window.location.reload();
        }

      });
    }
    else
    {
      $rootScope.showBottomBar("Invalid OTP!");
    }
  }
  $scope.resendOTP=()=>
  {
    $http
    .post('/sendOtp',{
          number:$scope.dialCode+$scope.phoneNumber.value,
          authenticate:getAuth(),
          body:"Your DZINN Verification Code is "+$scope.otpCode
    })
    .then((response)=>{

        if(response.data.result)
        {
            $rootScope.showBottomBar("An OTP has been sent to your number. Please check!");
        }
        else
        {
            $rootScope.showBottomBar("Maximum SMS limit in a day limit reached for this number. Try again tomorrow!");
        }


        });
 
  }
  $scope.signIn=function()
  {
    if($scope.email.valid&&$scope.name.valid&&$scope.phoneNumber.valid&&$scope.password.valid)
    {
      $scope.signingIn=true;
      $http
      .post("/registerUserCheck",{name:$scope.name.value.trim(),email:$scope.email.value.trim(),phoneNumber:$scope.dialCode+$scope.phoneNumber.value,password:$scope.password.value.trim(),authenticate:getAuth()})
      .then(function(response){
        $scope.signingIn=false;
        if(!response.data.result)
        {

          $rootScope.showBottomBar("This email or number is already registered!");
        }
        else
        {
               $scope.otpCode=Math.floor(100000 + Math.random() * 900000);            
   
          $http
          .post('/sendOtp',{
                number:$scope.dialCode+$scope.phoneNumber.value,
                authenticate:getAuth(),
                body:"Your DZINN Verification Code is "+$scope.otpCode
          })
          .then((response)=>{

              if(response.data.result)
              {
                  $scope.otp=true;
                  $rootScope.showBottomBar("An OTP has been sent to your number. Please check!");
                  
              }
              else
              {
                  $rootScope.showBottomBar("Maximum SMS limit in a day limit reached for this number. Try again tomorrow!");
              }


              });
       
        
        
        
        }

      });
    }
    else
    if($scope.email.valid&&$scope.name.valid&&$scope.phoneNumber.valid)
    {
      if($scope.password.value==$scope.rpassword.value)
      $rootScope.showBottomBar("Password minimum length 5 characters");
      else
      $rootScope.showBottomBar("The two passwords should match");
    }
    else
    {

      $rootScope.showBottomBar("Please, fill all the details first!");
    }
  }
  $scope.checkName=function()
  {
    if($scope.name.value.trim()!=""&&$scope.name.value.trim().length>=2)
    {
      $scope.name.valid=true;
    }
    else
    {
      $scope.name.valid=false;
    }
  }
  $scope.checkEmail=function()
  {
    if($scope.email.value.trim()!=""&&validateEmail($scope.email.value.trim()))
    {
      $scope.email.valid=true;
    }
    else
    {
      $scope.email.valid=false;
    }
  }
  $scope.checkPhone=function()
  {
    //console.log("Executed");
  //  console.log($scope.phoneNumber.value);
    if($scope.phoneNumber.value!=null&&$scope.phoneNumber.value!="")
    {
      if($scope.dialCode==="+353")
      {
        if($scope.phoneNumber.value>100000000&&$scope.phoneNumber.value<1000000000)
        {
        $scope.phoneNumber.valid=true;
        }
        else
        $scope.phoneNumber.valid=false;
       }
      else
      if($scope.phoneNumber.value>1000000000&&$scope.phoneNumber.value<10000000000)
      $scope.phoneNumber.valid=true;
      else
        $scope.phoneNumber.valid=false;
    }
    else
    {
      $scope.phoneNumber.valid=false;
    }
  }
  $scope.checkPassword=function()
  {
  //  console.log("Executed");
    if($scope.password.value==$scope.rpassword.value)
    {
    if($scope.password.value.trim()!=""&&$scope.password.value.trim().length>=4)
    {
      $scope.password.valid=true;
      $scope.rpassword.valid=true;
    }
    else
    {
      $scope.password.valid=false;
      $scope.rpassword.valid=false;
    }
    }
    else
    {
      $scope.password.valid=false;
      $scope.rpassword.valid=false;
    }
  }
});
app.controller('slider-controller',function($scope,$interval){

    var offset=0;
    $scope.left={
      "left":offset+"%"
    };
    var sliding=$interval(function(){
      doTheSliding();
    },5000);
    var doTheSliding=function(){

            $scope.left={
              "left":offset+"%"
            };
            offset=offset-100;
            if(offset==-300)
            {
              offset=0;
            }
    };
    $scope.specific=function(item){
      $interval.cancel(sliding);
      offset=item;
      doTheSliding();
      sliding=$interval(function(){
        doTheSliding();
      },5000);
    };

});
app.controller('mainController',function($scope){

  $scope.signUpBoxVariable=false;
  $scope.signIn=false;
  $scope.showSignUpBox=function()
  {
    $scope.signUpBoxVariable=true;
    $scope.signIn=true;
    $scope.styleObject={

      "height":"370px"
    };
    document.querySelector('body').style.overflowY="hidden";
  }
  $scope.hideSignUpBox=function()
  {
    $scope.signUpBoxVariable=false;
    document.querySelector('body').style.overflowY="auto";
  }
  $scope.stopProp=function($event)
  {
    $event.stopPropagation();
  }
  $scope.signUpFormShow=function()
  {
    $scope.signIn=false;
    $scope.styleObject={

      "height":"520px"
    };
  }
  $scope.signInFormShow=function()
  {
    $scope.signIn=true;
    $scope.styleObject={

      "height":"370px"
    };
  }

});
app.controller('footerController',function($scope){

  $scope.links=[{link:'About',url:'/about'},{link:'Help',url:'/help'},{link:'Privacy',url:'/privacy'},{link:'FAQs',url:'/faq'}];
});
app.controller('topBarController',function($scope,$http,$rootScope,$timeout){
  $scope.sideBarCover={
    'display':'none'
  };
  $scope.searchOverlayStyle={
    'display':'none'
  };
  $scope.tasks=[];
  $scope.searchTerm='';
  $scope.redirect=function(id)
  {
    window.location.href="/task/"+id;
  }
  $scope.search=function(event)
  {
    if($scope.searchTerm.replace('#','').trim()!='')
    {
    if(event.keyCode=='13'&&$scope.searchTerm.trim()!='')
    {
      window.location.href='/search/'+$scope.searchCategory+'/'+$scope.searchTerm.replace('#','');
    }
    else
    if($scope.searchTerm.trim()=='')
    {
      $scope.searchOverlayStyle={
        'display':'none'
      };
    }
    else
    {
      $http
      .post('/searchTasks/'+$scope.searchCategory+'/'+$scope.searchTerm.replace('#',''),{authenticate:getAuth()})
      .then(function(response){
          $scope.tasks=response.data;
          if(!response.data.length)
           {
            $scope.searchOverlayStyle={
              'display':'none'
            };
         
           }
           else
           {
      $scope.searchOverlayStyle={
        'display':'block'
      };
    }
      });
 
    }
  }
  else
  {
    $scope.searchOverlayStyle={
      'display':'none'
    };
  }
  }
  $scope.hideSideBar=function()
  {
    $scope.sideBarStyle={
      'width':'0px',
      'padding':'0px'
    };
    $timeout(function(){
      $scope.sideBarCover={
        'display':'none'
      };
    },600);
  }
  $scope.sideBarClick=function(event)
  {
    event.stopPropagation();
  }
  $scope.showSideBar=function(){
    $scope.sideBarCover={
      'display':'block'
    };
    $timeout(function(){
      $scope.sideBarStyle={
        'width':'300px',
        'padding':'10px'
      };
    },200);
  };
  $scope.categoriesOverlay={
    'display':'none'
  };
  $scope.showcategoriesOverlay=function()
  {
    $scope.categoriesOverlay={
      'display':'block'
    };
    
  }
  $scope.hidecategoriesOverlay=function(x,event)
  {
    event.stopPropagation();
    $scope.categoriesOverlay={
      'display':'none'
    };
    
    if(x!=null)
    $scope.searchCategory=x;
  }
  $scope.display=function(x)
  {
    return x.slice(0,$scope.categories[0].length);
  }
  $scope.categories=['Categories'];
  $scope.searchCategory=$scope.categories[0];
  $http.get('/existingCategories',{headers:{authenticate:getAuth()}})
    .then(function(response){
      for(var i=0;i<response.data.length;i++)
      {
        $scope.categories.push(response.data[i].name);

      }

    });
  $scope.searchCategory=$scope.categories[0];
 
});
app.controller('showboardcontroller',function($scope,$http,$window,$rootScope){
  $scope.categories=[];
  $scope.originalCategories=[];
  $http.get('/existingCategories',{headers:{authenticate:getAuth()}})
    .then(function(response){
      for(var i=0;i<response.data.length;i++)
      {
        if(response.data[i].onWall)
        $scope.originalCategories.push(response.data[i].name);

      }
      for(var i=0;i<$scope.originalCategories.length&&i<8;i++)
      {
        $scope.categories.push($scope.originalCategories[i]);
      }
    });
    $scope.equate=function()
    {
      $scope.categories=$scope.originalCategories
    }
    $scope.changePage=function(page)
    {
      $window.location.href='/'+page;
    };
});
