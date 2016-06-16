
$(function () {

	$(".collcet").click(function () {//加入收藏动画
		function removeclass() {
			$(".animated").removeClass("wobble");
			}
		if ($(this).hasClass("on")) {
			$(this).removeClass("on").css({"color":"#999"}).find("i").addClass("animated wobble").css({"color":"#d0d0d0"})
			setTimeout(removeclass,1000);
		} else{
			$(this).addClass("on").css({"color":"#fbd034"}).find("i").addClass("animated wobble").css({"color":"#fbd034"})
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
	$("#intro .index-block-tit span.title").click(function () {//详情切换
		index=$(this).index();
		$(this).addClass("on").siblings("span").removeClass("on");
		$(".intro-content .content").eq(index).addClass("mui-block").siblings(".content").removeClass("mui-block");
	});

	mui('.index-block').on('tap', '.show-goods-sort', function(e) {//属性菜单弹出
		$(".goods-sort-cover").fadeIn();
		$(".goods-sort").animate({"bottom":0},200)
	});
	mui('.goods-sort').on('tap', '.close-goods-sort', function(e) {//属性菜单收缩
		$(".goods-sort-cover").fadeOut();
		$(".goods-sort").animate({"bottom":"-100%"})
	});
	mui('header,.comment-content,.footer-nav,#shop').on('tap', 'a', function(e) {//mui冲突链接
		href=$(this).attr("href");
		if(href=="#"||href==""||href=="javascript:void(0)"){}else{
			location.href=href;
		}
	});
	
	$(".goods-sort-content dd>span").click(function () {
		$(this).addClass("on").siblings("span").removeClass("on");
	});
	$(".intro-content .content").each(function () {//详情图放大
		index=$(this).index(".content");
		$(this).find("img").attr({"data-preview-src":"","data-preview-group":index})
	})
	
});
mui.ready(function(){
	    mui.init();
		var slider = mui("#slider");
		mui.previewImage();
	});