$(function(){
	options.init(editor.init);
	
	//TODO:数据存入后调用这行
	editor.showData(options.data);
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
	dingLeft: 0,
	//测试数据
	data: {"actionErrors":[],"actionMessages":[],"data":{"infos":[{"persnName":"侯来恩","details":[{"roomNo":"11","createDate":"2016-04-14 09:07:25","coordinate":null,"roomName":"询问（讯）室1"},{"roomNo":"2","createDate":"2016-04-14 10:07:44","coordinate":null,"roomName":"询问（讯）室2"},{"roomNo":"3","createDate":"2016-04-14 11:07:59","coordinate":null,"roomName":"询问（讯）室3"},{"roomNo":"5","createDate":"2016-04-14 13:08:10","coordinate":null,"roomName":"询问室"}],"coordinate":"34.424083769633505,26.35431918008785","persnId":30,"iconUrl":"\/upload\/20160407\/face_1459996144198.jpg"},{"persnName":"高盛","details":[],"coordinate":"34.424083769633505,26.35431918008785","persnId":1,"iconUrl":"face_1459414726108.jpg"},{"persnName":"王浩","details":[],"coordinate":"34.424083769633505,26.35431918008785","persnId":5,"iconUrl":"face_1459404768780.jpg"},{"persnName":"刘伟","details":[],"coordinate":null,"persnId":6,"iconUrl":"face_1459402938358.jpg"},{"persnName":"张小三","details":[],"coordinate":null,"persnId":7,"iconUrl":"face_1459393807465.jpg"},{"persnName":"侯恩华","details":[],"coordinate":null,"persnId":9,"iconUrl":"face_1459436824764.jpg"},{"persnName":"李某","details":[],"coordinate":null,"persnId":11,"iconUrl":"face_1459436176073.jpg"},{"persnName":null,"details":[],"coordinate":null,"persnId":12,"iconUrl":"\/upload\/20160401\/face_1459501440216.jpg"},{"persnName":"张大金","details":[],"coordinate":null,"persnId":16,"iconUrl":"\/upload\/20160405\/face_1459864108832.jpg"},{"persnName":"孙小米","details":[],"coordinate":null,"persnId":24,"iconUrl":"\/upload\/20160406\/face_1459905609192.jpg"},{"persnName":"刘龙","details":[],"coordinate":null,"persnId":25,"iconUrl":"\/upload\/20160407\/face_1460010517807.jpg"},{"persnName":"李源","details":[],"coordinate":null,"persnId":28,"iconUrl":"\/upload\/20160407\/face_1460010020526.jpg"},{"persnName":"苏云峰","details":[],"coordinate":null,"persnId":32,"iconUrl":null},{"persnName":null,"details":[],"coordinate":null,"persnId":33,"iconUrl":null},{"persnName":"赵奇瑞","details":[],"coordinate":null,"persnId":34,"iconUrl":"\/upload\/20160408\/face_1460075767057.jpg"},{"persnName":"李三","details":[],"coordinate":null,"persnId":35,"iconUrl":null},{"persnName":"冯老九","details":[],"coordinate":null,"persnId":36,"iconUrl":"\/upload\/20160408\/face_1460101854479.jpg"},{"persnName":"县引人","details":[],"coordinate":null,"persnId":38,"iconUrl":"\/upload\/20160411\/face_1460343662135.jpg"},{"persnName":"李默","details":[],"coordinate":null,"persnId":39,"iconUrl":"\/upload\/20160413\/face_1460536411683.jpg"},{"persnName":"田相美","details":[],"coordinate":null,"persnId":44,"iconUrl":null},{"persnName":"王静","details":[{"roomNo":null,"createDate":"2016-04-18 10:22:26","coordinate":null,"roomName":"离开办案区"}],"coordinate":null,"persnId":40,"iconUrl":"\/upload\/20160418\/face_1460943542090.jpg"},{"persnName":"李思","details":[{"roomNo":"11","createDate":"2016-04-14 10:10:25","coordinate":null,"roomName":"询问（讯）室1"},{"roomNo":"2","createDate":"2016-04-14 11:12:44","coordinate":null,"roomName":"询问（讯）室2"},{"roomNo":"3","createDate":"2016-04-14 14:07:59","coordinate":null,"roomName":"询问（讯）室3"},{"roomNo":"5","createDate":"2016-04-14 15:08:10","coordinate":null,"roomName":"询问室"},{"roomNo":null,"createDate":"2016-04-15 11:00:55","coordinate":null,"roomName":"离开办案区"}],"coordinate":null,"persnId":37,"iconUrl":null},{"persnName":"张均能","details":[{"roomNo":null,"createDate":"2016-04-27 11:40:00","coordinate":null,"roomName":"离开办案区"}],"coordinate":null,"persnId":42,"iconUrl":"\/upload\/20160427\/face_1461742004498.jpg"}]},"errorMessages":[],"errors":{},"fieldErrors":{},"keyId":null,"locale":"zh_CN","texts":null}
	//TODO：默认数据
//	data:{}
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
			options.ding.draggable({revert: true});
		}
	},
	resetEl:function(){
		options.el.css({"width":"100%","height":"auto","left":"0","top":"0"}).fadeIn();
	},
	showData:function(data){
		var data = data.data.infos,
			html = "",
			errorData = "";
		if(!data){
			alert("未取得数据，请检查数据连接");
			return;
		}
		for (var i = 0; i < data.length; i++) {
			if(data[i].coordinate){
				//拆分坐标点
				var point = data[i].coordinate.split(","),
					top = point[0],
					left = point[1];
			}else{
				//获取不到坐标信息时更新错误记录并跳过当前信息
				errorData += data[i].persnName + " ";
				
				continue;
			}
			html += '<div class="human-info" style="top:'+top+'%;left:'+left+'%"><img class="human-img" src="' + data[i].iconUrl + '"/>'+
							'<div class="human-slide"><div class="human-top">姓名： '+ data[i].persnName +'</div><div class="human-slide-content">'+
				
							'<dl><dt>流程:</dt><dd class="w100"><ul>';
			for(var j = data[i].details.length -1;0 < j; j--){
//				var createDate = data[i].details[j].createDate;
//					createDate = createDate.replace(/-/g,"/");
//				var cDate = new Date(createDate);
				 html += '<li>' + data[i].details[j].roomName + ' ( '+data[i].details[j].createDate+' ) </li>'
			}									
			html += '</ul></dd></dl></div></div></div>'
		}
		options.el.append(html);
		//绑定hover事件
		options.el.find(".human-info").hover(function(){
			$(this).css("z-index","999").find(".human-slide").stop().fadeIn();
			},function(){
				$(this).css("z-index","2").find(".human-slide").stop().fadeOut();
			});
			//显示错误信息
		if(errorData){
			alert("人员: "+errorData+"房间数据无法识别，请检查");
		}
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
	zooming.add=function(obj,min){//第一个参数指定可以缩放的图片，min指定最小缩放的大小 ,default to 80 
	zooming.min=min || 80; 
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
 * 加载
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

