var express=require('express');
var app=express();
var bodyParser=require('body-parser');
var mongo=require('mongodb');
var ObjectId=mongo.ObjectID;
var mongoClient=mongo.MongoClient;
var url="mongodb://localhost:27017/dzinn";
var con=null;
var fs = require('fs');
global.fileUpload = require('express-fileupload');
var md5=require('md5');
var session=require('express-session');
var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
var client = new auth.OAuth2('1084503627756-cfh58c39e0becqomp0tulrdpq46ngj6t.apps.googleusercontent.com', '', '');

var authentication = '110ec58a-b123-4ac4-7171-c87q4we3b8d1';
app.use(fileUpload());
app.use(session({secret:"My name is Kaushal Ramesh Jain",
resave: false,
saveUninitialized: true
}));
app.use(require('cors')());
var api_key = 'key-0d323849712faed8c4bbb3b88154d90f';
var domain = 'dzinnapp.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var stripe = require("stripe")("sk_test_HcUsQ2rVfLRNUFduDJESZSnz");

var token_id = "6c5qw8e7-9a43-440c-7a7a-700d0f36cb79";
const uuidv4 = require('uuid/v4');
mongoClient.connect(url,function(err,db){
  if(!err)
  {
    console.log("Connected to the database!");
    con=db;
  }
  else
  {
    console.log("Error connecting to the database!");

  }


});
function insertNotification(title,date,notFor,notBy,message,taskId)
{
      con.collection('notifications').insertOne({title:title,for:notFor,by:notBy,date:date,message:message,taskId:taskId,read:false},function(err,response){

        con.collection('users').findOne({_id:ObjectId(notFor)},(err,result)=>{
          
                if(result.deviceId)
                {
                  sendNotifications(result.deviceId,title,message,notFor,notBy,taskId);
                }
                  
                });
          

      });
}
function clearNotifications(notFor)
{
  con.collection('notifications').updateMany({for:notFor},{$set:{read:true}},function(err,response){

  });
}
function sendNotifications(token,title,body,notFor,by,taskId)
{
  var FCM = require('fcm-node');
  var serverKey = 'AAAA_IF0F-w:APA91bHgdxmr0tyoNeSfvGexqXFr1Jntdj1K-oFHB2UBzVCWMzJcHQHtDTrbV3R8-ndXVEHznXggDF3WsBdoHki6s7MbonZkgQR86h9_HomQVVZBuV0xVkAMhRBfp9NUlyniRD_YCHpR'; //put your server key here
  var fcm = new FCM(serverKey);

  var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: token,  
      notification: {
          title: title, 
          body: body 
      },
      data: { 
            for:notFor,
            by:by,
            taskId:taskId,
            title: title, 
            body: body,
            badge:1,
            "content-available":1
      }
  };

          console.log("kush1: ", message);
  
  fcm.send(message, function(err, response){
      if (err) {
          //console.log("Something has gone wrong!",err);
      } else {
          console.log("Successfully sent with response: ", response);
      }
  });
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('static'));
app.set('view engine','ejs');
app.use(function(request,response,next){
  if(request.session.user)
  {
    var userId=request.session.user._id;
    con.collection('users').find({_id:ObjectId(userId)}).toArray(function(err,result){
        request.session.user=result[0];
        next();
      });   
  }
  else
  next();
});


app.post('/sendOtp',(request,response)=>{
	//console.log(request.body.authenticate);
	//console.log(request.body.authenticate);
	//console.log("authenticated");
	{
	  con.collection('sms').find({
	    $and:[
	    {
	      number:request.body.number
	    },
	    {
	      date:new Date().toLocaleDateString()
	    }
	    ]
	  }).toArray((err,result)=>{

	      if(result.length<5)
	      {
	        var accountSid = 'ACdd449905a441fcbf3e4eaa8f650165b6'; 
	        var authToken = '0b1eed422478b2525f2c9e9157c3a2c2'; 
	        var client = require('twilio')(accountSid, authToken); 
	        client.messages.create({ 
	            to: request.body.number, 
	            from: "+353861802938", 
	            body: request.body.body, 
	        }, function(err, message) {
	        });
	        con.collection('sms').insertOne({
	            number:request.body.number,
	            date:new Date().toLocaleDateString()
	          
	        },(err,result)=>{
	          response.json({result:true});
	        });
	      
	      }
	      else
	      {

	          response.json({result:false,message:"Daily Limit reached"});


	      }


	  });
	 
	}

});



app.post('/forgotPassword',(request,response)=>{

	if(authentication == request.body.authenticate) {
		//console.log(" authenticate");
	    con.collection("users").find({
	      $and:[
	        {
	          email:new RegExp(["^", request.body.email.trim(), "$"].join(""), "i")
	        }
	      ]}).toArray((err,result)=>{

	        if(result.length)
	        {
	                 
	            var data = {
	              from: 'dzinn <no-reply@dzinnapp.com>',
	              to: request.body.email,
	              subject: 'Reset your password',
	              html:`
	                Dear ${result[0].name},
	                <br/>
	                <br/>
	                Click on the link below to reset your password:
	                <br/>
	                <a href="http://dzinnapp.com/reset-password/${result[0]._id}" target="_blank">http://dzinnapp.com/reset-password/${result[0]._id}</a>
	                <br/>
	                <br/>
	                <br/>

	                Regards,<br/>
	                Team Dzinn
	              
	              `
	            };
	            
	            mailgun.messages().send(data, function (error, body) {
	              response.json({result:true,message:"Email sent"});
	            });
	        
	          }
	        else
	        {
	          response.json({result:false,message:"Email not found"});
	        }

	    });
	 
	} else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 218 authenticate");
	}

});
app.get('/',function(request,response){
  //insertNotification('Final Test',new Date(),'59bbddcae23c981ff847424e',"59bbe45ce23c981ff8474250",'Another Testing over here');
  if(request.session.user)
  {
    response.render('pages/dashboard',{data:request.session.user,highLightPostATask:false});
  }
  else
  response.render('pages/index',{data:request.session.user,highLightPostATask:false});

});

app.get('/getAllUser',function(request,response){
  

if(authentication == request.headers.authenticate) {

  {
  con.collection('users').find({}).toArray(function(err,res){
  
      response.json(res);

  });
  }

} else{
    response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 249 authenticate");
  }

});

app.get('/visualstudio5json',function(request,response){
  

if(token_id == request.headers.token) {

  {
      response.json(authentication);
  }

} else{
    response.json({result:"invalid token key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 249 authenticate");
  }

});

app.post('/contact-admin',(request,response)=>{

  //Get user details here

if(authentication == request.body.authenticate) {
	//console.log(request.body.authenticate);
	//console.log("authenticated");

  con.collection("users").find({
    _id:ObjectId(request.body.userId)
  }).toArray((err,result)=>{

    var data = {
      from: 'dzinn <no-reply@dzinnapp.com>',
      to: "dzinnapp@gmail.com",
      subject: 'User contacted you',
      html:`
        Hi,
        <br/>
        <br/>
        ${result[0].name} has sent you a message:
        <br/>
        <br/>
        <i>"${request.body.message}"</i>
        <br/>
        <br/>
        User name:${result[0].name}
        <br/>
        User Email:${result[0].email}
        <br/>
        User Contat:${result[0].contact}
        <br/>
        <br/>
        <br/>
        Task:<a href="http://dzinnapp.com/task/${request.body._id}" target="_blank">http://dzinnapp.com/task/${request.body._id}</a>
        <br/>

        Regards,<br/>
        Team Dzinn
      
      `
    };
    
    mailgun.messages().send(data, function (error, body) {
      //console.log(error,body);
      response.json({result:true,message:"Email sent"});
    });



  });
} else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 308 authenticate");
	}

});
app.get('/inbox',(request,response)=>{
  if(request.session.user)
  {
    response.render('pages/inbox',{data:request.session.user,highLightPostATask:false});
  }
  else
  response.redirect('/');
 
});
app.get('/yourbids',(request,response)=>{
  if(request.session.user)
  {
    response.render('pages/yourbids',{data:request.session.user,highLightPostATask:false});
  }
  else
  response.redirect('/');

});
app.get('/reset-password/:_id',(request,response)=>{
		//console.log("authenticated");
  response.render('pages/reset-password',{
    _id:request.params._id
  });
  
});
app.post('/change-password',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");

    con.collection("users").update({
      _id:ObjectId(request.body._id)
    },{
      $set:
      {
        password:md5(request.body.password)
      }
    },(err,result)=>{
      response.json({result:true});

    });
    } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 355 authenticate");
	}

})
app.get('/jobhistory',(request,response)=>{
  if(request.session.user)
  {
    response.render('pages/jobhistory',{data:request.session.user,highLightPostATask:false});
  }
  else
  response.redirect('/');
 
});
app.get('/profile/:userId',(request,response)=>{
  con.collection('users').find({_id:ObjectId(request.params.userId.trim())}).toArray((err,result)=>{
    response.render('pages/profile',{
      profileData:result[0],
      data:request.session.user,
      highLightPostATask:false
    });

  });
});
app.post('/getTasksPostedByUser',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('task').find(
    {
    postedBy:request.body._id
    }
  ).toArray((err,result)=>{
    response.json(result);
  });
 	  } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 391 authenticate");
	}
});
app.post('/getTasksDoneByUser',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('task').find(
    {
      $and:[
        {
          assignedTo:ObjectId(request.body._id)
          
        },
        {
          complete:true
        }
      ]
    }
  ).toArray((err,result)=>{
    response.json(result);
  });
  } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 415 authenticate");
	}
});
app.get('/connectwithadmin',(request,response)=>{
		//console.log("authenticated");
  if(request.session.user)
  {
    response.render('pages/connectwithadmin',{data:request.session.user,highLightPostATask:false});
  }
  else
  response.redirect('/');
 
});
app.post('/getTasksAssociatedToUser',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");

  con.collection('task').find(
    {
      $or:
      [
        {
          postedBy:request.body._id
        },
        {
          assignedTo:ObjectId(request.body._id)
        }
      ]
    }
  ).toArray((err,result)=>{
    response.json(result);
  });
  } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 450 authenticate");
	}
});
app.post('/getTasksBiddedByUser',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  
    con.collection('task').find(
      {
        $and:
        [
          {
            messages:{
              
                        $elemMatch:{
                          messageBy:request.body._id
                        }
              
                      }
          },
          {
            complete:{$ne:true}
          }
        ]
      }
    ).toArray((err,result)=>{
      response.json(result);
    });
   } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 481 authenticate");
	}
  });
  
app.post('/addCategory',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  //First check whether the category is present already
  con.collection('categories').find({name:new RegExp(["^", request.body.name.trim(), "$"].join(""), "i")}).toArray((err,result)=>{

    if(result.length)
    {
      request.session.already=true;
      response.redirect('/admin');
    }
    else
    {
      request.session.action=true;
      con.collection('categories').insertOne({

          name:request.body.name.trim(),
          description:request.body.description.trim(),
          subcategories:[],
          onWall:request.body.onWall.trim().toLowerCase()=='true'

      },(err,result)=>{
        fs.unlink('./static/images/categories/'+request.body.name.trim()+'.png',(err,result)=>{});
        fs.unlink('./static/images/categories/'+request.body.name.trim()+'-icon.png',(err,result)=>{});
        fs.unlink('./static/images/categories/'+request.body.name.trim()+'-banner.png',(err,result)=>{});
        request.files.image.mv('./static/images/categories/'+request.body.name.trim()+'.png', function(err) {
          });
        request.files.icon.mv('./static/images/categories/'+request.body.name.trim()+'-icon.png', function(err) {
          });
          request.files.banner.mv('./static/images/categories/'+request.body.name.trim()+'-banner.png', function(err) {
          });
          response.redirect('/admin');
      });
    }
      

  });
    } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 525 authenticate");
	}
});
app.post('/editCategory/:_id',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
    con.collection('categories').findOne({
        $and:[
            {
              _id:{$ne:ObjectId(request.params._id)}
            },
            {
              name:new RegExp(["^", request.body.name.trim(), "$"].join(""), "i")
            }
        ]
       },(err,result)=>{


          if(result)
          {
            request.session.already=true;
            response.redirect('/edit-category');
          }
          else
          {
            con.collection('categories').findOne({
              _id:ObjectId(request.params._id)
              
            },(err,result)=>{
              var categoryName=result.name;
                
            con.collection('categories').updateOne({
              _id:ObjectId(request.params._id)
            },{
              $set:{
                name:request.body.name.trim(),
                description:request.body.description.trim(),
                onWall:request.body.onWall.trim().toLowerCase()=='true'
              }
         
            },(err,result)=>{
              var dir = './static/images/categories/'+categoryName;
              var newName='./static/images/categories/'+request.body.name.trim();
              if (fs.existsSync(dir)){
                fs.rename(dir,newName, function (err) {
               
                });
             
              }
              fs.unlink('./static/images/categories/'+request.body.name.trim()+'.png',(err,result)=>{});
              fs.unlink('./static/images/categories/'+request.body.name.trim()+'-icon.png',(err,result)=>{});
              fs.unlink('./static/images/categories/'+request.body.name.trim()+'-banner.png',(err,result)=>{});
              request.files.image.mv('./static/images/categories/'+request.body.name.trim()+'.png', function(err) {
                });
              request.files.icon.mv('./static/images/categories/'+request.body.name.trim()+'-icon.png', function(err) {
                });
                request.files.banner.mv('./static/images/categories/'+request.body.name.trim()+'-banner.png', function(err) {
                });
                response.redirect('/edit-category');
            });

            });
          }


       });  
      } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 594 authenticate");
	}
});
app.post('/editSubCategory/:subcategory/:category',(request,response)=>{
  //First check whether the category is present already
  if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('categories').find({
    $and:[
      {
        _id:ObjectId(request.body.category)
      },
      {
        subcategories:{

          $elemMatch:{
            name:new RegExp(["^", request.body.subcategory.trim(), "$"].join(""), "i")
          }

        } 
      }
    ]
    }).toArray((err,result)=>{

    
    if(result.length)
    {
      request.session.already=true;
      response.redirect('/edit-sub-category');
    }
    else
    {
              
  con.collection('categories').update({
    _id:ObjectId(request.params.category)
  },{
    $pull:{
      subcategories:{
       name:new RegExp(["^", request.params.subcategory.trim(), "$"].join(""), "i")
       
      }
    }
  },(err,result)=>{
   con.collection('categories').find({
     _id:ObjectId(request.body.category)
     
   }).toArray((err,result)=>{
     var categoryName=result[0].name;
     con.collection('categories').update({
       _id:ObjectId(request.body.category)

     },{
         $addToSet:{
           subcategories:{
             name:request.body.subcategory.trim(),
             description:request.body.description.trim(),
           }
         }
       
     },(err,result)=>{
       var dir = './static/images/categories/'+categoryName;
       
       if (!fs.existsSync(dir)){
           fs.mkdirSync(dir);
       }
       fs.unlink(dir+'/'+request.body.subcategory.trim()+'.png',(err,result)=>{});
       fs.unlink(dir+'/'+request.body.subcategory.trim()+'-banner.png',(err,result)=>{});
       request.files.image.mv(dir+'/'+request.body.subcategory.trim()+'.png', function(err) {
         });
         request.files.banner.mv(dir+'/'+request.body.subcategory.trim()+'-banner.png', function(err) {
         });
         response.redirect('/edit-sub-category');
     });
   }); 




  });
    }
      

  });
      } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 680 authenticate");
	}
});
app.post('/addSubCategory',(request,response)=>{
  //First check whether the category is present already
  if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('categories').find({
    $and:[
      {
        _id:ObjectId(request.body.category)
      },
      {
        subcategories:{

          $elemMatch:{
            name:new RegExp(["^", request.body.subcategory.trim(), "$"].join(""), "i")
          }

        } 
      }
    ]
    }).toArray((err,result)=>{

    
    if(result.length)
    {
      request.session.already=true;
      response.redirect('/add-subcategory');
    }
    else
    {
      con.collection('categories').find({
          _id:ObjectId(request.body.category)
          
        }).toArray((err,result)=>{
          var categoryName=result[0].name;
          con.collection('categories').update({
            _id:ObjectId(request.body.category)
    
          },{
              $addToSet:{
                subcategories:{
                  name:request.body.subcategory.trim(),
                  description:request.body.description.trim(),
                }
              }
            
          },(err,result)=>{
            request.session.action=true;
            var dir = './static/images/categories/'+categoryName;
            
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
            fs.unlink(dir+'/'+request.body.subcategory.trim()+'.png',(err,result)=>{});
            fs.unlink(dir+'/'+request.body.subcategory.trim()+'-banner.png',(err,result)=>{});
            request.files.image.mv(dir+'/'+request.body.subcategory.trim()+'.png', function(err) {
              });
              request.files.banner.mv(dir+'/'+request.body.subcategory.trim()+'-banner.png', function(err) {
              });
              response.redirect('/add-subcategory');
          });
        });          

    }
      

  });
      } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 752 authenticate");
	}
});
app.get('/earn',function(request,response){
		//console.log("authenticated");
  if(request.session.user)
  {
    if(request.session.user.iban)
  response.render('pages/earn',{data:request.session.user,highLightPostATask:false,highLightEarn:true});
    else
    response.redirect('/');
  }
  else
  response.render('pages/earn',{highLightPostATask:false,highLightEarn:true});
});
app.get('/about',function(request,response){
  response.render('pages/about');
});
app.get('/privacy',function(request,response){
  response.render('pages/privacy');
});
app.get('/faq',function(request,response){
  response.render('pages/faq');
});
app.get('/help',function(request,response){
  response.render('pages/help');
});
app.get('/admin',(request,response)=>{
  if(request.session.admin)
  {
  var action=false;
  if(request.session.action)
  {
    action=true;
    request.session.action=false;
  }
    if(request.session.already)
    {
      request.session.already=false;
    response.render('pages/admin',{
      already:true,
      action:action
    });
    }
    else
    response.render('pages/admin',{
      already:false,
      action:action
    });
  }
  else
  {
    if(request.session.invalid)
    {
      request.session.invalid=false;
      response.render('pages/admin-login',{
        invalid:true
      });
    }
    else
    response.render('pages/admin-login',{
      invalid:false
    });
  }    
  
});
app.get('/edit-category',(request,response)=>{
  if(request.session.admin)
  {
    let already=false;
    if(request.session.already)
    {
      already=true;
      request.session.already=false;
    }
    response.render('pages/edit-category',{
      already:already
    });
  }
  else
  {
    response.redirect('/');
  }
    
});
app.get('/edit-sub-category',(request,response)=>{
  if(request.session.admin)
  {
    let already=false;
    if(request.session.already)
    {
      already=true;
      request.session.already=false;
    }
    con.collection('categories').find({}).toArray((err,result)=>{
     
        response.render('pages/edit-sub-category',{
          categories:result,
          already:already
        });
     
    });
  }
  else
  {
    response.redirect('/');
  }
    
});

app.get('/post-administration',(request,response)=>{
		//console.log("authenticated");
  if(request.session.admin)
  {
  response.render('pages/post-administration');
  }
  else
  {
    response.redirect('/');
  }
 
});
app.get('/process-payment',(request,response)=>{
  response.render('pages/process-payment');
})
app.get('/completed-payment',(request,response)=>{
  response.render('pages/completed-payment');
})

app.post('/admin',(request,response)=>{
		//console.log("authenticated");
 // if(request.body.name.trim()=='tushars321@hotmail.com'&&request.body.password.trim()=='S4TechApp')
 if(request.body.name.trim()=='abc'&&request.body.password.trim()=='123')
 {
    request.session.admin=true;
    response.redirect('/admin');
  }
  else
  {
    request.session.invalid=true;
    response.redirect('/admin');
  }
  
})
app.get('/add-subcategory',(request,response)=>{
	// if(authentication == request.body.authenticate) {
	// 	//console.log("authenticated");
  if(request.session.admin)
  {
  con.collection('categories').find({}).toArray((err,result)=>{
    var action=false;
    if(request.session.action)
    {
      action=true;
      request.session.action=false;
    }
      if(request.session.already)
      {
        request.session.already=false;
      response.render('pages/add-subcategory',{
        already:true,
        action:action,
        categories:result
      });
      }
      else
      response.render('pages/add-subcategory',{
        already:false,
        action:action,
        categories:result
      });
   
  });
  }
  else
  {
    response.redirect('/');
  }   
//     } else{
// 		response.json({result:"invalid auth key"});
// //console.log(request.body.authenticate);
//console.log("Web srvice not 921 authenticate");
// 	}  
});
app.post('/deleteCategory',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('categories').remove({_id:ObjectId(request.body._id)},(err,result)=>{
    response.json({result:true});
  });
  } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 933 authenticate");
	}
});
app.post('/deleteSubCategory',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('categories').update({_id:ObjectId(request.body._id)},{$pull:{
    subcategories:{
      name:new RegExp(["^", request.body.name.trim(), "$"].join(""), "i")
    }
  }},(err,result)=>{
    response.json({result:true});
  });
  } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 949 authenticate");
	}
});
app.post('/completeGoogle',function(request,response){
	// if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  var userGoogleId=request.body.userGoogleId;
    client.verifyIdToken(
      userGoogleId,
      '1084503627756-cfh58c39e0becqomp0tulrdpq46ngj6t.apps.googleusercontent.com',
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
      function(e, login) {
        if(e)
        {
          response.json({result:false});
        }
        else
        {
        var payload = login.getPayload();
        var userid = payload['sub'];
        // If request specified a G Suite domain:
        //var domain = payload['hd'];
        con.collection('users').insertOne({name:request.body.userGoogleName,deviceId:(request.body.deviceId?request.body.deviceId:null),emailVerified:true,email:request.body.userGoogleEmail.trim().toLowerCase(),contact:request.body.userGoogleContact,googleId:userid},function(err,result){
          
          insertNotification('Information',new Date(),result.insertedId.toString(),'Dzinn',"Complete your bank account details",null);


          fs.createReadStream('./static/userImages/user.png').pipe(fs.createWriteStream('./static/userImages/'+result.insertedId+'.png'));                  
          
          request.session.user={_id:result.insertedId,name:request.body.userGoogleName,email:request.body.userGoogleEmail,contact:request.body.userGoogleContact};
                  
            response.json({result:true,userId:result.insertedId});
          
  
        });
     
      }
      });
//     } else{
// 		response.json({result:"invalid auth key"});
// //console.log(request.body.authenticate);
//console.log("Web srvice not 991 authenticate");
// 	}
  });
app.post('/checkGoogleLogIn',function(request,response){
		//console.log("authenticated");
var userGoogleId=request.body.userGoogleId;
var email=request.body.userGoogleEmail.trim();
  client.verifyIdToken(
    userGoogleId,
    '1084503627756-cfh58c39e0becqomp0tulrdpq46ngj6t.apps.googleusercontent.com',
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
    function(e, login) {
      if(e)
      response.json({result:false});
      else
      {
      var payload = login.getPayload();
      var userid = payload['sub'];
      // If request specified a G Suite domain:
      //var domain = payload['hd'];
      con.collection('users').find({$or:[
        {
          googleId:userid
        },
        {
          email:new RegExp(["^", email, "$"].join(""), "i")
        }
      ]}).toArray(function(err,result){

        if(result.length)
        {
          request.session.user=result[0];
          con.collection("users").update({
            _id:ObjectId(result[0]._id)
          },{
            $set:
            {
              deviceId:(request.body.deviceId?request.body.deviceId:null)
            }
          },(err,res)=>{
            response.json({result:true,userId:result[0]._id});
          });
        }
        else
        {
          response.json({result:false});
        }

      });
    }

    });
 
});
app.get('/search/:category/:searchTerm',function(request,response){

  
        response.render('pages/search',{data:request.session.user,highLightPostATask:false,searchTerm:request.params.searchTerm,category:request.params.category});
   
	
  });
app.get('/getNotifications/:id',function(request,response){
	if(authentication == request.headers.authenticate) {
		//console.log("authenticated");

      con.collection('notifications').find({for:request.params.id}).sort({_id:-1}).toArray(function(err,result){
        response.json(result);
      });
        } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1072 authenticate");
	}
});
app.get('/clearNotifications/:id',function(request,response){
	if(authentication == request.headers.authenticate) {
		//console.log("authenticated");
    clearNotifications(request.params.id);
    response.json({});
      } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1083 authenticate");
	}
});
app.get('/logout',function(request,response){
  request.session.destroy();
  response.redirect('/');
});
app.get('/showSession',function(request,response){
	if(authentication == authentication) {
		//console.log("authenticated");
  response.json(request.session);
    } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1097 authenticate");
	}
});
app.get('/postatask',function(request,response){
	// if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  if(request.session.user!=undefined){
  response.render('pages/postatask',{
    data:request.session.user,
    highLightPostATask:true
  });
  }
  else
  {
    response.redirect('/');
  }
//     } else{
// 		response.json({result:"invalid auth key"});
// //console.log(request.body.authenticate);
// 	}
});
app.post('/getTaskDetails',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");

    con.collection('task').find({_id:ObjectId(request.body._id)}).toArray((err,result)=>{

        response.json({data:result[0]});

    });
      } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1131 authenticate");
	}

});
app.get('/taskApis/getTasksDetails/:taskId',function(request,response){
	if(authentication == request.headers.authenticate) {
		//console.log("authenticated");

  con.collection('task').find({_id:new ObjectId(request.params.taskId)},{messages:true,_id:false}).toArray(function(err,res){
      var messages=res[0].messages;
      if(messages==undefined)
      {
        response.json({messages:[]});
      }
      else
      {
        if(messages.length==0)
        response.json({messages:[]});
      else
      {    
        var i;
        var temp=0;
      for(i=0;i<messages.length;i++)
      {
        var tempMessageBy=messages[i].messageBy;
        con.collection('users').find({_id:new ObjectId(tempMessageBy)},{_id:true,name:true}).toArray(function(err,result){
          if(result[0])
          for(var j=0;j<messages.length;j++)
          {
            if(messages[j].messageBy==result[0]._id)
            {  
              if(!messages[j].name)
              {
              messages[j].name=result[0].name;
              break;
              }
            }
          }
              
            
            
            temp++;
             if(temp>=messages.length)
             {
               response.json({messages:messages});
             }

        });
      }    
      }
        }
  });
    } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1186 authenticate");
	}
});
app.get('/taskApis/addMessage/:taskId/:userId/:description/:cost/:postedBy/:userName',function(request,response){
    //  response.json({result:1});
    if(authentication == request.headers.authenticate) {
		//console.log("authenticated");
    con.collection('users').findOne({_id:ObjectId(request.params.userId)},(err,tempResult)=>{

          if(tempResult.iban)
          {
                
       con.collection('task').updateOne({_id:new ObjectId(request.params.taskId)},{$addToSet:{
        messages:{
          message:request.params.description,
          cost:request.params.cost,
          messageBy:request.params.userId,
          date:new Date().toLocaleDateString()
        }

       }},function(err,res){
        if(err)
        response.json({result:0});
       else{
    insertNotification('New Bid',new Date(),request.params.postedBy,request.params.userId,request.params.userName+' bid on your task!',request.params.taskId);
    response.json({result:1});
   
       }
       });

          }
          else
          {
              response.json({result:2,message:"Bank details not found"});
          }


    });
      } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1227 authenticate");
	}
});
app.get('/existingCategories',function(request,response){

  if(authentication == request.headers.authenticate) {

      con.collection("categories").find().toArray(function(err,result){

        if(!err)
        {
          response.json(result);

        }
        else
        {
          //console.log("Error while executing the query!");
        }

      });
       } else{
    response.json({result:"invalid auth key"});
//console.log(request.headers.authenticate);
//console.log("Web srvice not 1250 authenticate");
  }
        
});
app.post('/logInUser',function(request,response){
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
	//console.log(authentication);
	//console.log(request.body.authenticate);

	if(authentication == request.body.authenticate) {
    //  con.collection("users").find)
	    con.collection("users").find({email:new RegExp(request.body.email,'i'),password:md5(request.body.password)}).toArray(function(err,result){

	      if(result.length==0)
	      {
	         response.json({result:0});
	      }
	      else
	      {
	        if(request.body.deviceId)
	        {
	          con.collection("users").update({
	            _id:ObjectId(result[0]._id)
	          },{
	            $set:
	            {
	              deviceId:request.body.deviceId
	            }
	          });
	        }
	        var UUID4 = uuidv4();
	        request.session.user=result[0];
	        request.session.UUId=UUID4;
	        response.json({result:1,userId:result[0]._id,UUID:UUID4});
	      }

	    });
	} else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice 1291not authenticate");
	}
	  } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1296 authenticate");
	}
});
app.post('/getReviewsForaPerson',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('task').find({
    $and:[
      {
        assignedTo:ObjectId(request.body._id)
      },
      {
        feedbackPosted:true
      }
    ]
  }).toArray((err,result)=>{
    response.json(result);
  });
    } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice 1317 not authenticate");
	}
});
app.post('/reportTask',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('task').update({
    _id:ObjectId(request.body._id)
  },{
    $set:{
      reported:true
    }
  },(err,result)=>{
    response.json({result:true});
  }); 
    } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1335 authenticate");
	}
});
app.post('/addTaskFeedback',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('task').update({
    _id:ObjectId(request.body._id)
  },{
    $set:{
      feedbackPosted:true,
      feedbackComment:request.body.feedbackComment,
      feedbackTitle:request.body.feedbackTitle,
      feedbackRating:request.body.feedbackRating,
      feedbackDate:new Date()
    }
  },(err,result)=>{
    response.json({result:true});
  });
    } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1357 authenticate");
	}
});
app.post('/completeTask',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('task').update({
    _id:ObjectId(request.body._id)
  },{
    $unset:
    {
      reported:false
    }
  },(err,result)=>{
    con.collection('task').update({
      _id:ObjectId(request.body._id)
    },{
      $set:{
        complete:true,
        completionDate:new Date().toLocaleDateString()
      }
    },(err,result)=>{
      response.json({result:true});
    });
  });
    } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1385 authenticate");
	}
});

app.post('/completeTaskAdmin',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('task').update({
    _id:ObjectId(request.body._id)
  },{
    $unset:
    {
      reported:false
    }
  },(err,result)=>{
    con.collection('task').update({
      _id:ObjectId(request.body._id)
    },{
      $set:{
        paymentProcessed:true,
        complete:true,
        completionDate:new Date().toLocaleDateString()
      }
    },(err,result)=>{
      response.json({result:true});
    });
  });
    } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1415 authenticate");
	}
});

app.post('/acceptTask',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  stripe.charges.create({
    amount: parseInt(request.body.cost)*100,
    currency: "eur",
    description: "Task Charge",
    source: request.body.token,
  }, function(err, charge) {
    if(err)
    {
      response.json({result:false});
    }
    else
    {
      con.collection('task').update({
        _id:ObjectId(request.body._id)
      },{
        $set:{
          assignedTo:ObjectId(request.body.assignTo),
          assignedDate:new Date().toLocaleDateString(),
          transactionId:charge.id
        }
      },(err,result)=>{
        con.collection('task').findOne({
          _id:ObjectId(request.body._id)
          
        },(err,result)=>{

          insertNotification("Your bid has been accepted",new Date(),request.body.assignTo,result.postedBy,"The customer has paid the amount successfully!",request.body._id);
          insertNotification("Payment Successful",new Date(),result.postedBy,request.body.assignTo,"You have successfully accepted the bid!",request.body._id);
          request.session.showPaymentSuccess=true;
          response.json({result:true});
       


        });
      });
    
    }
  });
  
  	  } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1464 authenticate");
	}
  });

app.post('/updateTask',(request,response)=>{

    //First get all the bids from the database
    if(authentication == request.body.authenticate) {
		//console.log("authenticated");
    let data=request.body;
    con.collection("task").find({_id:ObjectId(data._id)}).toArray((err,result)=>{

        let messages=result[0].messages;
        if(messages)
        {
            for(let i=0;i<messages.length;i++)
            {
              messages[i].allow=false;
              insertNotification("Task Updated",new Date(),messages[i].messageBy,result[0].postedBy,"Task has been updated. Please bid again",data._id);
            }    
            
            //Now check if the online or offline

            if(data.tags.length!=0)
            {
              con.collection("tags").find({},{_id:false,tagName:true}).toArray(function(err,result){
                
                         var toBeInserted=[];
                         for(var i=0;i<data.tags.length;i++)
                         {
                             var flag=true;
                             for(var j=0;j<result.length;j++)
                             {
                                if(result[j].tagName.toLowerCase()==data.tags[i].toLowerCase())
                                {
                                    flag=false;
                                    break;
                                }
    
                             }
                             if(flag)
                             {
                                 toBeInserted.push({tagName:data.tags[i]});
                             }
                         }
                         if(toBeInserted.length)
                         {
                             con.collection("tags").insertMany(toBeInserted,function(err,res){
                                 //console.log("New Tags Inserted");
                             });
                         }      
                    
                    });  
            }
            if(data.taskAddress)
            {
                  
                con.collection("task").update({_id:ObjectId(data._id)},{
                  $set:
                  {
                    title:data.title,
                    Description:data.description,
                    Cost:data.cost,
                    tags:data.tags,
                    postExactDate:new Date(),
                    dueDate:data.dueDate,
                    taskAddress:data.taskAddress,
                    messages:messages
                  }
                },(err,result)=>{

                  response.json({result:true});

                });

            }
            else
            {

                con.collection("task").update({_id:ObjectId(data._id)},{
                  $set:
                  {
                    title:data.title,
                    Description:data.description,
                    Cost:data.cost,
                    tags:data.tags,
                    postExactDate:new Date(),
                    dueDate:data.dueDate,
                    messages:messages
                  }
                },(err,result)=>{

                  response.json({result:true});

                });


            }


        }
        else
        {

              
            if(data.tags.length!=0)
            {
              con.collection("tags").find({},{_id:false,tagName:true}).toArray(function(err,result){
                
                         var toBeInserted=[];
                         for(var i=0;i<data.tags.length;i++)
                         {
                             var flag=true;
                             for(var j=0;j<result.length;j++)
                             {
                                if(result[j].tagName.toLowerCase()==data.tags[i].toLowerCase())
                                {
                                    flag=false;
                                    break;
                                }
    
                             }
                             if(flag)
                             {
                                 toBeInserted.push({tagName:data.tags[i]});
                             }
                         }
                         if(toBeInserted.length)
                         {
                             con.collection("tags").insertMany(toBeInserted,function(err,res){
                                 //console.log("New Tags Inserted");
                             });
                         }      
                    
                    });  
            }
            if(data.taskAddress)
            {
                  
                con.collection("task").update({_id:ObjectId(data._id)},{
                  $set:
                  {
                    title:data.title,
                    Description:data.description,
                    Cost:data.cost,
                    tags:data.tags,
                    postExactDate:new Date(),
                    dueDate:data.dueDate,
                    taskAddress:data.taskAddress
                  }
                },(err,result)=>{

                  response.json({result:true});

                });

            }
            else
            {

                con.collection("task").update({_id:ObjectId(data._id)},{
                  $set:
                  {
                    title:data.title,
                    Description:data.description,
                    Cost:data.cost,
                    tags:data.tags,
                    postExactDate:new Date(),
                    dueDate:data.dueDate
                  }
                },(err,result)=>{

                  response.json({result:true});

                });


            }



        }



    });
	  } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1652 authenticate");
	}

});


app.post('/update-task',(request,response)=>{

    //First get all the bids from the database
    if(authentication == request.body.authenticate) {
		//console.log("authenticated");
    let data=request.body;
    con.collection("task").find({_id:ObjectId(data._id)}).toArray((err,result)=>{

        let messages=result[0].messages;
        if(messages)
        {
            for(let i=0;i<messages.length;i++)
            {
              messages[i].allow=false;
              insertNotification("Task Updated",new Date(),messages[i].messageBy,result[0].postedBy,"Task has been updated. Please bid again",data._id);
            }    
            
            //Now check if the online or offline

            if(data.tags.length!=0)
            {
              con.collection("tags").find({},{_id:false,tagName:true}).toArray(function(err,result){
                
                         var toBeInserted=[];
                         for(var i=0;i<data.tags.length;i++)
                         {
                             var flag=true;
                             for(var j=0;j<result.length;j++)
                             {
                                if(result[j].tagName.toLowerCase()==data.tags[i].toLowerCase())
                                {
                                    flag=false;
                                    break;
                                }
    
                             }
                             if(flag)
                             {
                                 toBeInserted.push({tagName:data.tags[i]});
                             }
                         }
                         if(toBeInserted.length)
                         {
                             con.collection("tags").insertMany(toBeInserted,function(err,res){
                                 //console.log("New Tags Inserted");
                             });
                         }      
                    
                    });  
            }
            if(data.taskAddress)
            {
                  
                con.collection("task").update({_id:ObjectId(data._id)},{
                  $set:
                  {
                    title:data.title,
                    Description:data.description,
                    Cost:data.cost,
                    tags:data.tags,
                    postExactDate:new Date(),
                    dueDate:data.dueDate,
                    taskAddress:data.taskAddress,
                    messages:messages
                  }
                },(err,result)=>{

                  response.json({result:true});

                });

            }
            else
            {

                con.collection("task").update({_id:ObjectId(data._id)},{
                  $set:
                  {
                    title:data.title,
                    Description:data.description,
                    Cost:data.cost,
                    tags:data.tags,
                    postExactDate:new Date(),
                    dueDate:data.dueDate,
                    messages:messages
                  }
                },(err,result)=>{

                  response.json({result:true});

                });


            }


        }
        else
        {

              
            if(data.tags.length!=0)
            {
              con.collection("tags").find({},{_id:false,tagName:true}).toArray(function(err,result){
                
                         var toBeInserted=[];
                         for(var i=0;i<data.tags.length;i++)
                         {
                             var flag=true;
                             for(var j=0;j<result.length;j++)
                             {
                                if(result[j].tagName.toLowerCase()==data.tags[i].toLowerCase())
                                {
                                    flag=false;
                                    break;
                                }
    
                             }
                             if(flag)
                             {
                                 toBeInserted.push({tagName:data.tags[i]});
                             }
                         }
                         if(toBeInserted.length)
                         {
                             con.collection("tags").insertMany(toBeInserted,function(err,res){
                                 //console.log("New Tags Inserted");
                             });
                         }      
                    
                    });  
            }
            if(data.taskAddress)
            {
                  
                con.collection("task").update({_id:ObjectId(data._id)},{
                  $set:
                  {
                    title:data.title,
                    Description:data.description,
                    Cost:data.cost,
                    tags:data.tags,
                    postExactDate:new Date(),
                    dueDate:data.dueDate,
                    taskAddress:data.taskAddress
                  }
                },(err,result)=>{

                  response.json({result:true});

                });

            }
            else
            {

                con.collection("task").update({_id:ObjectId(data._id)},{
                  $set:
                  {
                    title:data.title,
                    Description:data.description,
                    Cost:data.cost,
                    tags:data.tags,
                    postExactDate:new Date(),
                    dueDate:data.dueDate
                  }
                },(err,result)=>{

                  response.json({result:true});

                });


            }



        }



    });
	  } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1652 authenticate");
	}

});
app.post('/registerUserCheck',(request,response)=>{
if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection("users").find({
    
                $or:[
                  {
                    email:request.body.email.trim().toLowerCase()
    
                  },
                  {
                    contact:request.body.phoneNumber.toLowerCase()
                  }
                ]
    
    
            }).toArray(function(err,result){
              if(!err)
              {
    
                if(result.length==0)
                {
                    response.json({result:true});
                }
                else
                {
                  response.json({result:false});
    
                }
              }
              else
              {
    
                //console.log("Error while executing the query");
              }
    
    
            });
              } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice  1697 authenticate");
	}
                });
app.get('/verify/:_id',(request,response)=>{
// if(authentication == request.body.authenticate) {
		//console.log("authenticated");
    con.collection("users").update({_id:ObjectId(request.params._id)},{

        $set:
        {
          emailVerified:true
        }

    },(err,result)=>{

          response.render('pages/verify');

    });
      // } else{
		// response.json({result:"invalid auth key"});
// //console.log(request.body.authenticate);
//console.log("Web srvice not 1715 authenticate");
	// }

});
app.post('/registerUser',function(request,response){
if(authentication == request.body.authenticate) {
		//console.log("authenticated");
        con.collection("users").find({

            $or:[
              {
                email:request.body.email.trim().toLowerCase()

              },
              {
                contact:request.body.phoneNumber.toLowerCase()
              }
            ]


        }).toArray(function(err,result){
          if(!err)
          {

            if(result.length==0)
            {
              let temp=null;
              if(request.body.deviceId)
              temp=request.body.deviceId;
              con.collection("users").insertOne({name:request.body.name,deviceId:temp,email:request.body.email.trim().toLowerCase(),emailVerified:false,contact:request.body.phoneNumber,password:md5(request.body.password)},function(err,res){
                if(err)
                {
                  //console.log("Error while inserting the user");
                  response.json({result:"2"});

                }
                else
                {
                  var data = {
                    from: 'dzinn <no-reply@dzinnapp.com>',
                    to: request.body.email.trim(),
                    subject: 'Verify your email',
                    html:`
                      Dear ${request.body.name},
                      <br/>
                      <br/>
                      Click on the link below to verify your email address:
                      <br/>
                      <br/>
                      <a href="http://dzinnapp.com/verify/${res.insertedId.toString()}" target="_blank">http://dzinnapp.com/verify/${res.insertedId.toString()}</a>
                      <br/>
                      <br/>
                      <br/>
      
                      Regards,<br/>
                      Team Dzinn
                    
                    `
                  };
                  
                  mailgun.messages().send(data, function (error, body) {
                    //console.log(error,body);
                  });
              
                  insertNotification('Information',new Date(),res.insertedId.toString(),'Dzinn',"Verify your email address",null);
                  insertNotification('Information',new Date(),res.insertedId.toString(),'Dzinn',"Complete your bank account details",null);
                  fs.createReadStream('./static/userImages/user.png').pipe(fs.createWriteStream('./static/userImages/'+res.insertedId+'.png'));                  
                  request.session.user={_id:res.insertedId,name:request.body.name,email:request.body.email,contact:request.body.phoneNumber,password:md5(request.body.password)};

                  response.json({result:"1",userId:res.insertedId});
                }

              });

            }
            else
            {
              response.json({result:"0"});

            }
          }
          else
          {

            //console.log("Error while executing the query");
          }


        });
          } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1810 authenticate");
	}

});
app.get('/task/:id',function(request,response){
	if(authentication == authentication) {
		//console.log("authenticated");
  if(request.params.id==undefined||request.params.id.length!=24)
  {
    response.redirect('/');
    
  }
  else
  {
  con.collection('task').find({_id:new ObjectId(request.params.id)}).toArray(function(err,result){
   // //console.log({_id:new ObjectId(request.params.id)});
      if(result.length==0)
      {
        response.redirect('/');
      }       
      else
      {
        let payment=false;
        if(request.session.showPaymentSuccess)
        {
          payment=true;
          request.session.showPaymentSuccess=false;
        }
        var postedBy=result[0].postedBy;
        con.collection('users').find({_id:new ObjectId(postedBy)}).toArray(function(err,userData){
          response.render('pages/task',{
            data:request.session.user,
            highLightPostATask:false,
            result:result,
            userData:userData,
            payment:payment
          });


        });

      }

  });
}
    } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1858 authenticate");
	}


});
app.post('/deleteTask',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('task').remove({_id:ObjectId(request.body._id)});
  response.json({result:true});
  } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1871 authenticate");
	}
});
app.post('/revertTask',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('task').update({
    _id:ObjectId(request.body._id)
  },{
    $unset:
    {
      "assignedTo" : "",
      "assignedDate" : "",
      "complete" : false,
      "completionDate" : "",
      "feedbackComment" : "",
      "feedbackTitle" : "",
      "feedbackRating" : "",
      "feedbackDate" : "",
      "reported" : true
    }
  },(err,result)=>{
    response.json({result:true});
  });
    } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1898 authenticate");
	}
})
app.get('/getBankDetails/:userId',function(request,response){
	if(authentication == request.headers.authenticate) {
		//console.log("authenticated");
  con.collection('users').find({_id:new ObjectId(request.params.userId)}).toArray(function(err,res){

      response.json(res[0]);

  });
    } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1912 authenticate");
	}
});
app.get('/saveBankDetails/:userId/:accountNumber/:accountIFSC/:branchName',function(request,response){
	if(authentication == request.headers.authenticate) {
		//console.log("authenticated");

    con.collection('users').updateOne({_id:new ObjectId(request.params.userId)},{$set:
      {
        bankName:request.params.accountNumber,
        bic:request.params.accountIFSC,
        iban:request.params.branchName
      }},function(err,result){

      if(err)
      response.json({result:false});
      else
      response.json({result:true});
    });
      } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1934 authenticate");
	}

});
app.post('/saveData',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('users').update({
    _id:ObjectId(request.body.usersDetails._id)
  },{
    $set:
    {
      about:request.body.usersDetails.about,
      skills:request.body.usersDetails.skills
    }
  },(err,result)=>{
    response.json({result:true});
  });
  } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1955 authenticate");
	}
});
app.post('/replaceUserImage/:userId',(request,response)=>{
		//console.log("authenticated");
  fs.unlink('./static/userImages/'+request.params.userId+'.png',(err,result)=>{
    request.files.image.mv('./static/userImages/'+request.params.userId+'.png', function(err) {
      response.redirect('/profile/'+request.params.userId);
    });
  
  });
   
  });

app.post('/uploadProfilePhoto/:userId',(request,response)=>{
		//console.log("authenticated");
  fs.unlink('./static/userImages/'+request.params.userId+'.png',(err,result)=>{
    request.files.image.mv('./static/userImages/'+request.params.userId+'.png', function(err) {
	if(err)
		response.json({result:false})
	else
		response.json({result:true})
    });
  
  });
   
  });
app.get('/getTasks/:category/:subcategory',function(request,response){
	if(authentication == request.headers.authenticate) {
		//console.log("authenticated");
 // //console.log(request.params.category);
    con.collection('task').find({category:new RegExp(request.params.category,'i'),subcategory:new RegExp(request.params.subcategory,'i')}).sort( { postExactDate: -1 } ).toArray(function(err,result){
        if(!err)
        response.json(result);


    });
      } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 1981 authenticate");
	}
});
app.post('/updateBid',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('task').find({
    _id:ObjectId(request.body._id)
  }).toArray((err,result)=>{

      var messages=result[0].messages;
      var temp=null;
      for(var i=0;i<messages.length;i++)
      {
        if(messages[i].messageBy==request.body.data.messageBy)
        {
          messages[i].date=new Date().toLocaleDateString();
          messages[i].message=request.body.data.message;
          messages[i].cost=request.body.data.cost;
          messages[i].allow=true;
          temp=messages[i];
        }
      }
      //Update the collection
      con.collection('task').update({
        _id:ObjectId(request.body._id)
      },{
        $set:{
          messages:messages
        }
      });
      con.collection('users').findOne({
        _id:ObjectId(request.body.data.messageBy)
      },(err,user)=>{
         insertNotification('Bid Updated',new Date(),result[0].postedBy,request.body.data.messageBy,user.name+' has updated the bid!',request.body._id);
   

        response.json(temp);
      });
  });
    } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 2024 authenticate");
	}
});
app.post('/taskDetails',(request,response)=>{
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  con.collection('task').find({
    _id:ObjectId(request.body._id)
  }).toArray((err,result)=>{
    response.json(result[0]);
  });
    } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice not 2038 authenticate");
	}
});
app.post('/searchTasks/:category/:searchTerm',function(request,response){
	if(authentication == request.body.authenticate) {
		//console.log("authenticated");
  // //console.log(request.params.category);
  if(request.params.category.toLowerCase().trim()=='all')
  {
    con.collection('task').find({}).sort( { postExactDate: -1 } ).toArray(function(err,result){
      response.json(result);
    });
  }
  else
  {
  if(request.params.category.toLowerCase()=='categories')
  {
    con.collection('task').find({$or:[{tags:new RegExp(request.params.searchTerm,'i')},{title:new RegExp(request.params.searchTerm,'i')}]}).sort( { postExactDate: -1 } ).toArray(function(err,result){
      if(!err)
      response.json(result);


  });

  }
  else
  {
     con.collection('task').find({$and:[{category:new RegExp(request.params.category,'i')},{$or:[{tags:new RegExp(request.params.searchTerm,'i')},{title:new RegExp(request.params.searchTerm,'i')}]}]}).sort( { postExactDate: -1 } ).toArray(function(err,result){
         if(!err)
         response.json(result);
 
 
     });
    }
  }
    } else{
		response.json({result:"invalid auth key"});
//console.log(request.body.authenticate);
//console.log("Web srvice 2076 not authenticate");
	}
    });

app.post('/searchTasksmobile/:category/:searchTerm',function(request,response){
	
		//console.log("authenticated");
  // //console.log(request.params.category);
  if(request.params.category.toLowerCase().trim()=='all')
  {
    con.collection('task').find({}).sort( { postExactDate: -1 } ).toArray(function(err,result){
      response.json(result);
    });
  }
  else
  {
  if(request.params.category.toLowerCase()=='categories')
  {
    con.collection('task').find({$or:[{tags:new RegExp(request.params.searchTerm,'i')},{title:new RegExp(request.params.searchTerm,'i')}]}).sort( { postExactDate: -1 } ).toArray(function(err,result){
      if(!err)
      response.json(result);


  });

  }
  else
  {
     con.collection('task').find({$and:[{category:new RegExp(request.params.category,'i')},{$or:[{tags:new RegExp(request.params.searchTerm,'i')},{title:new RegExp(request.params.searchTerm,'i')}]}]}).sort( { postExactDate: -1 } ).toArray(function(err,result){
         if(!err)
         response.json(result);
 
 
     });
    }
  }
   
    });
 
 
/**
 Post a Task Routes
 */
var postatask=require('./postataskroutes/getTags');
app.use('/postataskapis/',postatask);
app.get('/:category',function(request,response){


          con.collection("categories").find().toArray(function(err,result){

            if(!err)
            {
              var bool=false;
              var i;
              for(i=0;i<result.length;i++)
              {
                if(result[i].name.toLowerCase()==request.params.category.toLowerCase())
                {
                  bool=true;
                  break;
                }
              }

              if(!bool)
              {
                response.redirect('/');
              }
              else
              {
                  response.render("pages/category",{
                    data:request.session.user,
                    highLightPostATask:false,
                    result:result[i]

                  });
              }

            }
            else
            {
              //console.log("Error while executing the query!");
            }

          });
            
});
app.get('/:category/:subcategory',function(request,response){

  
  
            con.collection("categories").find().toArray(function(err,result){
  
              if(!err)
              {
                var bool=false;
                var i;
                var j;
                for(i=0;i<result.length;i++)
                {
                  if(result[i].name.toLowerCase()==request.params.category.toLowerCase())
                  {
                    for(j=0;j<result[i].subcategories.length;j++)
                    {
                      if(result[i].subcategories[j].name.toLowerCase()==request.params.subcategory.toLowerCase())
                      {
                        bool=true;
                        break;
                      }


                    }
                    if(bool)
                    break;
                  }
                }
  
                if(!bool)
                {
                  response.redirect('/');
                }
                else
                {
                    response.render("pages/subcategory",{
                      data:request.session.user,
                      highLightPostATask:false,
                      result:result[i].subcategories[j],
                      category:request.params.category,
                      subcategory:request.params.subcategory
                    });
                }
  
              }
              else
              {
                //console.log("Error while executing the query!");
              }
  
            });
     
  });
app.listen(80,function(){
  console.log("The server has started");
});
