/*
 * jQuery UI ContextMenu
 *
 * Copyright 2011-2013, Sebastian Sauer info@dynpages.de
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
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
(function( $ ) {


if( $.browser == null ) {
	$.browser = {
		msie : /msie/.test(navigator.userAgent.toLowerCase())
	};
}

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
			my : "left+20 center+20",
			at : "left center",
			collision : "fit",
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
			el = this.element,
			menu;

		if( !$.isFunction ( $.ui.menu ) ) {
			throw( "You need at least jQueryUi 1.9 || jquery.ui.menu.js" );
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

		menu = this.menulayer = o.menu
			.addClass( this.widgetName )
			.hide();

		if( ! menu.data( "uiMenu" ) ) {
			menu.menu( o.menuOptions );
		}

		this._registerContextMenu();

		this._zIndex = menu.css( "z-Index" );

		if( ! this._zIndex || ( /\D/ ).test( this._zIndex ) ) {
			if( console && console.log ) {
				console.log( "please provide a z-index for contextmenu. Destroying instance." );
			}
			this.destroy();
			return;
		}
		this._zIndex = parseInt( this._zIndex, 10 ) - 1;

		this._addFakeLayer();
		this._on( this._fakeLayer, {
			click : "closeAll"
		});
    },
	_registerContextMenu : function () {
		var el;
		el = ( this._useDocumentFallback )
			? $( document )
			: this.element;

		this._on( el, {
			contextmenu : "open"
		});

		this.menulayer
			.on( 'contextmenu', function( ev ) {
				ev.stopPropagation();
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

		if ( false === this._trigger( "before", ev || null, this._ui() )
			|| o.disabled
		) {
			return;
		}
		this.closeAll();

		this._fakeLayer
			.removeClass( "ui-helper-hidden" )
			.css( "z-Index", this._zIndex );

		if( ev ) {
			ev.stopPropagation();
			ev.preventDefault();

			posO = $.extend( o.position, {
				of: ev
			});
			menu.show().position( posO );

		} else {
			menu.css({
				left: "" + o.pageX + "px",
				top: "" + o.pageY + "px"
			}).show();
		}

		this._trigger( "open", ev || null, this._ui() );
	},
	closeAll : function () {

		// explicitly call close for $(window).contextmenu (no pseudo selector catch)
		try {
			$( window ).contextmenu( "close" );
		} catch( e ) {}

		$( ":dyn-contextmenu" ).each(function () {
			$( this ).contextmenu( "close" );
		});

	},
	close : function ( ev ) {
		this.menulayer.hide();
		if( ev ) {
			ev.type = "contextmenuclose";
		}
		if( this._fakeLayer.is( ":visible" ) ) {
			this._hideFakeLayer();
		}

		this._trigger( "close", ev || null, this._ui() );
	},
	_addFakeLayer : function () {
		var o = this.options,
			fakeLayerClass = this.widgetName + "-layer",
			layer = $( "." + fakeLayerClass ),
			$body = $( "body" );

		if( $body.length < 1 ) {
			this._fakeLayer = $();
			return;
		}
		if( layer.length < 1 ) {
			layer = $( "<div />" )
				.addClass( fakeLayerClass );
			$body.append( layer );
		}
		this._fakeLayer = layer;
	},
	_hideFakeLayer : function () {
		this._fakeLayer
			.addClass( "ui-helper-hidden" )
			.css( "z-Index", "" + -1e6 );
	},
	destroy : function () {
		var ns = "." + this.widgetName;

		this.menulayer
			.undelegate( ns )
			.unbind( ns )
			.removeClass( this.widgetName )
			.menu( "destroy" );

		if( this._isWindow ) {
			$( window ).unbind( ns );
		}

		this._super();
	}
});

})( jQuery );
