mui.init({
	pullRefresh: {
		container: '#pullrefresh',
		up: {
			contentdown: '上拉显示更多',
			contentover: '释放立即刷新',
			contentrefresh: '正在刷新...',
			callback: pullupRefresh
		}
	}
});

/**
 * 上拉加载具体业务实现
 */
var count = 0;
function pullupRefresh() {
	setTimeout(function() {
		mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2)); //参数为true代表没有更多数据了。
		var table = document.body.querySelector('.mui-table-view');
		var cells = document.body.querySelectorAll('.mui-table-view li');
		for (var i = cells.length, len = i + 20; i < len; i++) {
			var li = document.createElement('li');
			li.className = '';
			li.innerHTML = '<a class="mui-navigate-right">Item ' + (i + 1) + '</a>';
			table.appendChild(li);
		}
	}, 1500);
}
if (mui.os.plus) {
	mui.plusReady(function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().pullupLoading();
		}, 1000);
	});
} else {
	mui.ready(function() {
		mui('#pullrefresh').pullRefresh().pullupLoading();
		mui('#pullrefresh').on('tap', 'a', function(e) {
			if ($(this).attr("href")=="#"||$(this).attr("href")==""||$(this).attr("href")==undefined) {
			}else{
				location.href=$(this).attr("href");
			}
		});
	});
}
$(function () {
	$('.tools-bar').on('click', '.tools-cover', function() {//点击遮罩层隐藏排序列表
		$('.tools-cover').fadeOut(200);
		$(".goods-sort-list").slideUp(200);
		$('.goods-sort-btn').find("i.iconfont").removeClass("icon-jiantoushang");
	});
	$('.tools-bar').on('click', '.goods-sort-btn', function() {//显示隐藏排序列表
		if ($('.goods-sort-btn').find("i.iconfont").hasClass("icon-jiantoushang")) {
			$('.goods-sort-btn').find("i.iconfont").removeClass("icon-jiantoushang");
			$(this).next(".goods-sort-list").slideUp(200);
			$('.tools-cover').fadeOut(200);
		} else{
			$('.goods-sort-btn').find("i.iconfont").addClass("icon-jiantoushang");
			$(this).next(".goods-sort-list").slideDown(200);
			$('.tools-cover').fadeIn(200);
			$(".tools-sort").children("i.iconfont").addClass("icon-jiantou").removeClass("icon-jiantoushang")
			$(".sort-form").removeClass("on").slideUp(200);
		}
		});
	$(".goods-sort-list li").click(function () {//选择某排序项
		html=$(this).find("span").html();
		$('.goods-sort-btn span').html(html);
		$(this).addClass("on").siblings().removeClass("on");
		$(this).find("i").addClass("icon-duihao")
		$(this).siblings().find("i").removeClass("icon-duihao");
		$('.goods-sort-btn').find("i.iconfont").removeClass("icon-jiantoushang");
		$(".goods-sort-list").slideUp(200);
		$('.tools-cover').fadeOut(200);
	});
	$(".change-view").click(function () {//改变排版
		if ($(".good-lists-list").hasClass("change-view-new")) {
			$(this).children("i.iconfont").addClass("icon-liebiao").removeClass("icon-fenleifull");
			$(".good-lists-list").removeClass("change-view-new");
			$('.tools-cover').fadeOut(200);
			$(".goods-sort-list").slideUp(200);
			$('.goods-sort-btn').find("i.iconfont").removeClass("icon-jiantoushang");
			$(".tools-sort").children("i.iconfont").addClass("icon-jiantou").removeClass("icon-jiantoushang")
			$(".sort-form").removeClass("on").slideUp(200);
		} else{
			$(this).children("i.iconfont").addClass("icon-fenleifull").removeClass("icon-liebiao");
			$(".good-lists-list").addClass("change-view-new");
			$('.tools-cover').fadeOut(200);
			$(".goods-sort-list").slideUp(200);
			$('.goods-sort-btn').find("i.iconfont").removeClass("icon-jiantoushang");
			$(".tools-sort").children("i.iconfont").addClass("icon-jiantou").removeClass("icon-jiantoushang")
			$(".sort-form").removeClass("on").slideUp(200);
		}
	});
	$(".tools-sort,.send-form").click(function () {//展开收缩筛选
		if ($(".sort-form").hasClass("on")) {
			$(".tools-sort").children("i.iconfont").addClass("icon-jiantou").removeClass("icon-jiantoushang")
			$(".sort-form").removeClass("on").slideUp(200);
		} else{
			$(this).children("i.iconfont").addClass("icon-jiantoushang").removeClass("icon-jiantou");
			$(".sort-form").addClass("on").slideDown(200);
			$('.tools-cover').fadeOut(200);
			$(".goods-sort-list").slideUp(200);
			$('.goods-sort-btn').find("i.iconfont").removeClass("icon-jiantoushang");
		}
	});
	$(".form-block-btn").click(function () {//展开收缩多选项
		if ($(this).parent().find(".middle-block").hasClass("on")) {
			$(this).addClass("icon-xia").removeClass("icon-shang");
			$(this).parent().find(".middle-block").css({"height":"2.117rem"});
			$(this).parent().find(".middle-block").removeClass("on");
		} else{
			$(this).addClass("icon-shang").removeClass("icon-xia");
			$(this).parent().find(".middle-block").css({"height":"auto"});
			$(this).parent().find(".middle-block").addClass("on");
		}
	});
	$("ul.middle-block li").click(function () {//多选项
		$(this).toggleClass("on");
	});
	$(".reset-form").click(function () {//重置表单样式
		$("ul.middle-block li").removeClass("on")
		$("input.sort-form-ipt").val("");
	});
	$(".back-to-top").click(function () {//返回顶部
		$("body,html").animate({"scrollTop":"0"});
	});
	mt=150;
	$(document).scroll(function () {//距离顶部mt显示按钮
		$top = $(window).scrollTop();
		if ($top > mt) {
			$(".back-to-top").fadeIn(500);
		} else{
			$(".back-to-top").fadeOut(300);
		}
	});
});
