$(function () {
	$(".shop-fliter li").click(function () {
		$(this).addClass("bg_color").siblings("li").removeClass("bg_color");
	});
});
