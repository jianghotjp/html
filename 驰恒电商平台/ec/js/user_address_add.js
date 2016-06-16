$(function () {
	$("body").on("click",".address-del",function () {
		del=confirm("确认删除此收货地址？")
		if (del==true) {
			$(this).parents("li").remove();
		}
		
	});

});
