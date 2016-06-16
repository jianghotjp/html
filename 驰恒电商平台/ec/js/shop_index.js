$(function () {
	$(".shop-index-collect").click(function () {//加入收藏动画
		function removeclass() {
			$(".animated").removeClass("pulse");
			}
		if ($(this).hasClass("on")) {
			$(this).removeClass("on").css({"color":"#999"}).find("i").addClass("animated pulse").css({"color":"#d0d0d0"})
			setTimeout(removeclass,1000);
		} else{
			$(this).addClass("on").css({"color":"#fbd034"}).find("i").addClass("animated pulse").css({"color":"#fbd034"})
			setTimeout(removeclass,1000);
		}
	});
	mt=$(".shop-nav ul").offset().top
	$(document).scroll(function () {//距离顶部mt浮动按钮
		totop = $(window).scrollTop();
		if (totop > mt) {
			$(".shop-nav ul").css({"position":"fixed","top":"44px"});
			$(".return-home").css({"top":"90px"});
		} else{
			$(".shop-nav ul").css({"position":"relative","top":0});
			$(".return-home").css({"top":"50px"});
		}
	});
	$(".shop-nav ul li").click(function () {//店铺首页tab切换
		index=$(this).index();
		$(this).addClass("on").siblings("li").removeClass("on");
		$(".shop-index-tab").eq(index).addClass("mui-block").siblings(".shop-index-tab").removeClass("mui-block");
	});
})
