// AnonyMouse Server 0.0.0.0.1 (lol!)
// By @aashay and @aaronmoy and @ewee

//-------------GLOBAL STUFF-------------
var PORT = process.env.PORT || 3000; 
var CURLONLY = true;  //for dev

//Twilio stuff.
var ACCOUNT_SID = 'AC2a585784a06f7c0f435a82df2f567dbf';
var AUTH_TOKEN = '8894ebecf19122c98344b232291dc0bd';
var MY_HOSTNAME = 'anonymouse.herokuapp.com';
var sandboxNum = '+14155992671';
var masterNumber = '+14158774471';
var aaronNumber = '+14158774990'

//----------------------------------------

//-------------REQUIRED STUFF-------------
var express = require('express');
var app = express.createServer();
var sys = require('sys'),
    rest = require('restler');

MemoryStore = require('connect').session.MemoryStore;
var sessionStore = new MemoryStore(); //TODO:  Use something more robust instead of memory JEEEEZUS

var nowjs = require('now');

var db = require('./database.js');

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

//-------------CUSTOM FUNCTIONS SO SEXY-------------
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

var login = function(username, password, callback){
    if(!username || !password){
        
    }
    else{
        //TODO:  Verify against db
        
    }
    
}

var restricted = function(req, res, callnext){
    if (req.session.username) {
        callnext();
    }
    else {
        res.redirect('/');
    }
}
//--------------------------------------


//-------------PAGE ROUTES-------------
app.get('/', function(req, res){
    res.render('index');
});
//--------------------------------------


//-------------GET API-------------
app.get('/unanswered', function(req, res){        
    var response = "";
    db.getUnanswered(function(err,data){
        if(err){
            response = err;
        }
        else{
            response = data;
        }
        res.send(response);
    });       
});
//--------------------------------------

//----------------POST API FOR TWILIO TO TALK TO--------------------
app.post('/newseed', function(req, res){    
    var message = req.body.Body;
    var menteeNumber = req.body.From;
    
    var reply = "Thanks, a mentor will be connecting with you soon!";    
    
    db.createMentee(menteeNumber, message, function(err,data){
        if(err){console.log(err)}
        else{
            sendSMS(masterNumber, menteeNumber, reply, function(err,data){
               console.log("WELCOME: " + menteeNumber); 
            });
        }        
    });
           
});

app.post('/mentor/:id/message', function(req, res){
    //1.  Add to database.
    //2.  If this mentor is online, send.
    var mentorId = req.params.id;
    var message = req.body.Body;
    var menteeNumber = req.body.From;
    
    //var reply = "Hey mentor " + mentorId + ", I got a text from: " + menteeNumber + " saying: " + message;
    var reply = {
        "mentorId" : mentorId,
        "menteeNumber" : menteeNumber,
        "message": message
    };
        
    everyone.now.sendMessage(mentorId, reply, function(){
        res.send("Reply sent: " + reply);
    });
});

//--------------------------------------



//----------------NOWJS------------------
var everyone = nowjs.initialize(app);

//sid = Mentor to send it to
everyone.now.sendMessage = function(sid, message, callback){
     console.log("Sending to mentor: " + JSON.stringify(message));
     this.now.incomingMessage(message);
}

//called by client to send a txt to a particular mentee
everyone.now.sendSMS = function(sid, menteeId, smsbody){
    //TODO: Get mentor object from sid, pull from session store.
    //var fromNumber= mentor.phoneNumber
    //var toNumber = database.getConvo(menteeId).phoneNumber
    var fromNumber = aaronNumber;
    var toNumber = menteeId;
    var self = this;    
    
    sendSMS(fromNumber, toNumber, smsbody, function(err,data){
        console.log(smsbody + " -> " + menteeId);
        
        var yourOwnMessage = {
            "menteeNumber" : menteeId,
            "message": smsbody
        };        
        self.now.incomingMessage(yourOwnMessage);  //TODO: change this, or get rid of it and let clientside handle its own messages
        
    });
}


//--------------------------------------

//Go baby go!
app.listen(PORT);

console.log("The AnonyMouse server is running on port " + PORT);