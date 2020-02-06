var slider = null;
var transitionEndName = (function(){
	var keys,
		el = document.createElement('fakeelement'),
		transitions = {
			'transition':'transitionend',
			'OTransition':'oTransitionEnd',
			'MozTransition':'transitionend',
			'WebkitTransition':'webkitTransitionEnd'
		};

	for( keys in transitions ){
		if( el.style[keys] !== undefined ){
			return transitions[keys];
		}
	}
}());
var animationEndName = (function(){
	var keys,
		el = document.createElement('fakeelement'),
		animations = {
			'animation':'animationend',
			'OAnimation':'oAnimationEnd',
			'MozAnimation':'animationend',
			'WebkitAnimation':'webkitAnimationEnd'
		};

	for( keys in animations ){
		if( el.style[keys] !== undefined ){
			return animations[keys];
		}
	}
}());

;(function( $, undefined ) {

    $.findFocusableElement = function( parentElement ){
        var _basket = [];

        $(parentElement).find('*').each(function(i, val) {
            if(val.tagName.match(/^A$|AREA|INPUT|TEXTAREA|SELECT|BUTTON/gim) && parseInt(val.getAttribute("tabIndex")) !== -1) {
                _basket.push(val);
            }
            if((val.getAttribute("tabIndex") !== null) && (parseInt(val.getAttribute("tabIndex")) >= 0) && (val.getAttribute("tabIndex", 2) !== 32768)) {
                _basket.push(val);
            }
        });

        return [ _basket[0], _basket[_basket.length-1] ];
    }

})( jQuery );


;(function($, window, document, undefined) {
    var pluginName = 'modal',
        _uuid = 0;

    $.fn[pluginName] = function ( options ) {
        this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });

        return this;
    };

    $.fn[pluginName].defaults = {
        type : 'group',
        groupAnchorSelector : '[data-js="modal__anchor"]',
        easing : 'swing',
        speed : 300,
        auto : true,
        onBeforeOpen : null,
        onAfterOpen : null,
        onBeforeClose : null,
        onAfterClose : null,
        onConfirm : null,
        onCancel : null
    };

    function Plugin ( element, options ) {
        this.$body = $('body');
        this.element = element;
        this.$element = $(this.element);
        this._name = pluginName;
        this._defaults = $.fn[pluginName].defaults;
        this.options = $.extend( {}, this._defaults, options );
        this.uuid = ++_uuid;
        this.modalID = pluginName+'-'+this.uuid;
        this.$modal = null;
        this.$focusFirst = null;
        this.$focusLast = null;
        this.$trigger = null;
        this.ajaxURL = null;
        this.isMoving = null;
        this.init();
    }

    $.extend( Plugin.prototype, {

        init : function () {
            var plugin = this;
            plugin.buildCache();
            plugin.bindEvents();
        },

        destroy: function() {
            var plugin = this;

            plugin.unBindModalEvent();
            plugin.unbindEvents();
            plugin.$element.removeData('plugin_' + pluginName);
            plugin = null;
        },

        buildCache : function(){
            var plugin = this;
            var _src = plugin.$element.data('src');

            if( _src.charAt(0) == '#' && $(_src).length ){
                plugin.modalID = _src;
                plugin.$modal = $(plugin.modalID);
            } else {
                plugin.ajaxURL = _src;
                plugin.options.auto = true;
            }
        },

        show : function(){
            var plugin = this;
            if( plugin.$focusFirst == null && plugin.$focusLast == null ){
                plugin.bindModalEvent();
            }

            plugin.isMoving = true;
			plugin.onBeforeOpen();
            plugin.$modal.show().one( animationEndName ,function(){
                $(this).focus();
				
                plugin.isMoving = false;
                plugin.onAfterOpen();
            });

			plugin.$modal.addClass('is-active zoomIn').find('.modal__content').scrollTop(0);

        },
        hide : function(){
            var plugin = this;

            if( plugin.isMoving ){
                return
            }

            plugin.isMoving = true;

            plugin.onBeforeClose();
            plugin.$modal.one( animationEndName ,function(){
                $(this).removeClass('is-active zoomOut').hide();

                plugin.unBindModalEvent();
                plugin.ajaxURL && plugin.remove();

                plugin.onAfterClose();
				plugin.isMoving = false;
                plugin.$trigger = null;

            }).removeClass('zoomIn').addClass('zoomOut');

            plugin.$trigger && plugin.$trigger.focus();
        },
        open : function(){
            var plugin = this;

            if( plugin.isMoving ){
                return
            }
            if( plugin.$modal ){
                plugin.show();
                return false;
            }
        },

        close : function(){
            var plugin = this;
            plugin.hide();
            plugin.$body.off('.'+plugin._name+'-'+plugin._uuid);
        },

        onBeforeOpen : function() {
            var plugin = this,
                onBeforeOpen = plugin.options.onBeforeOpen;
            if ( typeof onBeforeOpen === 'function' ) {
                onBeforeOpen.apply( plugin, [plugin] );
            } else if ( typeof onBeforeOpen === 'string' ){
                if( typeof window[onBeforeOpen] === 'function'){
                    window[onBeforeOpen]( plugin );
                }
            }
        },

        onAfterOpen : function() {
            var plugin = this,
                onAfterOpen = plugin.options.onAfterOpen;
            if ( typeof onAfterOpen === 'function' ) {
                onAfterOpen.apply( plugin, [plugin] );
            } else if ( typeof onAfterOpen === 'string' ){
                if( typeof window[onAfterOpen] === 'function'){
                    window[onAfterOpen]( plugin );
                }
            }
        },

        onBeforeClose : function() {
            var plugin = this,
                onBeforeClose = plugin.options.onBeforeClose;
            if ( typeof onBeforeClose === 'function' ) {
                onBeforeClose.apply( plugin, [plugin] );
            } else if ( typeof onBeforeClose === 'string' ){
                if( typeof window[onBeforeClose] === 'function'){
                    window[onBeforeClose]( plugin );
                }
            }
        },

        onAfterClose : function() {
            var plugin = this,
                onAfterClose = plugin.options.onAfterClose;
            if ( typeof onAfterClose === 'function' ) {
                onAfterClose.apply( plugin, [plugin] );
            } else if ( typeof onAfterClose === 'string' ){
                if( typeof window[onAfterClose] === 'function'){
                    window[onAfterClose]( plugin );
                }
            }
        },


        onConfirm : function() {
            var plugin = this,
                onConfirm = plugin.options.onConfirm;
            if ( typeof onConfirm === 'function' ) {
                onConfirm.apply( plugin, [plugin] );
            } else if ( typeof onConfirm === 'string' ){
                if( typeof window[onConfirm] === 'function'){
                    window[onConfirm]( plugin );
                }
            }
        },

        onCancel : function() {
            var plugin = this,
                onCancel = plugin.options.onCancel;
            if ( typeof onCancel === 'function' ) {
                onCancel.apply( plugin, [plugin] );
            } else if ( typeof onCancel === 'string' ){
                if( typeof window[onCancel] === 'function'){
                    window[onCancel]( plugin );
                }
            }
        },

        bindEvents : function(){
            var plugin = this;

            if( plugin.options.auto ){
                if( plugin.options.type === 'group'){
                    plugin.$element.on('click'+'.'+pluginName, plugin.options.groupAnchorSelector ,function(e){
                        e.stopPropagation();
						e.preventDefault();
                        plugin.$trigger = $(this);
                        plugin.open();
                    });
                } else {
                    plugin.$element.on('click'+'.'+pluginName,function(e){
                        e.stopPropagation();
						e.preventDefault();
                        plugin.$trigger = $(this);
                        plugin.open();
                    });
                }
            }

            if( !plugin.ajaxURL ){
                plugin.$modal.on('open'+'.'+pluginName,function(){
                    plugin.open();
                });
            }

            if( plugin.$element.is( plugin.$modal ) ){
                plugin.$modal.on('destroy'+'.'+pluginName, plugin.destroy.bind(plugin) );
            } else {
                plugin.$element.on('destroy'+'.'+pluginName, plugin.destroy.bind(plugin) );
            }
        },

        unbindEvents : function(){
            var plugin = this;

            plugin.$element.off('.'+pluginName);
            plugin.$modal.off('.'+pluginName);

        },

        bindModalEvent : function(){
            var plugin = this;

            plugin.unBindModalEvent();

            var focusEls = $.findFocusableElement( plugin.$modal );
            plugin.$focusFirst = $( focusEls[0] );
            plugin.$focusLast = $( focusEls[1] );

            plugin.$focusFirst.on('keydown'+'.'+pluginName,function(e){
                if (e.target === this){
                    var keyCode = e.keyCode || e.which;
                    if (keyCode === 9){
                        if (e.shiftKey){
                            plugin.$focusLast.focus();
                            e.stopPropagation();
                            e.preventDefault();
                        }
                    } else if ( keyCode === 27 ){
                        plugin.close();
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }
            });

            plugin.$focusLast.on('keydown'+'.'+pluginName,function(e){
                var keyCode = e.keyCode || e.which;
                if (keyCode === 9){
                    if (!e.shiftKey){
                        plugin.$focusFirst.focus();
                        e.stopPropagation();
                        e.preventDefault();
                    }
                } else if ( keyCode === 27 ){
                    plugin.close();
                    e.stopPropagation();
                    e.preventDefault();
                }
            });

            plugin.$modal.find('[data-dismiss]').on('click'+'.'+pluginName,function(e){
                var _method = $(this).data('dismiss');
                if( _method === 'cancel' || _method === 'confirm'){
                    e.stopPropagation();
                    (_method === 'confirm') && plugin.onConfirm();
                    (_method === 'cancel') && plugin.onCancel();
                    plugin.close();
                }
            });

            plugin.$modal.on('keydown'+'.'+pluginName,function(e){
                if (e.target === this){
                    var keyCode = e.keyCode || e.which;

                    if (keyCode === 9){
                        if (e.shiftKey){
                            plugin.close();
                            e.stopPropagation();
                            e.preventDefault();
                        }
                    } else if ( keyCode === 27 ){
                        plugin.close();
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }
            });


            plugin.$modal.on('dismiss'+'.'+pluginName,function(){
                plugin.close();
            });

            plugin.$modal.on('close'+'.'+pluginName,function(){
                plugin.close();
            });

            plugin.$modal.on('update'+'.'+pluginName,function(){
                plugin.updateScroll();
            });
        },

        unBindModalEvent : function(){
            var plugin = this;

            plugin.$focusFirst && plugin.$focusFirst.off('.'+pluginName);
            plugin.$focusLast && plugin.$focusLast.off('.'+pluginName);
            plugin.$modal && plugin.$modal.find('[data-dismiss]') && plugin.$modal.find('[data-dismiss]').off('click'+'.'+pluginName);
            plugin.$modal && plugin.$modal.off('click'+'.'+pluginName);
            plugin.$modal && plugin.$modal.off('keydown'+'.'+pluginName);
            plugin.$modal && plugin.$modal.off('dismiss'+'.'+pluginName);
            plugin.$modal && plugin.$modal.off('close'+'.'+pluginName);
            plugin.$modal && plugin.$modal.off('update'+'.'+pluginName);
            plugin.$body.off('.'+pluginName+'-'+plugin.uuid);
            plugin.$focusFirst = null;
            plugin.$focusLast = null;
        },

        // for ajax Modal
        remove : function(){
            var plugin = this;
            plugin.$modal.off('.'+pluginName);
            plugin.$modal.remove();
            plugin.$modal = null;
        }
    });


})(jQuery, window, document);


(function( $, window, document, undefined){

	//gnb
	var gnbInit = function(){
		var $body = $("html, body");
			headerH = parseInt( $('.l-head').outerHeight() );

		$('.l-gnb').on('click','.l-gnb__anchor',function(e){
			e.preventDefault();
			var $section = $( $(this).attr('href') );
			var scrollTo = $section.offset().top - headerH;

			$section.attr('tabindex',-1).one('focusout',function(){
				$section.removeAttr('tabindex');
			});
			$body.stop().animate({scrollTop:scrollTo}, 400, function() { 
				$section.focus()
			});

		});
	}

	//modal
	var modal = function(){
		$('#grid').modal({
			type : 'group',
			groupAnchorSelector : '.portfolio__anchor',
			onBeforeOpen : function( plugin ){
				addSlideItem( plugin.$trigger );
			},
			onAfterOpen : function(){
				slider.updateAutoHeight();
				$('.modal__wrap').css('opacity',1);
			},
			onAfterClose : function(){
				slider.removeAllSlides();
				$('.modal__wrap').css('opacity',0);
			}
		})
	};

	var addSlideItem = function( $anchor ){
		var imgList = $anchor.data('imgs');
		var title = $anchor.closest('.grid__item').find('.portfolio__name').text();
		var html = [];
		imgList = imgList.slice(1,imgList.length-1).replace(/\'/gi,'').split(',')

		_.forEach(imgList, function(item){
			html.push( '<div class="swiper-slide"><img src="'+ item +'" alt=""></div>' );
		});
		$('#dialog-title').text( title );
		slider.appendSlide(html);
		slider.update();
		slider.slideTo(0);		
	}

	//swipe 
	var swipe = function(){
		window.slider = new Swiper ('.swiper-container', {
					autoHeight: true,
					keyboard: {
						enabled: true,
						onlyInViewport: false,
					},
					pagination: {
						el: '.swiper-pagination',
					},
					navigation: {
						nextEl: '.swiper-button-next',
						prevEl: '.swiper-button-prev',
					}
				});
	};


//portfolio tab
	var tabNav = $('.c-tab');
	var $portfolioList = $('.portfolio', '#portfolio');
	var $grid = $('#grid');

	tabNav.find('button').on('click', function(e){
		e.preventDefault();
        var $this = $(this);
        var type = $this.data('type');

        $this
            .addClass('is-active')
            .siblings('button')
            .removeClass('is-active');

        $portfolioList
            .attr('class', 'portfolio portfolio--'+type);

        $portfolioList
            .find('h3.sr-only')
            .text('포트폴리오 '+ (type === 'view' ? '앨범' : '목록') + '형');

        $grid.masonry();

	});

//grid

	$(function(){
		$grid.imagesLoaded( function() {
			$grid.masonry({
				itemSelector: '.grid__item'
			});
		});
		$grid.one( 'layoutComplete', function() {
			$(this).removeClass('is-loading');
		});

	});


	$(function(){
		gnbInit();
		modal();
		swipe();
	});

})( jQuery, window, document );
