(function( $, window, document, undefined){



//portfolio tab
	var tabNav = $('.c-tab');

	tabNav.find('a').click(function(e){

		e.preventDefault();
		tabNav.find('a').removeClass('is-active');
		tabNav.siblings('div').hide();

		var target = $(this).closest('a');
		target.addClass('is-active');
		var index = target.index();
		tabNav.siblings('div').eq(index).show();

	}).eq(0).click();

//grid

	$(function(){
		var $grid = $('#grid').imagesLoaded( function() {
			$grid.masonry({
				itemSelector: '.grid__item'
			});
		});
		$grid.one( 'layoutComplete', function() {
			$(this).removeClass('is-loading');
		});

	});

//gnb
	(function(){
		var $body = $('body'),
			headerH = parseInt( $('.l-head').outerHeight() );

		$('.l-gnb').on('click','a',function(e){
			e.preventDefault();
			var scrollTo = $( $(this).attr('href') ).offset().top - headerH;
			$body.stop().animate({'scrollTop':scrollTo+'px'},800);

		});
	})();

//레이어 팝업 버튼
	$(function(){
		var _modal = modalSwipe();

		$('.ly-open').click(function(e){
			e.preventDefault();
			var $this = $(this);
			var _target = $this.attr('href');
			var _imgItemList = $this.data('imgs');
			var _html = '';
			_imgItemList = _imgItemList.slice(1, _imgItemList.length-1);
			_imgItemList = _imgItemList.replace(/'/g,'');
			_imgItemList = _imgItemList.split(',');

			$.each(_imgItemList,function(index){
				_html += '<div class="swiper__slide"><img src="'+_imgItemList[index]+'" alt=""></div>';
			});

			$('#dialog-title').text( $this.closest('li').find('.grid__name').text() );
			$('#lyView').find('.swiper__wrapper').html(_html);

			openModalLayer(_target, this);
			_modal.on();
		});

//img view
	function openModalLayer(layerID,origin){
		var $this = $(layerID),
			focusable = [];

		var pcScrollbarWidth = (function(){
			if ($(document.body).height() <= $(window).height()) {
				return 0;
			}

			var outer = document.createElement("div");
			outer.style.visibility = "hidden";
			outer.style.width = "100px";
			document.body.appendChild(outer);

			var widthNoScroll = outer.offsetWidth;
			outer.style.overflow = "scroll";

			var inner = document.createElement("div");
			inner.style.width = "100%";
			outer.appendChild(inner);

			var widthWithScroll = inner.offsetWidth;
			outer.parentNode.removeChild(outer);

			return widthNoScroll - widthWithScroll;
		});

		$this.attr('aria-hidden','false');
		$('body, .l-head').css({
			'overflow' : 'hidden',
			'padding-right' : pcScrollbarWidth
		});

		$this.find('*').each(function(i, val) {
			if(val.tagName.match(/^A$|AREA|INPUT|TEXTAREA|SELECT|BUTTON/gim) && parseInt(val.getAttribute("tabIndex")) !== -1) {
				focusable.push(val);
			}
			if((val.getAttribute("tabIndex") !== null) && (parseInt(val.getAttribute("tabIndex")) >= 0) && (val.getAttribute("tabIndex", 2) !== 32768)) {
				focusable.push(val);
			}
		});

		var el_firstFocus = focusable[0],
			el_lastFocus = focusable[focusable.length-1];



		$(document).on({
			'keydown' : function(e){
				var keyCode = e.keyCode || e.which;
				if (keyCode == 27){
					$this.find('.ly__close').click();
					$(document).off('keydown');
				}
			}
		});

		$(el_firstFocus).on({
			'keydown' : function(e){
				if (e.target == this){
					var keyCode = e.keyCode || e.which;
					if (keyCode == 9){
						if (e.shiftKey){
							$(el_lastFocus).focus();
							e.preventDefault();
						}
					}
				}
			}
		});

		$(el_lastFocus).on({
			'keydown' : function(e){
				var keyCode = e.keyCode || e.which;
				if (keyCode == 9){
					if (!e.shiftKey){
						$(el_firstFocus).focus();
						e.preventDefault();
					}
				}
			}
		});

		$this.find('.ly__close').click(function(e){
			_modal.off();
			$(origin).focus();
			$this.hide();
			e.preventDefault();

			$this.attr('aria-hidden','true');
			$('body, .l-head').css({
				'overflow' : 'visible',
				'padding-right' : 0
			});
		});

		$this.show().find($(el_firstFocus)).focus();

	}

	function modalSwipe(){
		var swiperParent;
		var $btnPrev = $('.ly__button--prev'),
			$btnNext = $('.ly__button--next'),
			$btnStop = $('.ly__button--stop'),
			$btnPlay = $('.ly__button--play');


		return ({

			on : function(){
				swiperParent = new Swiper('.swiper', {
					wrapperClass : 'swiper__wrapper',
					slideClass : 'swiper__slide',
					pagination: '.pagination-parent',
					paginationClickable: true,
					loop: true,
					slidesPerView: 1,
					autoplay: 3000,
					speed: 800,
					simulateTouch: false,
					onSlideChangeStart: function (data) {
						//console.dir( data );
					}
				});

				this.onEvt();
			},
			off : function(){
				if( typeof swiperParent == 'object') {
					swiperParent.destroy();
				}
				this.offEvt();
			},
			onEvt : function(){

				$btnPrev.on('click', function (e) {
					e.preventDefault();
					swiperParent.stopAutoplay();
					swiperParent.swipePrev();
				});

				$btnNext.on('click', function (e) {
					e.preventDefault();
					swiperParent.stopAutoplay();
					swiperParent.swipeNext();
				});

				$btnStop.on('click', function (e) {
					e.preventDefault();
					swiperParent.stopAutoplay();
				});

				$btnPlay.on('click', function (e) {
					e.preventDefault();
					swiperParent.startAutoplay();
				});

			},
			offEvt : function(){
				$btnPrev.off('click');
				$btnNext.off('click');
				$btnStop.off('click');
				$btnPlay.off('click');
			}
		});
	}

});


})( jQuery, window, document );
