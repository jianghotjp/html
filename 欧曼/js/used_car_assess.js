$(function () {
	$(".content_title ul li").click(function () {
		$(this).addClass("on").siblings("li").removeClass("on");
	});
	$(".assess_item ul li").click(function () {
		$(this).addClass("on").siblings("li").removeClass("on");
	});
});