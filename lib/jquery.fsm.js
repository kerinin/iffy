// $("p:regex('[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}')")
jQuery.extend(
    jQuery.expr[':'], {
        regex: function(a, i, m, r) {
            var r = new RegExp(m[3], 'i');
            return r.test(jQuery(a).text());
        }
    }
);

(function($) {

	// Finite State Machine
	// =========================
  $.fsm = function(settings) {
		this.events = $.fsm_event_collection.new(self);
		this.states = $.fsm_state_collection.new(self);
		this.callbacks = {'before' : [], 'after' : []};
		//this.messages = settings['messages'] || {};
		//this.action = settings['action'];
		self.initial_state = options['initial'];
		
		return this;
	};

  // defines a before_transition
  $.fsm.before_transition = function(arg1, arg2){    
    this.add_callback( 'before', arg1, arg2);
    
    return this;
  };

  // defines an after_transition
  $.fsm.after_transition = function(arg1, arg2){
    this.add_callback( 'after', arg1, arg2);
    
    return this;
  };

  // defines an event
  $.fsm.event = function( names, from_states, to_state, conditions ){
    // if a single event is given, insert it into an array
    if( !(names instanceof Array) ) names = [names];
    
    for( event_name in names ) {
      // first event with this name
      if( !( event_name in this.events ) ) this.events[event_name] = [ Event.new( event_name, from_states, to_state, conditions ) ];
      // fallback events
      else this.events[event_name].push( $.fsm_event.new( event_name, from_states, to_state, conditions ) );
      
      // update states
      this.add_states(from_states);
      this.add_staes(to_state);
    }
    
    return this;
  };

	// initial_state

	// invalidate

  // defines a state
  $.fsm.state = function(state_names, selectors, content){
    this.add_states(state_names);
    
    for( state in this.states ) {
      state.matcher = selectors;
      state.content = content;
    }
    
    return this;
  };

	// private functions
  // -------------------------

	// add_callback
	$.fsm.add_callback = function(type, arg1, arg2){ 
	  options = {'type' : type};
	  
	  // simple function
	  if( arg2 == null && (arg1 instanceof Function) ) options['do'] = arg1;
	  else if( arg2 == null ) options = arg1;
    else {
      options['transitions'] = arg1;
      options.concat( arg2 );
    }
	
    callback = $.fsm_callback.new(options);
    this.callbacks[type].pop( callback );
    
    this.add_states( callback.known_states() ;
  };
  
	// add_states
	$.fsm.add_states = function(){ return this.states; };

  // accessors & fsm methods
  // -------------------------

  // .state

  // .state_name

  // .is_<state_name>

  // .<property>

  // .<transition>()

  // .is_<state_name>()

	// other
	// -------------------------

  // observers?

	// autotest

	// graphs


	// FSM Callback
	// =========================
	$.fsm_callback = function(settings){ return this; };
	
	// call
	
	// known_states
	
	// new
	$.fsm_callback.init = function(options) {
	  this.guard = $.fsm_guard.new(options);
	  
	  return this;
	}    
		
		
	// FSM Guard
	// =========================
	$.fsm_guard = function(settings) { return this; }	
	
	
	// FSM Event
	// =========================
	$.fsm_event = function(event_name, from_states, to_state, conditions) { 
	  return this;
	};
	
	// add_actions
	
	// can_fire
	
	// fire
	
	// transition


	// FSM Event Collection
	// =========================
	$.fsm_event_collection = function(settings) {};
	
	// transitions_for
	
	// valid_for


	// FSM State
	// =========================
	$.fsm_state = function(settings) {};
	
	// call
	
	// matches
	

	// FSM State Collection
	// =========================
	$.fsm_state_collection = function(settings) {};
	
	// match
	
	// matches
	
		
	// FSM Transition
	// =========================
	$.fsm_transition = function(settings) {};
	
	// action
	
	// after
	
	// before
	
	// callback
	
	// reset
	
	// perform
	
		
})(jQuery);
