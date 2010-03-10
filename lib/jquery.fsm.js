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
  $.fsm = function(options) {
		this.events = {};
		this.states = {};
		this.callbacks = {'before' : [], 'after' : []};
		//this.messages = options['messages'] || {};
		//this.action = options['action'];
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
      event = $.fsm_event.new( this, event_name, from_states, to_state, conditions );
      
      // first event with this name
      if( !( event_name in this.events ) ) this.events[event_name] = [ event ];
      // fallback events
      else this.events[event_name].push( event );
      
      // update states
      this.add_states(from_states);
      this.add_staes(to_state);
    }
    
    return this;
  };

	// initial_state

	// invalidate

  // defines a state
  $.fsm.state = function(state_names, selectors, content, options){
    if( !( state_names instanceof Array ) ) state_names = [state_names];
    
    states = add_states(state_names);
    
    for( state in states ) {
      state.value = (value in options) ? options['value'] : this.name
      state.matcher = options['if'];
      state.selectors = selectors;
      state.context(content);
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
	$.fsm.add_states = function(state_names){ 
	  return $.map( state_names, function(name) {
	    if( !(this.states[state_name] ) ) this.states[state_nmae] = $.fsm_state.new(state_name);
	    return state;
	  } );
	};

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
	$.fsm_guard = function(settings) { 
	  assert_valid_keys(options, :from, :to, :except_from, :if, :unless) if (options.keys - [:from, :to, :on, :except_from, :except_to, :except_on, :if, :unless]).empty?

	  return this; 
	}	
	
	
	// FSM Event
	// =========================
	$.fsm_event = function(machine, event_name, from_states, to_state, conditions) { 
	  this.machine = machine;
	  this.name = event_name;
	  this.from_states = (from_states instanceof Array) ? from_states : [from_states];
	  this.to_state = to_state;
	  this.conditions = (conditions instanceof Array) ? conditions : [conditions];
	  this.guards = [];
	  this.known_states = [];
	  
	  this.add_actions()
	  
	  return this;
	};
	
	// add_actions
	$.fsm_event.add_actions = function(){
	  this.machine['can_'+this.name] = function(){ return this.can_fire(); };
	  this.machine[this.name+'_transition'] = function() { return this.transition_for(); };
	  this.machine[this.name] = function(){ return this.fire(); };
	};
	
	// can_fire
	$.fsm_event.can_fire = function() {
	  return this.transition_for != false;
	}
	
	// fire
	$.fsm_event.fire = function() {  
	  if( var transition = transition_for(this) ) transition.perform();
	}
	
	// transition
	$.fsm_event.transition = function(options) {
    guard = $.fsm_guard.new(options.merge(:on => name));
    
    this.guards.pop( guard );
    this.known_states.concat( guard.known_states() );
	}
	
	// transition_for
	$.fsm_event.transition_for = function( requirements ){
	  if( !requirements['from'] ) requirements['from'] = this.machine.states[this.name].name;
	  
	  for( guard in this.guards ) {
	    if( var match = guard.match(this, requirements) ) {
	      from = requirements['from'];
	      to = match['to'].values.len ? match['to'].values[0] : from;
	      
	      return $.fsm_transition.new( this, this.machine, this.name, from, to );
	    }
	  }
	  
	  return false;
	};


	// FSM Event Collection
	// =========================
	$.fsm_event_collection = function(settings) {};
	
	// transitions_for
	
	// valid_for


	// FSM State
	// =========================
	$.fsm_state = function(machine, state_name, options) {
	  this.machine = machine;
	  this.name = state_name;
	  this.value = ('value' in options) ? options['value'] : state_name;
	  this.matcher = options['if'];
	  this.methods = {};
	  this.initial = options['initial'];
	  
	  this.add_predicate();
	};
	
	// final 
	
	// description
	
	// value
	
	// matches
  $.fsm_state.matches = function(other_value) {
    // NOTE: the matcher function may be a by-product of ruby lambdas - ie it might not be necessary
    this.matcher ? this.matcher(other_value) : other_value == this.value
  };
  
	// context
	$.fsm_state.context = function(content) {
	  // update content (?)
	};
	
	// call
	
	// add_predicate
	$.fsm_state.add_predicate = function(){
	  this[this.name] = function(){ this.machine.state.matches(this.name); };
	};
	

	// FSM State Collection
	// =========================
	$.fsm_state_collection = function(options) {};
	
	// match
	
	// matches
	
		
	// FSM Transition
	// =========================
	$.fsm_transition = function(settings){};
	
	// action
	
	// after
	
	// before
	
	// callback
	
	// reset
	
	// perform
	$.fsm_transition.perform = function(){
	  if( this.before() ) {
	    // make the DOM changes
	    
	    this.after()
	    return true;
	  } else { this.rollback() }
	  return false;
	};
	
		
})(jQuery);
