// AnonyMouse Server 0.0.0.1 (lol!)
// By @aashay and @aaronmoy and @ewee

//-------------GLOBAL STUFF-------------
var PORT = process.env.PORT || 3000; 
var CURLONLY = false;

//Twilio stuff.
var ACCOUNT_SID = 'AC2a585784a06f7c0f435a82df2f567dbf';
var AUTH_TOKEN = '8894ebecf19122c98344b232291dc0bd';
var MY_HOSTNAME = 'anonymouse.herokuapp.com';
var sandboxNum = '+14155992671';
var masterNum = '+14158774471';

//----------------------------------------

//-------------REQUIRED STUFF-------------
var express = require('express');
var app = express.createServer();
var sys = require('sys'),
    rest = require('restler');

MemoryStore = require('connect').session.MemoryStore;
var sessionStore = new MemoryStore(); //TODO:  Use something more robust instead of memory JEEEEZUS

//----------------------------------------



//You dun configuramalate thems middlewares!
app.configure(function(){    
    //Parse JSON POST request bodies rawr
    app.use(express.bodyParser());
    
    //Remove this for production!
    app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));              
          
    //for any static files (like css and stuff)
    app.use(express.static(__dirname + '/public'));
    
    //Cookies and sessions.  Mmm, cookies.
    app.use(express.cookieParser());
    app.use(express.session({ store: sessionStore, secret: "anonymouuuuuuuse" }));        
});


var sendSMS = function(from, to, body, callback) {
    var accountSid = ACCOUNT_SID,
        authToken = AUTH_TOKEN,
        apiVersion = '2010-04-01',
        uri = '/'+apiVersion+'/Accounts/'+accountSid+'/SMS/Messages',
        host = 'api.twilio.com',
        fullURL = 'https://'+accountSid+':'+authToken+'@'+host+uri;
    if(!CURLONLY){
        rest.post(fullURL, {
            data: { From:from, To:to, Body:body }
        }).on('error', function(data, response) {
            callback(data,null);
        }).on('complete', function(data, response) {
            callback(null,data);
        });
    }
    else{
        callback(null,"DEV TEST SUCCESSFUL");
    }
      
}

//-------------PAGE ROUTES-------------
app.get('/', function(req, res){
    res.render('index');
});
//--------------------------------------

app.get('/test', function(req, res){        
    sendSMS(masterNum, sandboxNum, "Hi, I'm the anonymouse server and I'm alive!", function(err,data){
       if(err){
           console.log(err);
       }else{
           console.log("TEST SUCCESSFUL"); 
           res.send("Test successful.");
       }       
    });    
});

//-------------API----------------------

app.post('/newseed', function(req, res){    
    var message = req.body.Body;
    var menteeNumber = req.body.From;
    
    var reply = "Oh really? Tell me more about " + message;    
    
    sendSMS(masterNum, menteeNumber, reply, function(err,data){
       console.log("SENT A REPLY TO: " + menteeNumber + " - " + reply); 
    });    
});

//--------------------------------------



//Go baby go!
app.listen(PORT);

console.log("The AnonyMouse server is running on port " + PORT);