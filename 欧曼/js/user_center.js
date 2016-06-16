$(function () {
	mt=$(".user_slider").offset().top;
	ml=$(".user_slider").offset().left;
	$(window).resize(function () {
		mt=$(".user_slider").offset().top;
		ml=$(".user_slider").offset().left;
		return mt,ml
	});
	$(document).scroll(function () {
		scrolltop=$(document).scrollTop();
		if (mt < scrolltop) {
			$(".user_slider").addClass("pos-fixed").css({"top":"0","left":ml});
		}else{
			$(".user_slider").removeClass("pos-fixed");
		}
	});
	$(".form_list tr").hover(function () {
		$(this).css({"background":"#f4f4f4"})
	},function () {
		$(this).css({"background":"#fff"})
	});
	
});
