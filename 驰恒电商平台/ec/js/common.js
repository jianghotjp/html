$(function () {//静态页返回处理
	var jiang=1;
	if(0 < $(".mui-pull-left").find("i.icon-left").length){
		$("body").on("tap",".mui-pull-left",function () {
			console.log(this);
			return false;
		});
	}
});



$(function () {//全站通用lazyload
	(function($) {
		$(document.body).imageLazyload({
			placeholder: '../resources/images/mui/60x60.gif'
		});
	})(mui);
})
/**
 * @description 页面添加代码
 */
function node() {
	document.write('<div class="wait_bg">');
	
	document.write('</div>');
}
/**
 * @description 移除等待
 */
function removeloader(){
	$(".wait_bg").remove()
}
/**
 * @description 载入
 * @param {Object} timer
 */
function loader (timer){
	settime = 1000*1000;
	if(timer){
		settime=timer*1000;
	}
	node();
	setTimeout('removeloader()',settime)
}
$(function () {
	//链接
	mui('.mui-bar').on('tap', 'a', function(e) {
		if ($(this).attr("href")=="#"||$(this).attr("href")==""||$(this).attr("href")==undefined) {
		}else{
			location.href=$(this).attr("href");
		}
	});
})
