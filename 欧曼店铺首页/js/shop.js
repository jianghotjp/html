$(function () {
	$(".act_left,.act_right li").hover(function () {
		$(this).find(".act_title").animate({"height":"70px"},100);
	},function () {
		$(this).find(".act_title").animate({"height":"60px"},100);
	});
	$(".source_list ul li a").hover(function () {
		$(this).animate({"top":"-5px"},100);
		$(this).find(".goods-btn-content").animate({"height":"25px"},100);
	},function () {
		$(this).animate({"top":0},100);
		$(this).find(".goods-btn-content").animate({"height":0},100);
	});
	$(".goods-btn-content span").click(function () { //产品两个按钮
		alert("1")
		return false;
	})
})
