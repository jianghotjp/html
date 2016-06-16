mui.plusReady(function(){
	    mui.init();
		var slider = mui("#slider");
	});
$(function () {
	mt=150
	$(document).scroll(function () {//距离顶部mt显示按钮
		$top = $(window).scrollTop()
		if ($top > mt) {
			$("#header").css({
              'background-color':'rgba(0,0,0,0.8)'
          	});
		} else{
			$("#header").css({
              'background-color':'rgba(0,0,0,0)'
          	});
		}
	});
})