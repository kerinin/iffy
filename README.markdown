jQuery Finite State Machine Plugin
=============

A plugin for jQuery for building FSM's in javascript - based on [Pluginaweek's state_machine Rails plugin](http://github.com/pluginaweek/state_machine)


Usage
=============
NOTES

* The problem here is obvious; we don't know what the user markup will be before 
  we recieve the successful login response

    <script type='text/javascript'>
      options = {
        'initial_state' : 'no_user',
        'states' : {
          'no_user' : $fsm_state.new().add_attribute('#header', '(no user header markup)'),
          'logging-in' : $fsm_state.new('#login_form', '(login form markup)'),
          'submitted-login' : $fsm_state.new( [ ['#login_form',null], ['#progress_bar','(progress markup)'] ] ),
          'user' : [ ['#header', '(user header markup)'], ['#messages','(user messages)'] ]
          },
        'events' : {
          'show_login_window' : function(){ this.transition( { 'from':'no_user', 'to':'logging_in' } ); },
          'submit_login_window' : function(){ this.transition( { 'from':'logging-in', 'to':'submitted_login' } ); },
          'successful_login' : function(){ this.transition( { 'from':'submitted-login', 'to':'user' } ); },
          'failed_login' : function(){ this.transition( { 'from':'submitted-login', 'to':'logging-in' } ); },
          'logout' : { 'user' : 'no_user' }
        },
        'after_transition' : {
          'successful_login' : function(){ alert('hey!'); },
          'failed_login' : function(){ alert('fail!'); }
        }
      }
      $fsm = $('#foo').fsm( options );
    </script>

    <a href='/login' id='login-button' onclick="$fsm.transition('login')">login</a>

Things to be aware of

* If multiple states define markup for different selectors (#header, #login_form, etc), the innerHTML 
  of these selectors will be set to null unless markup is defined.  IE, when the state 'no_user' is
  active, #login_form, #messages and #progress bar will all have their innerHTML cleared
* The FSM's parent node (#foo in this case) will have the class of its current state, so if
  the active state is 'logging-in', #foo will have the class 'logging-in'.  This allows you to define
  state-specific CSS and to easily see what the current state is by looking at the DOM (say, in firebug)
* The before and after callbacks should not affect the UI's state - this would re-introduce the very
  problems using a FSM is intended to avoid
