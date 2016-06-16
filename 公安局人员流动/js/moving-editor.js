$(function(){
	options.init(editor.init);
})
/**
 * 轮询单图片加载进度
 * @param {Object} img
 * @param {Object} callback
 */
function imgLoad(img, callback) {
    var timer = setInterval(function() {
        if (img.complete) {
            callback(img)
            clearInterval(timer)
        }
    }, 50)
}
/**
 * 初始化参数
 */
var options={
	init : function(callback){
		this.el = $(".dpo-img");
		this.slide = $(".dpo-slide");
		this.editList = $(".slide-edit");
		this.ding = this.editList.find("a.position");
		callback();
	},
	el : null,
	slide : null,
	editList : null,
	ding: null,
	dingTop: 0,
	dingLeft: 0
}
var editor = {
	/**
	 * init当做回调使用
	 */
	init:function(){
		editor.bindEvt();
		editor.resetEl();
		//图片加载
		imgLoad(options.el.find("img")[0], removeloader);
	},
	bindEvt:function(){
		options.el.droppable({
			accept: ".position",
			drop: function(event, ui) {
				console.log(ui)
				var height = $(this).height(),
					width = $(this).width();
				$(ui.draggable[0]).addClass("active");
				var top = (ui.offset.top + 33) / height * 100, //大头针尖位置需+27
					left = (ui.offset.left + 1) / width * 100;
				//editor.addPoint(top,left,ui)
				options.dingTop = top;
				options.dingLeft = left;
				$(ui.draggable[0]).next().next(".info").html("当前坐标  t:"+top+",l:"+left);
			}
		}).draggable();
		if(0 < options.ding.length){
			options.ding.draggable({revert: true,grid: [ 10, 10 ]});
		}
	},
	resetEl:function(){
		options.el.css({"width":"100%","height":"auto","left":"0","top":"0"}).fadeIn();
	},
	sendData:function(){
		if(parseFloat(options.dingTop) && parseFloat(options.dingLeft)){
			var data = options.dingTop + "," + options.dingLeft;
			//此处发数据
			alert(data);
		}
	}
}


/**
 * @description 页面添加代码
 */
function node() {
	document.write('<div class="wait_bg"></div>');
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

