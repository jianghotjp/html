$(function () {
	$(".map-list .pos").click(function () {
		if($(this).hasClass("on")){
			if($(this).hasClass("no-click")){}else{
				$(this).removeClass("on").find(".pos-list").slideUp(200);
			}
		}else{
			$(this).addClass("on").find(".pos-list").slideDown(200);
			$(this).siblings(".pos").removeClass("on").find(".pos-list").slideUp(200);
		}
	})
})

