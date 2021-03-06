//Custom functions for talking to mongolab

var rest = require('restler');
var apiKey = '4dfd63f88d45cb17b77e3ff8';

//urls
var rootUrl = 'https://mongolab.com/api/1/databases/heroku_app571123';
var menteesUrl = rootUrl + '/collections/mentees';
var mentorsUrl = rootUrl + '/collections/mentors';
//var chatsUrl = rootUrl + '/collections/chats';
var apiKeySuffix = '?apiKey=' + apiKey;

exports.createMentee = function (menteePhone, menteeSeed, callback){
    var url = menteesUrl + apiKeySuffix;
    var jsonData = JSON.stringify({ seed:menteeSeed, phone:menteePhone, answered:false });
    rest.post(url, {
        data: jsonData
    }).on('error', function(data, response) {
        callback(data,null);
    }).on('complete', function(data, response) {
        if(!data){
            callback("No response from database", null);
        }else{
            callback(null,data);
            console.log(data);
        }        
    });
}

exports.getUnanswered = function(callback){
    var query = '{"answered":false}';    
    var url = menteesUrl + apiKeySuffix + '&q=' + encodeURIComponent(query);
    
    console.log(url);
    
    rest.get(url).on('error', function(data, response) {
        callback("Some error from mongocloud: " + JSON.stringify(data),null);
    }).on('success', function(data, response) {
        if(!data){
            callback("No data from database", null);
        }else{
            callback(null,data);            
        }        
    });
}

exports.getMentee = function(phone, callback){
    var query = '{"phone":"' + phone + '"}';    
    var url = menteesUrl + apiKeySuffix + '&q=' + encodeURIComponent(query);

    rest.get(url).on('error', function(data, response) {
        callback("Some error from mongocloud: " + JSON.stringify(data),null);        
    }).on('success', function(data, response) {
        if(!data || data == ""){            
            callback("No data from database", null);
        }else{
            callback(null,data[0]);            
        }        
    });
}

exports.getMenteeById = function(id, callback){
    //var query = '{"id":"' + id + '"}';    
    var url = menteesUrl + '/'+ id + '/' +apiKeySuffix ;
    
    rest.get(url).on('error', function(data, response) {
        callback("Some error from mongocloud: " + JSON.stringify(data),null);
    }).on('success', function(data, response) {
        if(!data){
            callback("No data from database", null);
        }else{
            callback(null,data);            
        }        
    });
}

exports.getMentor = function(username, callback){
    var query = '{"username":"' + username + '"}';    
    var url = mentorsUrl + apiKeySuffix + '&q=' + encodeURIComponent(query);
    
    rest.get(url).on('error', function(data, response) {
        callback("Some error from mongocloud: " + JSON.stringify(data),null);
    }).on('success', function(data, response) {
        if(!data){
            callback("No data from database", null);
        }else{
            callback(null,data[0]);
        }        
    });
}

// exports.addChat = function(menteeId, mentor, message, callback){
//     exports.getMenteeById(menteeId, function(err,mentee){
//         if(!err){
//             console.log(mentee);
//             var menteeObj = JSON.parse(mentee);
//             var chat = {"user":mentor.name, "message":message};
//             
//             menteeObj.chats.append(chat);
//             
//             var jsonData = JSON.stringify(menteeObj);
// 
//             rest.put(url, {
//                 data: jsonData
//             }).on('error', function(data, response) {
//                 callback(data,null);
//             }).on('success', function(data, response) {
//                 callback(null,data);
//             });
//             
//         }
//     });        
// }
