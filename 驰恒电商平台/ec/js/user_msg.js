$(function () {
	$(".mui-pull-right").click(function () {//编辑按钮
		if ($(this).hasClass("on")) {
			$(this).removeClass("on").html("编辑");
			$(".cart-edit-bar").animate({"bottom":"-50px"},500);
			$(".user-msg-content ul li .mui-checkbox").css({"width":0});
		} else{
			$(this).addClass("on").html("完成");
			$(".cart-edit-bar").animate({"bottom":0},500);
			$(".user-msg-content ul li .mui-checkbox").css({"width":"2.588rem"});
		}
		
	})
	$("#checkall").click(function () {//全选和取消
		if ($(this).hasClass("on")) {
			$(this).removeClass("on");
			$(".user-msg-content input[type=checkbox]").prop("checked",false)
		} else{
			$(this).addClass("on");
			$(".user-msg-content input[type=checkbox]").prop("checked",true)
		}
	});
	$(".cart-delet").click(function () {//消息删除逻辑-全部-单条
		if ($("#deletall input[type=checkbox]").prop("checked")==true) {
			$(".user-msg-content ul").html("");
		}else{
			$(".user-msg-content ul li input[type=checkbox]").each(function () {
				if($(this).prop("checked")==true){
					$(this).parents("li").remove();
				}
			})
		}
	});
})
