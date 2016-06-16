$(function(){   
    $('textarea').autoResize({   //自动扩展文本框
           // 文本框改变大小时触发事件，这里改变了文本框透明度   
           onResize : function() {   
                $(this).css({opacity:0.8});   
           },   
          // 动画效果回调触发事件，这里改变了文本框透明度   
          animateCallback : function() {   
               $(this).css({opacity:1});   
          },   
         // 动画效果持续时间（ms），默认150   
        animate: false,   
        // 每次改变大小时，扩展（缩小）的高度（像素），默认20   
        extraSpace : 30,   
        //当文本框高度大于多少时，不再扩展，出现滚动条，默认1000   
    limit: 200   
    }); 
    mui("body").on("tap",".assess-star .stars i",function () {
    	num=jQuery(this).index();
    	elms=jQuery(this).parent().find(".iconfont");
    	jQuery(elms).each(function () {
    		if(jQuery(this).index() <= num){
    			jQuery(this).removeClass("icon-xing icon-kongxing").addClass("icon-xing");
    		}else{
    			jQuery(this).removeClass("icon-xing icon-kongxing").addClass("icon-kongxing");
    		}
    	});
    	jQuery(this).parents(".assess-star").find(".star_num").val(num+1);
    });
});
