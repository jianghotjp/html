
$(function(){
    //屏幕左侧控件指向/选中效果展示
    $("body").on("mouseenter",".toolbar-left ul li",function(){
       $(this).addClass("hover_bg").prev("li").addClass("remove_line");
    });
    $("body").on("mouseleave",".toolbar-left ul li",function(){
       $(this).removeClass("hover_bg").prev("li").removeClass("remove_line");
    });
//  $("body").on("click",".toolbar-left ul li",function(){
//      if (!$(this).hasClass("on")) {
//      	$(this).addClass("on").addClass("picked_bg").siblings().removeClass("on").removeClass("picked_bg");
//      	$(this).prev("li").addClass("remove_prev").siblings().removeClass("remove_prev");
//      };
//  });
    //点击眼睛，图层显示隐藏
    $("body").on("click",".show-layer",function(){
        if ($(this).parent("li").hasClass("hide_layer")) {
        	$(this).parent("li").removeClass("hide_layer")
        } else{
        	$(this).parent("li").addClass("hide_layer");
        };
    });
    //选中图层
    $("body").on("click",".layer",function(){
       if ($(this).parent("li").hasClass("layer_picked")) {
       	  $(this).parent("li").removeClass("layer_picked");
       	  $(".copy").removeClass("animate fadeInRight");
       	  $(".delete").removeClass("animate fadeInRight");
       } else{
       	  $(this).parent("li").addClass("layer_picked").siblings().removeClass("layer_picked");
       	  $(".copy").addClass("animate fadeInRight");
       	  $(".delete").addClass("animate fadeInRight");
       }
    });
    //指向图层颜色变化
    $("body").on("mouseenter",".layer",function(){
       $(this).addClass("layer_hover_bg");
    });
    $("body").on("mouseleave",".layer",function(){
       $(this).removeClass("layer_hover_bg");
    });
    //隐藏右侧工具栏事件
    $("body").on("click",".toolbar-right-hide",function(){
       if ($(this).hasClass("on")) {
        $(this).removeClass("on").find("i.wx_editor").html("&#xe628;");
        $(".toolbar-right").animate({"right":0},500);
       } else{
       	$(this).addClass("on").find("i.wx_editor").html("&#xe627;");
       	$(".toolbar-right").animate({"right":"-180px"},500);
       }
    });
    //指向顶部工具栏弹出提示事件
    $("body").on("mouseenter",".js_alert",function(){
       $(this).find(".js_alert_box").slideDown(300);
    });
    $("body").on("mouseleave",".js_alert",function(){
       $(this).find(".js_alert_box").stop(true,true).slideUp(300);
    });
    //顶部工具栏点击选中js
    $("body").on("click",".js_click",function(){
        if ($(this).hasClass("on")) {
        	$(this).removeClass("on");
        } else{
        	$(this).addClass("on");
        }
    });

    $(".align-div>i").click(function () {
        $(this).children("i.bg-d9d9d9").addClass("on");
        $(this).siblings(".align-div>i").children("i.bg-d9d9d9").removeClass("on")
    });
    $(".switch-control ul li").click(function () {
        $(this).addClass("active").siblings("li").removeClass("active");
        $(".switch-content>div").eq($(this).index()).addClass("dis-block").siblings("div").removeClass("dis-block");
    });
});

