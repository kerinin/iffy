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
  $.fn.fsm = function(settings) {
    $.isFunction(settings) ? settings.call() : $.fsm.init(settings);

		// fsm constructor functions
	  // -------------------------

	  // init fsm
	  $.fn.fsm.init = function(settings){
			this.events = $.fsm_event_collection.new(self);
			this.states = $.fsm_state_collection.new(self);
			this.callbacks = {'before' : [], 'after' : []};
			this.messages = settings['messages'] || {};
			this.action = settings['action'];
			self.initial_state = options['initial'];
		};
	
	  // before_transition
	  $.fn.fsm.before_transition = function(){};

	  // after_transition
	  $.fn.fsm.after_transition = function(){};

	  // event
	  $.fn.fsm.event = function(){};

		// initial_state
	
		// invalidate

	  // transition
	  $.fn.fsm.transition = function(){};

	  // state
	  $.fn.fsm.state = function(){};

		// private functions
	  // -------------------------

		// add_callback
	
		// add_states

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

  };	

	
	// FSM Callback
	// =========================
	$.fn.fsm_callback = function(settings) {
		// call
		
		// known_states
		
		// new
	};
		
	// FSM Event
	// =========================
	$.fn.fsm_event = function(settings) {
		// add_actions
		
		// can_fire
		
		// fire
		
		// transition
	};

	// FSM Event Collection
	// =========================
	$.fn.fsm_event_collection = function(settings) {
		// transitions_for
		
		// valid_for
	};
		
	// FSM State
	// =========================
	$.fn.fsm_state = function(settings) {
		// call
		
		// matches
	};

	// FSM State Collection
	// =========================
	$.fn.fsm_state_collection = function(settings) {
		// match
		
		// matches
	};
		
	// FSM Transition
	// =========================
	$.fn.fsm_transition = function(settings) {
		// action
		
		// after
		
		// before
		
		// callback
		
		// reset
		
		// perform
	};
		
})(jQuery);
