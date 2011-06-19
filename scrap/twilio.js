var ACCOUNT_SID = 'AC2a585784a06f7c0f435a82df2f567dbf';
var AUTH_TOKEN = '8894ebecf19122c98344b232291dc0bd';
var MY_HOSTNAME = 'anonymouse.herokuapp.com';

var sys = require('sys'),
    TwilioClient = require('twilio').Client,
    client = new TwilioClient(ACCOUNT_SID, AUTH_TOKEN, MY_HOSTNAME),
    newSeedPhone = client.getPhoneNumber('+14158774471');
    //sandboxPhone = client.getPhoneNumber('+14155992671');
    //sandbox: 14155992671
    //real number: 14158774471
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