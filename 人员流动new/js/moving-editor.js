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
	ding: null
}
var editor = {
	/**
	 * 当做回调使用
	 */
	init:function(){
		editor.bindEvt();
		editor.showSlide();
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
				var top = (ui.offset.top + 27) / height * 100 + "%", //大头针尖位置需+27
					left = (ui.offset.left) / width * 100 + "%";
				editor.addPoint(top,left,ui)
			}
		}).draggable();
		
		options.ding.draggable({revert: true,});
		
	},
	showSlide:function(){
		options.slide.fadeIn();
		options.slide.animate({"right":0})
	},
	resetEl:function(){
		options.el.css({"width":"80%","height":"auto"}).fadeIn();
	},
	addPoint:function(){
		
	}
}

/**
 * zoom img
 */
;(function(){ 
var zooming=function(e){ 
e=window.event ||e; 
var o=this,data=e.wheelDelta || e.detail*40,zoom,size; 
if(!+'\v1'){//IE 
zoom = parseInt(o.style.zoom) || 100; 
zoom += data / 12; 
if(zoom > zooming.min) 
o.style.zoom = zoom + '%'; 
}else { 
size=o.getAttribute("_zoomsize").split(","); 
zoom=parseInt(o.getAttribute("_zoom")) ||100; 
zoom+=data/12; 
if(zoom>zooming.min){ 
o.setAttribute("_zoom",zoom); 
o.style.width=size[0]*zoom/100+"px"; 
o.style.height=size[1]*zoom/100+"px"; 
} 
} 
}; 
zooming.add=function(obj,min){//第一个参数指定可以缩放的图片，min指定最小缩放的大小 ,default to 50 
zooming.min=min || 50; 
obj.onmousewheel=zooming; 
if(/a/[-1]=='a')//if Firefox 
obj.addEventListener("DOMMouseScroll",zooming,false); 
if(-[1,]){//if not IE 
obj.setAttribute("_zoomsize",obj.offsetWidth+","+obj.offsetHeight); 
} 
}; 

window.onload=function(){//放在onload中，否则非ie中会无法计算图片大小出错 
zooming.add(document.getElementById("map")); 
} 
})();

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

