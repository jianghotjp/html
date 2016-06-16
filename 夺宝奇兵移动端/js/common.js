$(window).on('resize load', function(){
	var userAgent = navigator.userAgent.toLowerCase(); 
			$("body").css("zoom", $(window).width() / 750);
			$("body").css("display" , "block");
			var c_width = $(window).width();
	        var f_size = 17;
	        var per = 0.05;
	        f_size = c_width * per;
	        if(/iphone/.test(userAgent)){
	        	$("html").css({
	            	"font-size": f_size/2
	        	});
	        }else{
	        	$("html").css({
	            	"font-size": f_size
	        	});
	        }
		});	