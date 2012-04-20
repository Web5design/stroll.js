/**
 * stroll.js v1.0 - CSS scrolling effects
 * http://lab.hakim.se/scroll-effects
 * MIT licensed
 * 
 * Created by Hakim El Hattab, http://hakim.se
 */
(function(){

	// All of the lists that are currently bound
	var lists = [];

	// Set to true when there are lists to refresh
	var active = false;

	/**
	 * Updates all currently bound lists.
	 */
	function refresh() {
		if( active ) {
			requestAnimFrame( refresh );
			
			for( var i = 0, len = lists.length; i < len; i++ ) {
				lists[i].update();
			}
		}
	}

	/**
	 * Starts monitoring a list and applies classes to each of 
	 * its contained elements based on its position relative to 
	 * the list's viewport.
	 * 
	 * @param {HTMLElement} list 
	 */
	function add( list ) {
		// Don't allow dupes, only allow ul/ol
		if( exists( list ) || !list.nodeName || /^(ul|li)$/i.test( list.nodeName ) === false ) {
			return false;
		}

		// TODO: A current limitation is that there must be at least one
		// item in the list when binding.
		
		var items = Array.prototype.slice.apply( list.children );

		// Caching some heights so we don't need to go back to the DOM so much
		var listHeight = list.offsetHeight;

		// One loop to get the offsets from the DOM
		for( var i = 0, len = items.length; i < len; i++ ) {
			items[i]._offsetTop = items[i].offsetTop;
			items[i]._offsetHeight = items[i].offsetHeight;
		}

		// Add this element to the collection
		lists.push( {
			domElement: list,

			// Apply past/future classes to list items outside of the viewport
			update: function() {
				var scrollTop = list.pageYOffset || list.scrollTop,
					scrollBottom = scrollTop + listHeight;

				// Quit if nothing changed
				if( scrollTop !== list.lastTop ) {
					list.lastTop = scrollTop;

					// One loop to make our changes to the DOM
					for( var i = 0, len = items.length; i < len; i++ ) {
						var item = items[i];
						var itemClass = item.className;

						// Above list viewport
						if( item._offsetTop + item._offsetHeight < scrollTop ) {
							// Exclusion via string matching improves performance
							if( itemClass.indexOf( 'past' ) === -1 ) {
								item.classList.add( 'past' );
							}
						}
						// Below list viewport
						else if( item._offsetTop > scrollBottom ) {
							// Exclusion via string matching improves performance
							if( itemClass.indexOf( 'future' ) === -1 ) {
								item.classList.add( 'future' );
							}
						}
						// Inside of list viewport
						else if( itemClass.length ) {
							item.classList.remove( 'past' );
							item.classList.remove( 'future' );
						}
					}
				}
			}
		} );

		// Start refreshing if this was the first list to be added
		if( lists.length === 1 ) {
			active = true;
			refresh();
		}
	};

	/**
	 * Stops monitoring a list element and removes any classes 
	 * that were applied to its list items.
	 */
	function remove( list ) {
		for( var i = 0; i < lists.length; i++ ) {
			if( lists[i].domElement == list ) {
				lists.splice( i, 1 );
				i--;

				var items = Array.prototype.slice.apply( list.children );

				for( var j = 0, len = items.length; j < len; j++ ) {
					var item = items[j];

					item.classList.remove( 'past' );
					item.classList.remove( 'future' );
				}
			}
		}

		// Stopped refreshing if the last list was removed
		if( lists.length === 0 ) {
			active = false;
		}
	};

	function exists( list ) {
		for( var i = 0, len = lists.length; i < len; i++ ) {
			if( lists[i].domElement == list ) {
				return true;
			}
		}
		return false;
	};

	/**
	 * Calls 'method' for each DOM element discovered in 
	 * 'target'.
	 * 
	 * @param target String selector / array of UL elements / 
	 * jQuery object / single UL element
	 * @param method A function to call for each element target
	 */
	function batch( target, method ) {
		// Selector
		if( typeof target === 'string' ) {
			var targets = document.querySelectorAll( target );

			for( j = 0; j < targets.length; j++ ) {
				method.call( null, targets[j] );
			}
		}
		// Array (jQuery)
		else if( typeof target === 'object' && typeof target.length === 'number' ) {
			for( j = 0; j < target.length; j++ ) {
				method.call( null, target[j] );
			}
		}
		// Single element
		else if( target.nodeName ) {
			method.call( null, target );
		}
		else {
			throw 'Stroll target was of unexpected type.';
		}
	};

	/**
	 * Public API
	 */
	window.Stroll = {
		/**
		 * Binds one or more lists for scroll effects.
		 */
		bind: function( target ) {
			batch( target, add );
		},

		/**
		 * Unbinds one or more lists from scroll effects.
		 */
		unbind: function( target ) {
			batch( target, remove );
		}
	};

})();

window.requestAnimFrame = (function(){
   return  window.requestAnimationFrame       ||
 		  window.webkitRequestAnimationFrame ||
 		  window.mozRequestAnimationFrame    ||
 		  window.oRequestAnimationFrame      ||
 		  window.msRequestAnimationFrame     ||
 		  function( callback ){
 			window.setTimeout(callback, 1000 / 60);
 		  };
 })();