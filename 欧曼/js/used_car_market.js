$(function () {
	$(".filter ul li").click(function () {
		$(this).addClass("on").siblings("li").removeClass("on");
	});
	$(".filter-tools li").click(function () {
		if ($(this).hasClass("on")) {
			if ($(this).find("i.iconfont").hasClass("icon-shang")) {
				$(this).find("i.iconfont").removeClass("icon-shang").addClass("icon-xia");
			} else{
				$(this).find("i.iconfont").removeClass("icon-xia").addClass("icon-shang");
			}
		} else{
			$(this).addClass("on").siblings("li").removeClass("on");
		}
	});
	$("ul.goods-list-content li a").hover(function () {
		$(this).animate({"top":"-5px"},100);
		$(this).find(".goods-btn-content").animate({"height":"25px"},100);
	},function () {
		$(this).animate({"top":0},100);
		$(this).find(".goods-btn-content").animate({"height":0},100);
	});
	$(".goods-btn-content span").click(function () {
		alert("1")
		return false;
	})
});
