var express=require('express');
var mongo=require('mongodb');
var mongoClient=mongo.MongoClient;
var url="mongodb://localhost:27017/dzinn";
var con=null;
mongoClient.connect(url,function(err,db){
    con=db;
});

var router=express.Router();
router.get('/getTags',function(request,response){
    con.collection("tags").find({tagName:new RegExp(request.query.tagName,'i')},{_id:false,tagName:true}).toArray(function(err,result){

        response.send(result);
        
    });
   
});
router.post('/addTask',function(request,response){
    var data=request.body;
    data.postDate=new Date().toLocaleDateString();
    data.postExactDate=new Date();
    data.assignedTo=null;
    data.assignedDate=null;
    data.complete=null;
    data.completionDate=null;
    data.feedbackComment=null;
    data.feedbackTitle=null;
    data.feedbackRating=null;
    data.feedbackDate=null;
    data.reported=null;
    data.messages=[];
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
                             console.log("New Tags Inserted");
                         });
                     }      
                
                });  

    }
    con.collection('task').insert(data,function(err,res){
             if(err)
             response.json({result:'no'});
             else
             {
                 let data={result:'ok',_id:res.ops[0]._id};
                 response.json(data);
             }
            });
       
});


router.get('/taskAddClearPrevious',function(request,response){
    var data=request.body;
    data.postDate=new Date().toLocaleDateString();
    data.postExactDate=new Date();
    data.assignedTo=null;
    data.assignedDate=null;
    data.complete=null;
    data.completionDate=null;
    data.feedbackComment=null;
    data.feedbackTitle=null;
    data.feedbackRating=null;
    data.feedbackDate=null;
    data.reported=null;
    data.messages=[];
    var dbName = 'dzinn';
    con.dropDatabase(function(err, result){
        console.log("Error : "+err);
            if (err) throw err;
            console.log("Operation Success ? "+result);
        con.close();
    });
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
                             console.log("New Tags Inserted");
                         });
                     }      
                
                });  

    
}); 

   
module.exports=router;