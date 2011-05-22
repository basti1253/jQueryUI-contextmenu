/*
 * jQuery UI ContextMenu
 *
 * Copyright 2011, Sebastian Sauer info@dynpages.de
 * Version 0.3
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

		if( !menu.data( "menu" ) ) {
			menu.menu( o.menuOptions )
		}

		this._registerContextMenu();

		this._addFakeLayer();

		this._bind( this._fakeLayer, {
			click : "closeAll"
		});
    },
	_registerContextMenu : function () {
		var el;
		el = ( this._useDocumentFallback )
			? $( document )
			: this.element;

		this._bind( el, {
			contextmenu : "open"
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

		if ( false === this._trigger( "before", ev || null, this._ui() ) ) {
			return;
		}
		this.closeAll();

		this._fakeLayer.removeClass( "ui-helper-hidden" );

		if( ev ) {
			if ( ev.preventDefault ) {
				ev.preventDefault();
				ev.stopImmediatePropagation();
			}
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
		if( this._isWindow ) {
			this.close();
		}
		$( ":dyn-contextmenu" ).contextmenu( "close" );
	},
	close : function ( ev ) {
		this.menulayer.hide();
		if( ev ) {
			ev.type = "contextmenuclose";
		}
		if( this._fakeLayer.is( ":visible" ) ) {
			this._fakeLayer.addClass( "ui-helper-hidden" );
		}

		this._trigger( "close", ev || null, this._ui() );
	},
	_addFakeLayer : function () {
		var o = this.options,
			fakeLayerClass = this.widgetName + "-layer",
			layer = $( "." + fakeLayerClass ),
			$body = $( "body" );

		if( $body.length < 1 ) {
			return;
		}
		if( layer.length < 1 ) {
			layer = $( "<div />" )
				.addClass( fakeLayerClass + " ui-helper-hidden" );
			$body.append( layer );
		}

		this._fakeLayer = layer;
	},
	destroy : function () {
		var ns = "." + this.widgetName;

		this.menulayer
			.undelegate( ns )
			.unbind( ns )
			.removeClass( this.widgetName )
			.menu( "destroy" );

		if( $( ":dyn-contextmenu" ).length < 1 ) {
			$( window ).unbind( ns );
		}

		this._superApply( "destroy", arguments );
	}
});

})( jQuery );
