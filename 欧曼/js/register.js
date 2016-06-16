$(function () {
	$(".register_control li").click(function () {
		$(this).addClass("on").siblings("li").removeClass("on");
		index=$(this).index();
		$(".register_content .register_from").eq(index).addClass("block").siblings(".register_from").removeClass("block")
	});
})
