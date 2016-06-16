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
	$(".cart-edit").click(function () {
		if ($(this).hasClass("on")) {
			$(this).removeClass("on").find("span").html("编辑");
			$(".cart-edit-bar").hide();
			$(".cart-tools-bar").show();
		} else{
			$(this).addClass("on").find("span").html("完成");
			$(".cart-tools-bar").hide();
			$(".cart-edit-bar").show();

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