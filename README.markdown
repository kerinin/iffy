jQuery Finite State Machine Plugin
=============

A plugin for jQuery for building FSM's in javascript - based on [Pluginaweek's state_machine Rails plugin](http://github.com/pluginaweek/state_machine)


Usage
=============

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

State syntax:

    $fsm_state( 'selector', 'markup');                                // parses the markup into a DOM node and inserts it inside selected elements
    $fsm_state( 'selector', DOM_node);                                // inserts the node inside the selected elements
    $fsm_state( 'selector', $other_state['other_state_selector'] );   // (inheritance) inserts the contents of $other_state into the selected elements 
    $fsm_state( 'selector', this );                                   // (dynamic content) inserts this['selector'] into the selected elements
    $fsm_state(['selector1','markup1'], ['selector2','markup2']);     // (multiple assignment) accepts any of the above syntaxes


NOTES

* what are the implications of allowing dynamic content?  My hope is that since the dynamic content is
  restricted to a selector, and this selector will be over-written by any other states (excluding inheritance)
  that this won't be a problem.  It may make sense to do one or the other though, or simply to prevent
  dynamic content from being inherited.  Needs more thought...


Things to be aware of

* If multiple states define markup for different selectors (#header, #login_form, etc), the innerHTML 
  of these selectors will be set to null unless markup is defined.  IE, when the state 'no_user' is
  active, #login_form, #messages and #progress bar will all have their innerHTML cleared
* The FSM's parent node (#foo in this case) will have the class of its current state, so if
  the active state is 'logging-in', #foo will have the class 'logging-in'.  This allows you to define
  state-specific CSS and to easily see what the current state is by looking at the DOM (say, in firebug)
* The before and after callbacks should not affect the UI's state - this would re-introduce the very
  problems using a FSM is intended to avoid
