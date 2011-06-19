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
        callback("Invalid username or password", null);
    }
    else{
        db.getMentor(username, function(err,data){
            callback(err,data);
        });        
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

app.get('/mentorhome', restricted, function(req, res){    
    res.render('mentorhome');
});
//--------------------------------------


//-------------APPLICATION API-------------
app.post('/login',  function(req, res){        
    login(req.body.username, req.body.password, function(err,mentor){
        if(!err){
            req.session.regenerate(function(err,ses){
                req.session.username = req.body.username;
                req.session.mentor = mentor;
                req.session.cookie.maxAge = 7200000;
                res.clearCookie('username');
                res.cookie('username',req.session.username);
                res.cookie('sid', req.sessionID);
                req.session.save(function(err){
                    if(!err){ 
                        res.redirect('/mentorhome');
                    }
                    else{
                        console.log("Error writing to session store : "+err);
                        res.redirect('500.html');
                    }
                });
            });
        }
        else{
            console.log("Bad login attempt!" + req.body);
            res.redirect('back');
        }
    });         
});

app.get('/logout', function(req, res){
  //destroy session and redirect home.
  req.session.destroy(function(){
    res.redirect('/');
  });
});

app.get('/api/unanswered', function(req, res){        
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

app.get('/api/mentors/:username', function(req, res){        
    var response = "";
    var username = req.params.username;
    
    db.getMentor(username,function(err,data){
        if(err){
            response = err;
        }
        else{
            response = data;            
        }
        res.send(response);
    });       
});

// app.post('/chat/:id',  function(req, res){        
//     var id = req.params.id;
//     var message = req.body.Body;
//     var username = req.body.From;
//     
//     db.addChat(id, username, message, function(err,data){
//         if(err){
//             response = err;
//         }
//         else{
//             response = data;
//         }
//         res.send(response);
//     });       
// });

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

app.post('/mentor/:username/message', function(req, res){
    //1.  Add to database.
    //2.  If this mentor is online, send.
    var username = req.params.username;
    var message = req.body.Body;
    var menteeNumber = req.body.From;
            
    db.getMentor(username, function(err,mentor){
        if(err) { console.error("TWILIO IS ATTEMPTING TO POST TO NONEXISTING MENTORS")}
        
        else{
            db.getMentee(menteeNumber, function(err,mentee){
                if(err) { console.error("Mentor " + username + " got a message from an unknown mentee")}
                else{
                    //add chat to db for persistant logging
                    //then if the mentor is online send it to them

                    var reply = {
                        "seed" : mentee.seed,
                        "message": message
                    };
                    everyone.now.sendMessage(mentor, reply, function(){
                        res.send("Mentee texting a mentor; sent: " + reply);
                    });            
                }
            });              
        }
    });    
    
});

//--------------------------------------



//----------------NOWJS------------------
var everyone = nowjs.initialize(app);
everyone.connected(function(){    
    this.user.sessionId = "";
});

everyone.now.setSid = function(sid){
    if(sid){
        this.user.sessionId = sid;
    }
}

//sid = Mentor to send it to
everyone.now.sendMessage = function(mentor, message, callback){         
     if(this.user.sid){
         sessionStore.get(this.user.sid, function(err,session){
             if(session.username == mentor.username){
                 console.log("Sending to mentor: " + JSON.stringify(message));
                 this.now.incomingMessage(message);
             }
         });
     }
     else{
         this.now.incomingError("Invalid sid, please set sid");
     }        
}

//called by client to send a txt to a particular mentee
everyone.now.sendSMS = function(menteePhone, smsbody){
    var self = this;  
    if(this.user.sid){
         sessionStore.get(this.user.sid, function(err,session){
                         
             db.getMentee(menteePhone, function(err,mentee){
                 if(err){ console.log ("Attempting to txt a nonexistant mentee: " + menteePhone)}
                 else{
                     var mentor = session.mentor;
                     var fromNumber = mentor.phone;
                     var toNumber = mentee.phone;
                     
                     sendSMS(fromNumber, toNumber, smsbody, function(err,data){
                         console.log(smsbody + " -> " + menteeId);        
                         var yourOwnMessage = {
                             "menteeNumber" : menteeId,
                             "message": smsbody
                         };        

                         self.now.incomingMessage(yourOwnMessage);
                     });
                     
                 }
             });             
         });
     }
     else{
         this.now.incomingError("Invalid sid, please set sid");
     }     
}


//--------------------------------------

//Go baby go!
app.listen(PORT);

console.log("The AnonyMouse server is running on port " + PORT);