// AnonyMouse Server 0.0.0.1 (lol!)
// By @aashay and @aaronmoy and @ewee

//-------------GLOBAL STUFF-------------
var PORT = 3000; 

//Twilio stuff.
var ACCOUNT_SID = 'AC2a585784a06f7c0f435a82df2f567dbf';
var AUTH_TOKEN = '8894ebecf19122c98344b232291dc0bd';
var MY_HOSTNAME = '4567.localtunnel.com';

//----------------------------------------

//-------------REQUIRED STUFF-------------
var express = require('express');
var app = express.createServer();

MemoryStore = require('connect').session.MemoryStore;
var sessionStore = new MemoryStore(); //TODO:  Use something more robust instead of memory JEEEEZUS


var sys = require('sys'),
    TwilioClient = require('twilio').Client,
    client = new TwilioClient(ACCOUNT_SID, AUTH_TOKEN, MY_HOSTNAME),
    newSeedPhone = client.getPhoneNumber('+14158774471');
    //sandboxPhone = client.getPhoneNumber('+14155992671');
    //sandbox: 14155992671
    //real number: 14158774471
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

//-------------PAGE ROUTES-------------
app.get('/', function(req, res){
    res.render('index');
});
//--------------------------------------


//-------------API----------------------

app.post('/newseed', function(req, res){    
    //
});

//--------------------------------------


newSeedPhone.setup(function() {
    
    newSeedPhone.on('incomingSms', function(reqParams, res) {

        // reqParams contains the Twilio request parameters.
        // Res is a Twiml.Response object.

        console.log('Received incoming SMS with text: ' + reqParams.Body);
        console.log('From: ' + reqParams.From);
        
        newSeedPhone.sendSMS(reqParams.From, "Thanks for saying " + reqParams.Body, function(sms){
            console.log("Responded! Waiting for process...");
            sms.on('processed', function(){
                console.log("Processed!");
            });
            
        });
    });
    
});


//Go baby go!
app.listen(PORT);

console.log("The AnonyMouse server is running on port " + PORT);