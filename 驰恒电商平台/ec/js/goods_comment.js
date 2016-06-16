$(function () {
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
	$(".comment-title ul li").click(function () {//评价切换
		index=$(this).index();
		$(this).addClass("on").siblings("li").removeClass("on");
		$(".comment-content ul").eq(index).addClass("mui-block").siblings("ul").removeClass("mui-block");
	});
});

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
		$.ready(function() {
			//循环初始化所有下拉刷新，上拉加载。使用mui插件非mui
			$.each(document.querySelectorAll('.mui-slider-group .mui-scroll'), function(index, pullRefreshEl) {
				$(pullRefreshEl).pullToRefresh({
					up: {
						callback: function() {
							var self = this;
							setTimeout(function() {
								var ul = self.element.querySelector('.mui-table-view');
								ul.appendChild(createFragment(ul, index, 5));
								self.endPullUpToRefresh();
							}, 1000);
						}
					}
				});
			});
			var createFragment = function(ul, index, count, reverse) {//获取组装数据
				var length = ul.querySelectorAll('li').length;
				var fragment = document.createDocumentFragment();
				var li;
				for (var i = 0; i < count; i++) {
					li = document.createElement('li');
					li.className = 'mui-table-view-cell';
					li.innerHTML = '第' + (index + 1) + '个选项卡子项-' + (length + (reverse ? (count - i) : (i + 1)));
					fragment.appendChild(li);
				}
				return fragment;
			};
		});
	})(mui);

	mui(".comment-title ul").on("tap","li",function () {//修复mui-slider切换页面
		var control = mui('.mui-slider');
		control.slider().gotoItem($(this).index());
	});
});