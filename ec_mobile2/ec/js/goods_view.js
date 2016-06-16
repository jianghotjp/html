mui.plusReady(function(){
	    mui.init();
		var slider = mui("#slider");
	});
$(function () {
	$(".collcet").click(function () {//加入收藏动画
		function removeclass() {
			$(".animated").removeClass("wobble");
			}
		if ($(this).hasClass("on")) {
			$(this).removeClass("on").find("i").addClass("animated wobble").css({"color":"#d0d0d0"})
			setTimeout(removeclass,1000);
		} else{
			$(this).addClass("on").find("i").addClass("animated wobble").css({"color":"#fbd034"})
			setTimeout(removeclass,1000);
		}
	});
	$(".comment-stars").html(function () {//评价星级
		htm='';
		starnum=$(this).attr("data-starnum");
		xing='<i class="iconfont icon-xing"></i>';
		banxing='<i class="iconfont icon-banxing"></i>';
		kongxing='<i class="iconfont icon-kongxing"></i>';
		for (i=0;i<5;i++) {
			if(i<starnum){
				if(starnum-i<1){
					htm=htm+banxing;
				}else{
					htm=htm+xing;
				}
			}else{
				htm=htm+kongxing;
			}
		}
		return htm;
	});
	$("#intro .index-block-tit .title").click(function () {//详情切换
		index=$(this).index();
		$(this).addClass("on").siblings("span").removeClass("on");
		$(".intro-content .content").eq(index).addClass("mui-block").siblings(".content").removeClass("mui-block");
	});
	$(".show-goods-sort").click(function () {
		$(".goods-sort-cover").fadeIn();
		$(".goods-sort").animate({"bottom":0},200)
	});
	$(".close-goods-sort").click(function () {
		$(".goods-sort-cover").fadeOut();
		$(".goods-sort").animate({"bottom":"-100%"})
	});
	$(".goods-sort-content dd>span").click(function () {
		$(this).addClass("on").siblings("span").removeClass("on");
	});
})
//$(window).scrollTop() + $(window).height()) == $(document).height()//判断浏览器是否到底的写法，建议不要到底再执行，距离底部50px--100px就可以加载了