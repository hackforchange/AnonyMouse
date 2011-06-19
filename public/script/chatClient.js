window.addEvent('load',function(){
    activatePlaceholders();
    
    var username = Cookie.read('username');
    var activeMentee = "4dfd6d878d45cb17b77e4003";
    
    $('chatButton').addEvent('click', function(){                
        now.sendSMS(activeMentee, $('chatBox').value);
        $('chatBox').value = "";
    });
    
    $('chatBox').addEvent('keydown', function(event){
        if (event.key == 'enter'){
            $('chatButton').fireEvent('click');
        }
    });
    
    now.ready(function(){
        now.setSid(Cookie.read('sid'));
    });
    
    now.incomingMessage = function(json){
        
        console.log(json);
        var message = json.message;
        var m = new Element( 'div', {id:message+"_", html:"<b>" + json.name + ":</b> " + message} );
        $('messages').grab(m);
        
    }
    
    now.incomingError = function(msg){
        console.error("Server error: " + msg);
    }
    
    $('chatBox').focus();
    
    
});