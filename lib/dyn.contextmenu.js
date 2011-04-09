/*
 * jQuery UI ContextMenu 
 * 
 * Copyright 2011, Sebastian Sauer info@dynpages.de
 * Version 0.1.2
 * 
 * Licensed under GPL V.3
 * GNU GENERAL PUBLIC LICENSE Version 3 http://www.gnu.org/licenses/gpl-3.0.html
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.menu.js
 *
 *
 *	events:
 *		before
 *		open
 *		close
 */
;(function( $, undefined ) {

$.widget( "dyn.contextmenu", {
	/**
	 * @see jquery.ui.menu.js
	 */
    options : {
		menu : null,
		pageX : 0,
		pageY : 0
    },
	/**
	 * cache check for $.isWindow
	 * @var bool
	 */
	_isWindow : false,
	_useDocumentFallback : false,
    _create : function () {
		var o = this.options,
			menuOptions = $.extend( true, {}, this.options ),
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
		delete( menuOptions.menu );
		
		this.menulayer = o.menu
			.addClass( this.widgetName )
			.hide();
		
		if( this.menulayer.data( 'menu' ) === undefined ) {
			this.menulayer.menu( menuOptions )
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
					pageX = ev.pageX || this.clientX + ( this.scrollLeft || body.scrollLeft || 0 ),
					pageY = ev.pageY || this.clientY + ( this.scrollTop || body.scrollTop || 0 );
				
				$.extend( o, { pageX : pageX, pageY : pageY } );
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
		var o = this.options;
		if ( false === this._trigger( 'before', ev || null, this._ui() ) ) {
			return;
		}
		if( ev && ev.preventDefault ) {
			ev.preventDefault();
		}
		if( !$.browser.opera ) {
			$( ':dyn-contextmenu' ).contextmenu( 'closeAll' );
		}
		this.menulayer.css({
			left: '' + o.pageX + 'px',
			top: '' + o.pageY + 'px'
		}).show();
		
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
		this.element.unbind( ns );
		this.element.removeData( this.widgetName );
		if( $( ':dyn-contextmenu' ).length < 1 ) {
			$( window ).unbind( ns );
		}
		if( !$.mobile ) {
			this._superApply( this, arguments );
		}
	}
});

})( jQuery );
