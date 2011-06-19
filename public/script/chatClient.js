var activeMentee = "";
window.addEvent('load',function(){
    activatePlaceholders();
    
    var username = Cookie.read('username');
    var bottom = 0;
    //activeMentee = "4dfd6d878d45cb17b77e4003";
    
    $('chatButton').addEvent('click', function(){                
        if(activeMentee != ""){
            now.sendSMS(activeMentee, $('chatBox').value);            
        }
        else{
            $('chatError').html = "Please pick a question!";
            $('chatError').show();            
        }
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
    
    function setActiveChat(question){
        $('messages').empty();
        activeMentee = question._id.$oid;
        console.log("Setting active chat to " + activeMentee); 
        bottom = 0;
        
        //clear out li's classes
        Array.each($(activeMentee).getParent().getSiblings(), function(e, index){
            e.setProperty('class','none');
        });
        
        //set this a's li to current
        $(activeMentee).getParent().setProperty('class','current');

        $('question').setProperty('html','<h1>'+question.seed+'</h1>');
        $('chatBox').focus();    
    }
    
    function populateQuestions(){
        var jsonRequest = new Request.JSON({url: '/api/unanswered', 
              onSuccess: function(response){                                                    
                  $('linkList').empty();
                  Array.each(response, function(question, index){                      
                      var questionLink = new Element('a',{
                          id:question._id.$oid, 
                          href:'#', 
                          html:question.seed,
                          events: {
                              click: function(){
                                  setActiveChat(question);
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
            var theHtml = '<p><span class="Gibson-SemiBold">' + json.name + ': </span>' + message + '</p>';
            var m = new Element( 'div.chatMsg', {id:message+"_", html:theHtml} );
            
            $('messages').grab(m);
            
            //really ghetto scrolling hack
            bottom = bottom + parseInt($('messages').getSize().y) + parseInt(m.getSize().y);
            $('messages').scrollTo(0, bottom);
            
        }else{
            //TODO:  Deal with it some other way.
            console.log("Got some other message");
        }
       
    }
    
    now.incomingError = function(msg){
        console.error("Server error: " + msg);
    }
    

    //alert("READY");
    $('chatError').hide();
    populateQuestions();    
    
    
});