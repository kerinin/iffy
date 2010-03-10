jQuery Finite State Machine Plugin
=============

A plugin for jQuery for building FSM's in javascript - based on [Pluginaweek's state_machine Rails plugin](http://github.com/pluginaweek/state_machine)


Basic Approach
=============

An instance jQuery.fsm Finite State Machine is associated with a DOM node.  jQuery.fsm makes some assumptions about your UI.  

1) The state of the FSM is exclusively defined by the DOM tree of its associated node
2) All modifications of the FSM's DOM tree is accomplished through state changes
3) State changes are executed by calling one of the FSM's events

A few notable consequences of these assumptions:

* Javascript is used only to control the DOM; it is not used to store state information.
* Adding classes and  inserting or removing elements to an FSM isn't encouraged
* Element behavior should be static - dynamically modifying event handlers within the DOM tree isn't encouraged.


Things to be aware of

* If multiple states define markup for different selectors (#header, #login_form, etc), the innerHTML 
  of these selectors will be set to null unless markup is defined.  IE, when the state 'no_user' is
  active, #login_form, #messages and #progress bar will all have their innerHTML cleared
* The FSM's parent node (#foo in this case) will have the class of its current state, so if
  the active state is 'logging-in', #foo will have the class 'logging-in'.  This allows you to define
  state-specific CSS and to easily see what the current state is by looking at the DOM (say, in firebug)
* The before and after callbacks should not affect the UI's state - this would re-introduce the very
  problems using a FSM is intended to avoid


Usage
=============

    <script type='text/javascript'>
      options = {
        'initial_state' : 'no_user',
        'states' : {
          'no_user' : $fsm_state.new().add_attribute('#header', '(no user header markup)'),
          'logging-in' : $fsm_state.new('#login_form', '(login form markup)'),
          'validation-error' : #fsm_state.new('#login_form', '(validation help text)'),
          'submitted-login' : $fsm_state.new( [ ['#login_form',null], ['#progress_bar','(progress markup)'] ] ),
          'user' : [ ['#header', '(user header markup)'], ['#messages','(user messages)'] ]
          },
        'events' : {
          'show_login_window' : function(){ this.transition( { 'from':'no_user', 'to':'logging_in' } ); },
          'submit_login' : function(){ this.transition( { 'from':'logging-in', 'to':'submitted_login' } ); },
          'successful_login' : function(){ this.transition( { 'from':'submitted-login', 'to':'user' } ); },
          'failed_login' : function(){ this.transition( { 'from':'submitted-login', 'to':'logging-in' } ); },
          'logout' : { 'user' : 'no_user' }
        },
        'after_transition' : {
          'successful_login' : function(){ alert('hey!'); },
          'failed_login' : function(){ alert('fail!'); }
        },
        'before_transition' : {
          'submit_login' : function(){ check_valid_email(); check_password_entered(); }
        }
      }
      $fsm = $('#foo').fsm( options );
    </script>

    <a href='/login' id='login-button' onclick="$fsm.transition('login')">login</a>


State syntax:
------------

    $fsm.state( 'name', 'selector', 'markup');                                // parses the markup into a DOM node and inserts it inside selected elements
    $fsm.state( 'name', 'selector', DOM_node);                                // inserts the node inside the selected elements
    $fsm.state( 'name', 'selector', $other_state['other_state_selector'] );   // (inheritance) inserts the contents of $other_state into the selected elements 
    $fsm.state( 'name', 'selector', 'this' );                                   // (dynamic content) inserts this['selector'] into the selected elements


Event syntax:
------------

    $fsm.event( name, from_state(s), to_state, condition(s))
    $fsm.event( 'submit_login', 'logging-in', 'submitted-login', ["#email:regex('(.*)@(.*).(.*)')", '#password'] )
    $fsm.event( 'submit_login', 'logging-in', 'validation-error' )

Conditions should be a jQuery selector.  The event will fire if the selector returns a result.  jQuery.fsm defines
a helper method :regex() which can be included in queries to make searches more flexible.

Defining multiple events with the same name will treat the events as if/else statements; the first event will
be fired if its conditions are met, else the next event will fire and so on.

The from_state can be either a state name or a list of state names.


Before / After Transition syntax:
------------

    $fsm.[before/after]_transition( function(){} )
    $fsm.[before/after]_transition( {from_state : to_state}, { 'do' : function(){} } )
    $fsm.[before/after]_transition( [{'all' : to_state}, {from_state : 'all - [state1, state2]'}], { 'do' : function(){} } )
    $fsm.[before/after]_transition( {'any' : 'same'}, { 'on' : 'event_name', 'do' : function(){} } )
    $fsm.[before/after]_transition( {'any' : 'any'}, { 'on' : 'all - event_name', 'do' : function(){} } )
    $fsm.[before/after]_transition( {'any' : 'any'}, { 'on' : 'all - [event_name1, event_name2]', 'do' : function(){} } )
    $fsm.[before/after]_transition( { 
      'from' : state, 
      'to' : state, 
      'on' : event, 
      'except_from' : state, 
      'except_to' : state, 
      'except_on' : event } )
    $fsm.[before/after]_transition( { 
      'from' : [state1, state2], 
      'to' : [state1, state2], 
      'on' : [event1, event2], 
      'except_from' : [state1, state2], 
      'except_to' : [state1, state2], 
      'except_on' : [event1, event2] } )

'all' and 'any' have the same meaning; match any state.  States can be excluded from 'all' using the syntax
'all - state' or 'all - [state1, state2]'.  'same' matches when a state is being transitioned to itself, and
should be used as the second argument.  The 'on' parameter specifies which events the transition should be 
fired for, and can be specified using 'all' with the same exclusive syntax.


NOTES

* what are the implications of allowing dynamic content?  My hope is that since the dynamic content is
  restricted to a selector, and this selector will be over-written by any other states that this won't 
  be a problem. 
* We're handling conditional events by allowing fallbacks; if a condition isn't met it will continue 
  searching events with the same name until one passes.  This leaves the issue of blocked events. 
  Blocked events should probably either be disabled in the UI or throw some type of error (failing
  silently seems like a bad idea)
* testing?  associated with states?
