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
* If multiple replacements are specified for a given state and some of the insertions are within the
  DOM node of others, the 'parent' insertions should be specified before the 'child' insertions.
  Insertions are processed sequentiall, and if other states have modified the DOM tree (ie removed
  the child selectors), the parent insertion should be executed first to put the tree in a usable
  state.


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

* what are the implications of async processing? Async requests can be thought of as internal or 
  external to the machine; internal requests would be where a state exists which is 'waiting' for the
  response (possibly with a cancel option).  External requests can be thought of as the machine 
  sending  and recieving signals via the ajax request (in the same way it does via forms and events).
* what are the implications of allowing dynamic content?  My hope is that since the dynamic content is
  restricted to a selector, and this selector will be over-written by any other states that this won't 
  be a problem. 
* We're handling conditional events by allowing fallbacks; if a condition isn't met it will continue 
  searching events with the same name until one passes.  This leaves the issue of blocked events. 
  Blocked events should probably either be disabled in the UI or throw some type of error (failing
  silently seems like a bad idea)
* testing?  associated with states?


Abstract State Machine
==========
Abstract state machines differ from FSM's in that the states are arbitrary.  Rather than defining
a set of states, we define a set of signatures, guards and associated actions.  Signatures are checked
in parallel continuously; any guard whose signatures match the state is executed.

The benefit here is that 1) the state of the UI can be far more diverse and 2) guards can be
hierarchical, allowing the system to be designed from general principles to specific implementations.
This causes a trade-off; the system cannot be automatically tested (becasue the states aren't 
finite and the transitions aren't known), however testing of a given transition sequence is
baked-in; each transition step is tested before execution.  In other words, we can verify at
execution that any action is valid, however we are forced to explicitly define which execution
sequences are 'important'.

What's not clear is if this actually helps anything; does hard-coding the testing into the
UI help, or does it simply move the test logic out of a set of tests (which will be executed
once for the codebase) into the UI (where they will be continuously executed).  The benefit
of doing them in the UI is that it prevents the UI from crashing, at the cost of preventing
the user to do things they may want to do. (this all assumes the guards are properly and 
sufficiently designed of course.)

The problem with the FSM model is that the states aren't in fact finite for an AJAX application;
any state requiring a page load returns new results.  Allowing variable states takes us out of
the FSM model.  I don't think it makes any sense to bother with this approach really - the only 
real question is if it's worth the time to implement an ASM.

What would an implementation look like?  It could be freely mixed with existing code.  So long as
state changes trigger re-evaluation of the signatures, there wouldn't be any need to modify an existing
layout.

Lets think some about the signatures.  They'd need to be named (to allow composition).  Each signature
would consist of a set of tests or other signatures and return a boolean value if they're all satisfied 
(or conditions would be implemented through multiple guards).  How do we handle references to 
undefined signatures?  If undefined defaults to false, it requires the full spec to be defined before
execution.  If it defaults to true, we can build them out as needed, however we might get false
positives.  I think I'd prefer to build out through addition and default to false.

Signatures themselves could be take events, selectors, functions, or strings (references).  Some disambiguation 
would be required between selectors and references.  Maybe we allow multiple assignment to signature
names, so you could simply create a new signature to reference one - if the signature exists it would return
the signature, otherwise it would return a new instance and add it to a list of known guards.  In this case,
we'd probably only want to allow multiple assignment by name - if the signature definition were allowed
to be changed it would raise questions of replace/append.  This could also lead to spaghetti code.

So how would programming this work?  Programming would be reduced to writing a signature hierarchy and a set of 
guards (defined as signature/action pairs).

Coming back to usefulness, what we're essentially doing is developing a complicated if/then system where 
ifs are named and composable, and all the if/thens are executed continuously.  The parallel if testing
could present a computation expense problem, we would need to establish a set of triggers for executing
each test for it to be efficient, probably taking into account nested signatures.

We can't even ensure that the UI is always valid; if we allow actions to be executed outside the ASM,
all we can verify is that ASM actions are valid.  So ideally the ASM would take over all execution.  Taking
over execution wouldn't be that hard - simply find any elements with behavior, replace the behavior with
an event trigger, and make a guard dependent on that trigger which fires the original behavior.

OK, so here's what we get:
* ability to define a DSL with baked-in compliance testing at execution time
* known-compliant UI at all times (given a correct signature hierarchy)
* easy testing of action paths

To do this we would need to:
* redesign the interactive helpers (to trigger events and define guards)
* define a signature parser/tester
* define guards (actions & signature reference)
* define a testing algorithm for signatures (for caching values)
* build a converter for legacy code


Modified ASM
=============

Rather than using the formal ASM definition, what if we modified it slightly.  The system would be 
composed of signatures, guards, and events.  Guards would be the same; a [signature,action] pair, but
we add an event type which represents an ordered set of guards.  The primary difference is that
signatures would only be computed when an event is called, and then only the signatures associated
with one of the event's guards.  The guards would be search sequentially until a signature was
found to be valid, at which point the action would be executed.

This eliminates the caching problem and works well with the js event model.  Simple events (with only
one guard) could be used inline using an if statement.  More complex ones could be called by name.

The benefit here is that it's *way* simpler, but still provides the composable signature approach
and integrated compliance testing.  Most importantly, it can be easily mixed with other approaches,
and can be used partially without complication.

This could be seen as a less general ASM; all guards have an implicity 'just executed' signature
as well as an 'executed event' signature.

We could also refine this some by noticing that there is a gradient from 'testing' to business logic;
during development you just want to make sure the things working, so you define signatures to 
represent that.  In production, you might still need input validation, and you will probably want
behavior to be state-specific.  These cases can all be accomplished with signatures, but it points to
a way of differentiation the scope of a signature - say debug > info > warn > fatal or somthing - 
the UI could be set to one of these levels, and any signatures 'below' that level would simply 
return true.  This would allow you to test DOM manipulation at the debug level, but move form validation
to the warn level, and wrap the whole thing in a fatal test in case the JS explodes.

A final touch: guard groups.  A guard group defines a named set of guards.  Like a guard, a guard group
is called on by events, and exists in the execution list of an event.  The difference between defining
a list of guards and defining a guard group is that of any guard in a group can execute, *all* the
non-blocking guards in the group are executed.  If all guards in a group are blocking, the next item
in the list (a guard or guard group) will be checked.  This allows behavior such as multi-field input
validation; when a form submit button is clicked, it first checks a series of signatures on the inputs,
any guards whose signature matches input errors (missing fields, improper emails, etc) can execute code
to signal to the problem to the user.

Signature API
-----------

    signature( machine, name, conditions, level)

    $asm.signature( name, conditions, level )
    $asm.signature( 'foo', '#bar' )
    $asm.signature( 'foo', function(){ !bar }, 'warn' )
    $asm.signature( 'foo', ['#bar', signature('baz')], 'debug' )

    $signature.matches() => 1 iff all conditions return 1
    $asm.is_foo() => $asm.signatures['foo'].matches()

Conditions can be a jquery selector or a function which returns 0/1 or another signature.  A new signature
with null conditions searches for existing signatures of the same name.  Multiple condition assignment
to a signature name raises an error.  Signatures return true if their level is below the ASM's.


Guard API
-----------

    guard( machine, event, signature, action )

    $asm.guard( 'action1', $signature, function(options){ alert(options['foo']); alert(options['bar']); } )
    $asm.guard( 'action1', $signature, "var foo = bar;" )

Multiple guards with the same name will be searched sequentially when the event is fired - only the 
first matching guard will be executed.  Signatures must be an instance of the signature class. 
The action can be either a function (which will be called) or test (which will be eval'd).  If a
function with arguments is used, the second argument to $asm.do() will be passed (if present).

Event API
-----------

    $asm.do( name, options )

    if( $asm.signature('foo') ) bar();

Events are triggered with the 'do' function.  Note that the signatures can be used outside the ASM if needed.


Conclusion
-----------

So, what does this get us?  Debugging can be as simple as defining a fallback guard.  We can put all our
integration test logic in a neat list in the document (possibly dynamically excluding tests below the logging
level), and we can clearly show how the behavior should work by defining guards.  This should make our code
a lot cleaner (less inline JS).  We can define a fairly simple test helper like assert_signature which checks
to see if a signature is matched.  We can extend functions like remote_form_for with a :do param replacing 
:conditions and :before (this would also need to intercept the inline JS).  We can build RJS helpers for 
the classes eliminating the need for JS files.
