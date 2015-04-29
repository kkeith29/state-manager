;var state_manager = (function( $ ) {
	var state_manager = {
		states: [],
		active_states: [],
		events: {
			ready: [],
			change: []
		},
		add: function( name,min,max ) {
			var idx = this.states.length;
			this.states[idx] = {
				idx: idx,
				name: name,
				min: parseInt( min ),
				max: ( typeof max === 'undefined' ? false : parseInt( max ) - 1 ),
				events: {
					load: [],
					unload: []
				}
			};
			return this;
		},
		bind: function( state,event,func ) {
			var state = this.get_by_name( state );
			if ( state === false ) {
				return false;
			}
			if ( typeof this.states[state.idx].events[event] === 'undefined' ) {
				return false;
			}
			this.states[state.idx].events[event].push(func);
			return true;
		},
		on: function( event,func ) {
			if ( typeof this.events[event] === 'undefined' ) {
				return;
			}
			this.events[event][this.events[event].length] = func;
		},
		init: function() {
			var that = this;
			this.trigger_event('ready');
			var timer = null;
			$(window).resize(function() {
				if ( timer !== null ) {
					clearTimeout(timer);
				}
				timer = setTimeout(function() {
					that.handle();
				},100);
			}).trigger('resize');
		},
		trigger_event: function( name ) {
			if ( typeof this.events[name] === 'undefined' ) {
				return false;
			}
			if ( this.events[name].length === 0 ) {
				return false;
			}
			for( var i in this.events[name] ) {
				var func = this.events[name][i];
				func.apply( null,Array.prototype.slice.call( arguments,1 ) );
			}
			return false;
		},
		trigger_state_event: function( state_idx,name ) {
			if ( typeof this.states[state_idx] === 'undefined' ) {
				return false;
			}
			var state = this.states[state_idx];
			if ( typeof state.events[name] === 'undefined' ) {
				return false;
			}
			if ( state.events[name].length === 0 ) {
				return false;
			}
			for( var i in state.events[name] ) {
				state.events[name][i].apply( null,Array.prototype.slice.call( arguments,2 ) );
			}
			return true;
		},
		in_array: function( value,values ) {
			for( var i in values ) {
				if ( values[i] === value ) {
					return true;
				}
			}
			return false;
		},
		handle: function() {
			var width = $(window).width();
			var last_states = this.active_states;
			this.active_states = [];
			var load = [], unload = [];
			for ( var i in this.states ) {
				if ( width >= this.states[i].min && ( this.states[i].max === false || width <= this.states[i].max ) ) {
					this.active_states.push(i);
					if ( !this.in_array( i,last_states ) ) {
						load.push(i);
					}
				}
				else if ( this.in_array( i,last_states ) ) {
					unload.push(i);
				}
			}
			//this.trigger_event( 'change',this.states[last_state],this.states[this.state] );
			for( var i in unload ) {
				this.trigger_state_event( unload[i],'unload' );
			}
			for( var i in load ) {
				this.trigger_state_event( load[i],'load' );
			}
		},
		get_by_name: function( state ) {
			for( var i in this.states ) {
				if ( this.states[i].name !== state ) {
					continue;
				}
				return this.states[i];
			}
			return false;
		},
		is_active: function( state ) {
			var state = this.get_by_name( state );
			if ( state === false ) {
				return false;
			}
			return this.in_array( state.idx,this.active_states );
		}
	};
	$(document).ready(function() {
		state_manager.init();
	});
	return state_manager;
})( jQuery );