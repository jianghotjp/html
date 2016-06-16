$(function () {
	$("#checkall,#deletall").click(function () {//全选和取消
		if ($(this).hasClass("on")) {
			$(this).removeClass("on");
			$(".goods-cart-list input[type=checkbox]").prop("checked",false)
		} else{
			$(this).addClass("on");
			$(".goods-cart-list input[type=checkbox]").prop("checked",true)
		}
	});
	$(".checkall-shop").click(function () {//选中店铺所有商品
		if ($(this).hasClass("on")) {
			$(this).removeClass("on").parents(".cart-list-shop").find("input[type=checkbox]").prop("checked",false)
		} else{
			$(this).addClass("on").parents(".cart-list-shop").find("input[type=checkbox]").prop("checked",true)
		}
	});
	$(".edit").click(function () {
		if ($(this).hasClass("on")) {
			$(this).removeClass("on").find("i").html("编辑");
			$(this).parents(".cart-list-shop").find("ul.goods-shop li").removeClass("mui-selected");
			$(this).parents(".cart-list-shop").find("ul.goods-shop li .mui-slider-right").removeClass("mui-selected");
			$(this).parents(".cart-list-shop").find("ul.goods-shop li .mui-slider-handle,.mui-slider-right .mui-btn").css({"left":"0px"});
			$(this).parents(".cart-list-shop").find(".mui-numbox").hide();
			$(this).parents(".cart-list-shop").find(".sale-num").show();
		} else{
			$(this).addClass("on").find("i").html("完成");
			$(this).parents(".cart-list-shop").find("ul.goods-shop li").addClass("mui-selected mui-transitioning");
			$(this).parents(".cart-list-shop").find("ul.goods-shop li .mui-slider-right").addClass("mui-selected");
			$(this).parents(".cart-list-shop").find("ul.goods-shop li .mui-slider-handle,.mui-slider-right .mui-btn").css({"left":"-88px"});
			$(this).parents(".cart-list-shop").find(".sale-num").hide();
			$(this).parents(".cart-list-shop").find(".mui-numbox").show();
		}
	});
	$(".cart-list-shop-content input[type=checkbox]").click(function () {//选中子类判断是否应选中店铺
		if($(this).prop("checked")==true){
			if($(this).parents("ul").find("li").length<2){
				$(this).parents(".cart-list-shop").find(".checkall-shop").addClass("on")
				$(this).parents(".cart-list-shop").find(".cart-list-shop-tit input[type=checkbox]").prop("checked",true);
			}
			if($(this).parents(".cart-list-shop-content").find("input[type=checkbox]:checked").length==$(this).parents(".cart-list-shop-content").find("li").length){
				$(this).parents(".cart-list-shop").find(".checkall-shop").addClass("on")
				$(this).parents(".cart-list-shop").find(".cart-list-shop-tit input[type=checkbox]").prop("checked",true);
			}
		}else{
			if($(this).parents(".cart-list-shop-content").find("input[type=checkbox]:checked").length!=$(this).parents(".cart-list-shop-content").find("li").length){
				$(this).parents(".cart-list-shop").find(".checkall-shop").removeClass("on")
				$(this).parents(".cart-list-shop").find(".cart-list-shop-tit input[type=checkbox]").prop("checked",false);
			}
		}
	})
	$(".cart-delet").click(function () {//购物车删除逻辑-全部-店铺-单品    //最后一个单品删除时删掉店铺(已注释)
		if ($("#deletall input[type=checkbox]").prop("checked")==true) {
			$(".goods-cart-list").html("");
		}else{
			$(".checkall-shop input[type=checkbox]").each(function () {
				if ($(this).prop("checked")==true) {
					$(this).parents(".cart-list-shop").remove();
				} else{
					$(".cart-list-shop-content input[type=checkbox]").each(function () {
						if($(this).prop("checked")==true){
//							if($(this).parents("ul").find("li").length<2){
//								$(this).parents(".cart-list-shop").remove();
//							}else{
								$(this).parents("li").remove();
//							}
							
						}
					})
				}
			})
		}
		
		
	})
});