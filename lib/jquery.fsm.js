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
  $.fn.fsm = function(options) {
    if(options == null) options = {};
    
		this.events = {};
		this.states = {};
		this.callbacks = {'before' : [], 'after' : []};
		//this.messages = options['messages'] || new Array();
		//this.action = options['action'];
		self.initial_state = ('initial' in options) ? options['initial'] : null;

    // defines a before_transition
    this.before_transition = function(arg1, arg2){    
      this.add_callback( 'before', arg1, arg2);
      
      return this;
    };

    // defines an after_transition
    this.after_transition = function(arg1, arg2){
      this.add_callback( 'after', arg1, arg2);
      
      return this;
    };

    // defines an event
    this.event = function( names, from_states, to_state, conditions ){
      // if a single event is given, insert it into an array
      if( !(names instanceof Array) ) names = [names];
      if( !(from_states instanceof Array) ) from_states = [from_states];
      
      for( i in names ) {
        event_name = names[i];
        
        event = $.fsm_event( this, event_name, from_states, to_state, conditions );
        
        // first event with this name
        if( !( event_name in this.events ) ) this.events[event_name] = [ event ];
        // fallback events
        else this.events[event_name].push( event );
        
        // update states
        this.add_states(from_states);
        this.add_states([to_state]);
      }
      
      return this;
    };

	  // initial_state

	  // invalidate

    // defines a state
    this.state = function(state_names, selectors, content, options){
      if( !( state_names instanceof Array ) ) state_names = [state_names];
      if( !options ) options = {};
      
      states = this.add_states(state_names);
      
      for( i in states ) {
        state = states[i];
        
        state.value = ('value' in options) ? options['value'] : this.state_name
        state.matcher = options['if'];
        state.selectors = selectors;
        //state.context(content);
      }
      
      return this;
    };

	  // private functions
    // -------------------------

	  // add_callback
	  this.add_callback = function(type, arg1, arg2){ 
	    options = {'type' : type};
	    
	    // simple function
	    if( arg2 == null && (arg1 instanceof Function) ) options['do'] = arg1;
	    else if( arg2 == null ) options = arg1;
      else {
        options['transitions'] = arg1;
        options.concat( arg2 );
      }
	
      callback = $.fsm_callback(options);
      this.callbacks[type].pop( callback );
      
      this.add_states( callback.known_states() );
    };
    
	  // add_states
	  this.add_states = function(state_names){ 
	    ret = [];
	    for(i in state_names) {
	      state_name = state_names[i];
	      
	      if( !( state_name in this.states ) ) this.states[state_name] = $.fsm_state(this, state_name);
	      ret.push( this.states[state_name] );
	    }
	    return ret;
	  };

		//this.define_instance_method = function(method_name, instance_function){
			// It looks like this is calling the function on a blank state machine and passing
			// the actual state machine as the 'object' parameter.  I can only assume this
			// is intended to isolate each call from the machine's state.
			
			// nevermind - the function call is find_or_create - it's basically checking to see
			// if the statemachine is being instantiated or retrieved. That doesn't explain the second 
			// parameter though (the self/object bit)
			
			// This is inheritance - think.
			
			// Regardless, the 'object' parameter is the calling state machine
			
			// I'm going to drop this unless it becomes necessary
			
			//this[method_name] = function(args){ instance_function(this, args); };
		//};
		
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
	  
		return this;
	};

	// FSM Callback
	// =========================
	$.fsm_callback = function(settings){ 
	
	  // call
	
	  // known_states
	
	  // new
	  this.init = function(options) {
	    this.guard = $.fsm_guard(options);
	    
	    return this;
	  }    
	  
    return this; 
  };

		
	// FSM Guard
	// =========================
	$.fsm_guard = function(settings) { 
	  //assert_valid_keys(options, :from, :to, :except_from, :if, :unless) if (options.keys - [:from, :to, :on, :except_from, :except_to, :except_on, :if, :unless]).empty?

	  return this; 
	}	
	
	
	// FSM Event
	// =========================
	$.fsm_event = function(machine, event_name, from_states, to_state, conditions) { 
	  this.machine = machine;
	  this.event_name = event_name;
	  this.from_states = (from_states instanceof Array) ? from_states : [from_states];
	  this.to_state = to_state;
	  this.conditions = (conditions instanceof Array) ? conditions : [conditions];
	  this.guards = [];
	  this.known_states = [];
	
	  // add_actions
	  this.add_actions = function(){
	    // jQuery wants methods to return _this_, which means the machine.event() function
	    // doesn't work the same as state_machine.  Instead we're using the events array...
	    event_name = this.event_name;
	    this.machine['can_'+this.event_name] = function(){ return this.events[event_name].can_fire(); };
	    this.machine[this.event_name+'_transition'] = function() { return this.events[event_name].transition_for(); };
	    this.machine[this.event_name] = function(){ return this.events[event_name].fire(); };
	  };
	
	  // can_fire
	  this.can_fire = function() {
	    return this.transition_for() != false;
	  };
	
	  // fire
	  this.fire = function() {  
	    if( transition = this.transition_for() ) transition.perform();
	  };
	
	  // transition
	  this.transition = function(options) {
      guard = $.fsm_guard(options);
      
      this.guards.pop( guard );
      this.known_states.concat( guard.known_states() );
	  };
	
	  // transition_for
	  this.transition_for = function( requirements ){
			if( !(requirements instanceof Object) ) requirements = {};
	    if('from' in requirements) custom_from_state = requirements['from'];
			else requirements['from'] = this.machine.states.match().name;
	    
	    for( i in this.guards ) {
	      guard = this.guards[i];
	      if( match = guard.match(this.machine, requirements) ) {
	        from = requirements['from'];
	        to = match['to'].values.len ? match['to'].values[0] : from;
	        
	        return $.fsm_transition( this.machine, this.event_name, from, to, !custom_from_state );
	      }
	    }
	    
	    return false;
	  };
	  
	  this.add_actions();
	  
	  return this;
	};

	// FSM Event Collection
	// =========================
	$.fsm_event_collection = function(settings) {
	
	  // transitions_for
	
	  // valid_for

    return this
  };

	// FSM State
	// =========================
	$.fsm_state = function(machine, state_name, options) {
	  if(!options) options = {};
	
	  this.machine = machine;
	  this.state_name = state_name;
	  this.value = ('value' in options) ? options['value'] : state_name;
	  this.matcher = options['if'];
	  this.methods = [];
	  this.initial = options['initial'];

	  // final 
	
	  // description
	
	  // value
	
	  // matches
    this.matches = function(other_value) {
      // NOTE: the matcher function may be a by-product of ruby lambdas - ie it might not be necessary
      this.matcher ? this.matcher(other_value) : other_value == this.value
    };
    
	  // context
	  this.context = function(content) {
	    // update content (?)
	  };
	
	  // call
	
	  // add_predicates
	  this.add_predicate = function(){
	    this.machine[this.state_name] = function(){ this.machine.state.matches(this.state_name); };
	  };
	
	  this.add_predicate();
	return this
	};
	
	// FSM State Collection
	// =========================
	$.fsm_state_collection = function(options) {
		// match
	
	  // matches
	
	  return this
	};
	
		
	// FSM Transition
	// =========================
	$.fsm_transition = function( machine, event_name, from, to, custom_from_state ){
		
	  // action
	
	  // after
	
	  // before
	
	  // callback
	
	  // reset
	
	  // perform
	  this.perform = function(){
	    if( this.before() ) {
	      // make the DOM changes
	      
	      this.after()
	      return true;
	    } else { this.rollback() }
	    return false;
	  };
	
	return this;
  };		
  
})(jQuery);
