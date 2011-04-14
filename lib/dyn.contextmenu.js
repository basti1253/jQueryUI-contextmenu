/*
 * jQuery UI ContextMenu 
 * 
 * Copyright 2011, Sebastian Sauer info@dynpages.de
 * Version 0.2
 * 
 * Licensed under GPL V.3
 * GNU GENERAL PUBLIC LICENSE Version 3 http://www.gnu.org/licenses/gpl-3.0.html
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.menu.js
 *	jquery.ui.position.js
 *
 *
 *	events:
 *		before
 *		open
 *		close
 *		
 *
 *  public extra methods ( see ui.widget ):
 *    open
 *    close
 *    closeall
 *
 */
;(function( $ ) {

$.widget( "dyn.contextmenu", {
	/**
	 * @see jquery.ui.menu.js
	 */
    options : {
		// use that if you call open yourself
		pageX : 0,
		pageY : 0,
		menu : null,
		// ui.menu.options
		menuOptions : {},
		// ui.position options
		position : {
			my : "left center",
			at : "left center",
			collision : "none",
			using: function( to ) {
				$( this ).css({
					top: to.top,
					left: to.left
				});
			}
		}
    },
	/**
	 * cache check for $.isWindow
	 * @var bool
	 */
	_isWindow : false,
	_useDocumentFallback : false,
    _create : function () {
		var o = this.options,
			el = this.element;
		
		if( !$.isFunction ( $.ui.menu ) ) {
			throw( 'You need at least jQueryUi 1.9 || jquery.ui.menu.js' );
		}
		if( null === o.menu ) {
			return;
		}
		
		if( el[ 0 ] && $.isWindow( el[ 0 ] ) ) {
			this._isWindow = true;
			if( $.browser.msie ) {
				this._useDocumentFallback = true;
			}
		} 
		
		this.menulayer = o.menu
			.addClass( this.widgetName )
			.hide();
		
		if( !this.menulayer.data( 'menu' ) ) {
			this.menulayer.menu( o.menuOptions )
		}
		
		this._registerClick();
		
		this._registerMenuEvents();
    },
	_registerClick : function () {
		var o = this.options,
			el,
			that = this;
		
		el = ( this._useDocumentFallback )
			? $( document )
			: this.element;
			
		el.bind(
			'contextmenu.' + this.widgetName,
			function ( ev ) {
				var body = document.body,
					isIE = $.browser.msie,
					pageX, pageY;
				
				that.open( ev );
			}
		);
	},
	_registerMenuEvents : function () {
		var that = this,
			ns = '.' + this.widgetName,
			menu = this.menulayer;
		
		menu.bind( 'mouseleave' + ns, function ( ev ) {
			that.close( ev );
		});
		
		if( this._isWindow ) {
			// fix contextmenu closing on link click on chrome/chromium
			this.menulayer
				.find( 'a' )
				.bind( 'click' + ns, function ( ev ) {
					ev.stopImmediatePropagation();
				});
		} else {
			this.menulayer.delegate(
				'click' + ns,
				'a',
				function ( ev ) {
					ev.stopImmediatePropagation();
				}
			);
		}
		
		if( $( ':dyn-contextmenu' ).length > 0 && !$.mobile ) {
			return;
		}
		
		$( window ).bind( 'click' + ns , function ( ev ) {
			that.closeAll();
		});
		
	},
	_ui : function () {
		return {
			active : this.menulayer
		};
	},
	open : function ( ev ) {
		var o = this.options,
			menu = this.menulayer,
			posO;
		if ( false === this._trigger( 'before', ev || null, this._ui() ) ) {
			return;
		}
		if( ev ) {
			if ( ev.preventDefault ) {
				ev.preventDefault();
			}
			posO = $.extend( o.position, {
				of: ev
			});
			menu.show().position( posO );
			
		} else {
			menu.css({
				left: '' + o.pageX + 'px',
				top: '' + o.pageY + 'px'
			}).show();
		}

		this._trigger( 'open', ev || null, this._ui() );
	},
	closeAll : function () {
		$( ':dyn-contextmenu' ).contextmenu( 'close' );
	},
	close : function ( ev ) {
		this.menulayer.hide();
		if( ev && ev.type ) {
			ev.type = 'contextmenuclose';
		}
		this._trigger( 'close', ev || null, this._ui() );
	},
	destroy : function () {
		var ns = '.' + this.widgetName;
		
		this.menulayer
			.undelegate( ns )
			.unbind( ns )
			.removeClass( this.widgetName )
			.menu( 'destroy' );

		if( $( ':dyn-contextmenu' ).length < 1 ) {
			$( window ).unbind( ns );
		}
		
		this._superApply( 'destroy', arguments );
	}
});

})( jQuery );
