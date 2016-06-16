mui.plusReady(function(){
	    mui.init();
		var slider = mui("#slider");
		//首页返回键处理
		//处理逻辑：1秒内，连续两次按返回键，则退出应用；
		var first = null;
		mui.back = function() {
			if (showMenu) {
				closeMenu();
			} else {
				//首次按键，提示‘再按一次退出应用’
				if (!first) {
					first = new Date().getTime();
					mui.toast('再按一次退出应用');
					setTimeout(function() {
						first = null;
					}, 1000);
				} else {
					if (new Date().getTime() - first < 1000) {
						plus.runtime.quit();
					}
				}
			}
		};
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