mui.init();


$(function () {
	(function($) {
		//阻尼系数
		var deceleration = mui.os.ios?0.003:0.0009;
		$('.mui-scroll-wrapper').scroll({
			bounce: false,
			indicators: true, //是否显示滚动条
			deceleration:deceleration
		});
	})(mui);

	mui(".order-control ul ").on("tap","li",function () {//修复mui-slider切换页面
		var control = mui('.mui-slider');
		control.slider().gotoItem($(this).index());
	});
	mui('.mui-scroll-wrapper').scroll();
	mui('body').on('shown', '.mui-popover', function(e) {
		//console.log('shown', e.detail.id);//detail为当前popover元素
		//mui(e.detail).popover('hide');//隐藏的方法
	});
	mui('body').on('hidden', '.mui-popover', function(e) {
		//console.log('hidden', e.detail.id);//detail为当前popover元素
	});

    mui(".order-control ul ").on("tap","li",function () {//修复mui-slider切换页面
        var control = mui('.mui-slider');
        control.slider().gotoItem($(this).index());
    });
    
    
	mui('.mui-slider').slider().gotoItem(jQuery(".mui-slider-item").length-1);
});

