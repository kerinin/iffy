(function($) {
  $.fn.fsm = function(settings) {
    $.isFunction(settings) ? settings.call() : $.fsm.init(settings);
  };

  // fsm constructor functions
  // init fsm
  $.fn.fsm.init = function(settings){}
  
  // before_transition
  $.fn.fsm.before_transition = function(){}

  // after_transition
  $.fn.fsm.before_transition = function(){}

  // event
  $.fn.fsm.before_transition = function(){}

  // transition
  $.fn.fsm.before_transition = function(){}

  // state
  $.fn.fsm.before_transition = function(){}

  // accessors & fsm methods
  // .state

  // .state_name

  // .is_<state_name>

  // .<property>

  // .<transition>()

  // .is_<state_name>()

})(jQuery);
