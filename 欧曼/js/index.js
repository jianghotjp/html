$(function () {
	$(".used-search ul li").click(function () {
		$(this).addClass("on").siblings("li").removeClass("on")
	});
	$(".activity-content ul li:first-child,.hot-link ul li:first-child,.service ul li:first-child").each(function () {
		$(this).css({"margin-left":0});
	});
	$(".buy-info td").hover(function () {
		$(this).parents("tr").css({"background":"#ececec"});
	},function () {
		$(this).parents("tr").css({"background":"#fff"});
	})
})
