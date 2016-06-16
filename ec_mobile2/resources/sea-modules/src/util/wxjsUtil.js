define(function(require, exports, module) {
	var $ = require('$');
	var wx = require('wx');

	wx.config({
	    //debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
	    appId: '${appId}', // 必填，公众号的唯一标识
	    timestamp: '${timestamp}', // 必填，生成签名的时间戳
	    nonceStr: '${nonceStr}', // 必填，生成签名的随机串
	    signature: '${signature}',// 必填，签名，见附录1
	    jsApiList: ['chooseImage','uploadImage', 'openLocation','getLocation','scanQRCode'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
	});

	//上传图片,参数回调方法
	exports.uploadImgs = function (onComplete){
		//返回
		//图片url,serverId
		wx.chooseImage({
		    success: function (res) {
		        var localIds = res.localIds;
		        var map = {};
		        var cb = function(){
		        	var arr = [];
		        	for(var i = 0;i < localIds.length;i ++){
		        		var img = {};
		        		var localId = localIds[i].toString();
		        		img.src = localId;
		        		img.serverId = map[localId];
		        		arr.push(img);
		        	}
		        	onComplete(arr);
		        };
		        var cloneIds = [];
		        for(var i = 0;i < localIds.length;i ++){
		        	cloneIds.push(localIds[i]);
		        }
		        var uploadImage = function(){
		        	var localId = cloneIds.shift();
		        	if(localId){
		        		localId = localId.toString();
		        		wx.uploadImage({
						    localId:localId, // 需要上传的图片的本地ID，由chooseImage接口获得
						    isShowProgressTips: 1, // 默认为1，显示进度提示
						    success: function (res) {
						        var serverId = res.serverId; // 返回图片的服务器端ID
						        map[localId] = serverId.toString();
						        setTimeout(uploadImage,100);
						    }
						});
		        	}else{
		        		cb();
		        	}
		        }
		        
		        setTimeout(uploadImage,100);
		    }
		});
	}

});