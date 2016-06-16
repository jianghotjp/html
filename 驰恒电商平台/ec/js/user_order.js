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

	mui(".order-control ul ").on("tap","li",function () {//修复mui-slider切换页面
		var control = mui('.mui-slider');
		control.slider().gotoItem($(this).index());
	});
	
	
});
//$(function () {
//	$(".order-control ul li").click(function () {//详情切换
//		width=-$(window).width();
//		index=$(this).index();
//		pos=width*index;
//		$(this).addClass("on").siblings("li").removeClass("on");
//		$(".mui-slider-group").css({"transform":"translate3d("+pos+"px, 0px, 0px) translateZ(0px)"})
//	});
//})




//$(function () {
//	 $("body").on("click", ".kuaidi", function () {
//      $(this).parents(".shop-order").find(".select-balance").fadeIn(200)
//  });
//  $("body").on("click",".select-balance",function(){
//      $(this).fadeOut(200);
//  });
//  
//  //document.getElementById("promptBtn").addEventListener('tap', function(e) {
//  	$("body").on("#promptBtn","click",function () {
//  		alert(1)
//				//e.detail.gesture.preventDefault();
//				var btnArray = ['确定', '取消'];
//				mui.prompt('请输入发票抬头：', btnArray, function(e) {
//					if (e.index == 0) {
//						
//						//有内容
//					} else {
//					
//						//没内容
//					}
//				})
//			});
//});
$(function () {//新增合并订单

	document.querySelector('.mui-slider').addEventListener('slide', function(event) {
	  if (event.detail.slideNumber === 1) {} else{
	  	$(".merge").hide();
	  }
	 });
	$("body").on("click","input[type=checkbox]",function () {
		if($("input[type=checkbox]").prop('checked')==true){
			$(".merge").show();
			$("#waitpay .mui-scroll-wrapper").css({"bottom":"50px"});
		}else{
			$(".merge").hide();
			$("#waitpay .mui-scroll-wrapper").css({"bottom":0});
		}
	})
	
})
