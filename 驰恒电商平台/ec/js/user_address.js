$(function () {
	$("body").on("click",".user-address-content ul li",function () {
		$(this).addClass("on").find("input").prop("checked",true);
		$(this).siblings("li").find("input").prop("checked",false);
		$(this).siblings("li").removeClass("on");
	});

});