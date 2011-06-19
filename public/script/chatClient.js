var activeMentee = "";
window.addEvent('load',function(){
    activatePlaceholders();
    
    var username = Cookie.read('username');
    //activeMentee = "4dfd6d878d45cb17b77e4003";
    
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
    
    function setActiveChat(id){
        activeMentee = id;
        console.log("Setting active chat to " + activeMentee);        
    }
    
    function populateQuestions(){
        var jsonRequest = new Request.JSON({url: '/api/unanswered', 
              onSuccess: function(response){                                                    
                  Array.each(response, function(question, index){                      
                      var questionLink = new Element('a',{
                          id:question._id.$oid, 
                          href:'#', 
                          html:question.seed,
                          events: {
                              click: function(){
                                  setActiveChat(question._id.$oid);
                              },                                    
                          }
                      });
                      
                      var questionLi = new Element('li').grab(questionLink);
                      $('linkList').grab(questionLi);
                  });
              },

              onError: function(error){
                  console.error(error);
              }
          }).get();
      }
    
    now.incomingMessage = function(json){
                
        if(json.menteeId == activeMentee){
            //show in current window
            var message = json.message;
            if(!json.name){
                json.name = "AnonyMouse";
            }
            var m = new Element( 'div', {id:message+"_", html:"(" + json.menteeId + ")<b>" + json.name + ":</b> " + message} );
            $('messages').grab(m);
        }else{
            //TODO:  Deal with it some other way.
            console.log("Got some other message");
        }
       
    }
    
    now.incomingError = function(msg){
        console.error("Server error: " + msg);
    }
    
    $('chatBox').focus();
    //alert("READY");
    populateQuestions();
    
});