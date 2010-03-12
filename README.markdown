Iffy
=============

What is Iffy?
-------------

Iffy makes dynamic UI's easier to develop and test by providing a simple way to check that the UI's
current state matches what you expect it to be before executing an event.  The objective is to keep
your UI behaving properly.

Iffy has two main components; signatures and an event handler.  Events are associated with a
set of signature/action pairs - when an event is passed to the handler it searches for the first 
signature which matches the UI's current state and executes the associated action, making the UI's
behavior context-sensitive.

Aside from providing a framework for complex if/then chains, this approach treats integration testing,
validation, and domain logic as a unified process.  Signatures are given a an execution level (ie
debug, info, warn, fatal, etc) which controls which signatures should be matched in a given environment.
This lets you define signatures for debugging the UI during development, ensuring the UI is in an expected 
state before DOM manipulation, validating form input, checking UI modes, etc.

Signatures are composable.  Each signature is defined by a name and set of binary functions.  These can 
be arbitrary functions, DOM inspections, form validators, or (most importantly) references to other signatures.
Signatures are intended to be built as hierarchy from general to specific; at the top of the hierarchy
would be natural-language selectors describing the intended behavior of the system (ie 'ready-to-submit-form'
 or 'viewing-tab-2').  The bottom of the heirarchy would describe specific implementation details (ie 
 'login-form-email-valid', 'icon-source-foo').  This allows domain logic to be defined in comprehensible
 terms which are implementation-agnostic.

Iffy grew out of a frustration with the current javascript testing frameworks and was inspired in part
by the Cucumber integration testing library.  Cucumber implements a Given/When/Then approach to testing
using natural-language parsers to map a set of descriptions of a site's intended behavior to a set of
tests to verify that behavior.  Iffy takes a slightly different approach by blurring the distinction 
between testing and domain logic.  More discussion of the theoretical basis of Iffy at the end.


Usage
-------------

_Setup_

    >> $$ = iffy( level, [level hierarchy] )

    $$ = iffy( 'warn', ['debut', 'info', 'warn', 'fatal'] ) => checks signatures with level 'warn' and 'fatal'

This initializes the state machine and sets the execution level and hierarchy.  If these two are omitted
all signatures will be checked. 

_Signatures_

    >> signature( machine, name, conditions, level)
    >> machine.matchers.push( matcher_function )

    $$.matchers.push( function(m){ if(m instanceof String) jQuery(m) ? 1 : -1 } )

    $$.sig( name, conditions, level )
    $$.sig( 'foo', '#bar' )
    $$.sig( 'foo', function(){ !bar }, 'warn' )
    $$.sig( 'foo', ['#bar', signature('baz')], 'debug' )

    $signature.matches() => 1 iff all conditions return 1
    $$.is_foo() => $asm.signatures['foo'].matches()

Conditions can be a jquery selector or a function which returns 0/1 or another signature.  A new signature
with null conditions searches for existing signatures of the same name.  Multiple condition assignment
to a signature name raises an error.  Signatures return true if their level is below the ASM's.

You can define a matcher to parse conditions.  Matchers should accept a single argument and return 1 for
a match, -1 for no match, and 0 or null if the argument can't be parsed.  The machine has a list named
'matchers' which it searches sequentially.


_Guards_

    >> guard( machine, event, signature, action )

    $$.guard( 'action1', $signature, function(options){ alert(options['foo']); alert(options['bar']); } )
    $$.guard( 'action1', $signature, "var foo = bar;" )

Multiple guards with the same name will be searched sequentially when the event is fired - only the 
first matching guard will be executed.  Signatures must be an instance of the signature class. 
The action can be either a function (which will be called) or text (which will be eval'd).  If a
function with arguments is used, the second argument to do() will be passed (if present).


_Guard Groups_

    >> group( machine, event, guards, return_true_if )

    $$.group( 'action1', [guard1, guard2], 'all')

A guard group defines a named set of guards.  Like a guard, a guard group
is called by events, and exists in the execution list of an event.  The difference between defining
a list of guards and defining a guard group is that if any guard in a group can execute, *all* the
non-blocking guards in the group are executed.  If all guards in a group are blocking, the next item
in the list (a guard or guard group) will be checked.  This allows behavior such as multi-field input
validation - when a form submit button is clicked it checks a series of signatures on the inputs and
any guards whose signature matches input errors (missing fields, improper emails, etc) can execute code
to signal the problem to the user.

_Events_

    >> $$.do( name, options )

    if( $$.is_foo() ) bar();
    if( $signature.matches() ) bar();

Events are triggered with the 'do' function.  Note that the signatures can be used outside the event handler
if needed.



Theory
-------------

Cucumber's Given/When/Then testing approach has been compared[1] to a finite state machine; givens define 
states, when's define state transitions, and then's define the expected resulting state.  While finite
state machines are an interesting intepretation of integration testing, their utility is limited to testing
and UI's whose states can be defined a-priori.  Ajax interfaces are by their nature difficult to put in
this box.

Iffy was designed as a special case of an Abstract State Machine[2] - a generalization of the FSM.
Briefly: ASM's are defined by a set of signatures and corresponding actions.  Given a state A, the actions
associated with all signatures matching A are performed, resulting in A' - this process is repeated
until no signatures match.  As opposed to a Finite State Machine which is defined by states and transitions,
and ASM is defined by signatures and transitions.  Iffy specializes the theoretical model by using an 
event-driven approach; signatures are only matched when called explicitly or when an event is fired.

ASM's are useful because signatures are defined for arbitrary data structures and are themselves composable.
This allows us to define signatures as tree structures moving from general to specific; general signatures 
can be natural-language conceptual descriptions which are refined into implementation-specific code.
In this way implementation details can be changed without breaking the UI.

1 http://blog.objectmentor.com/articles/2008/11/27/the-truth-about-bdd

2 http://www.di.unipi.it/~boerger/Papers/Methodology/HighLevelDesign99.PDF
