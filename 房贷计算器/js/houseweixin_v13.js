

function g(n) {
	var a = document.cookie.match(new RegExp("(^|; ?)" + n + "=([^;]*)(;|$)"));
	return a == null ? "" : unescape(a[2]);
}
function getUrlParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if (r != null)
		return unescape(r[2]);
	return null;
}
if (typeof g_info != "undefined") {
	var pagetitle = document.title;
	if (typeof g_info.title != "undefined") {
		pagetitle = g_info.title;
	}
	g_info.shareMsg = "【" + pagetitle + "】" + "\r\n" + "为您提供全方位楼盘信息，足不出户获得身临其境的看房新体验！";
	g_info.shareMsgNoBL = "【" + pagetitle + "】" + "为您提供全方位楼盘信息，足不出户获得身临其境的看房新体验！";
}
var FObjId = function (s) {
	return (typeof s == "object") ? s : document.getElementById(s);
};
var FBrowser = (function () {
	var ua = navigator.userAgent;
	var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
	return {
		isIE : !!window.attachEvent && !isOpera,
		isOpera : isOpera,
		isSafari : ua.indexOf('AppleWebKit/') > -1,
		isFirefox : ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
		MobileSafari : /Apple.*Mobile.*Safari/.test(ua),
		isChrome : !!window.chrome
	};
})();
FBrowser.isIE6 = FBrowser.isIE && !window.XMLHttpRequest;
FBrowser.isIE7 = FBrowser.isIE && !!window.XMLHttpRequest;
function Fid(id) {
	return document.getElementById(id);
}
var FJsLoader = {
	load : function (sId, sUrl, fCallback, chset) {
		try {
			FObjId(sId).parentNode.removeChild(FObjId(sId));
		} catch (e) {}
		var _script = document.createElement("script");
		_script.setAttribute("id", sId);
		_script.setAttribute("type", "text/javascript");
		_script.setAttribute("src", sUrl);
		if (chset)
			_script.setAttribute("charset", chset);
		else
			_script.setAttribute("charset", "utf-8");
		document.getElementsByTagName("head")[0].appendChild(_script);
		if (FBrowser.isIE) {
			_script.onreadystatechange = function () {
				if (this.readyState == "loaded" || this.readyState == "complete") {
					try {
						FObjId(_script).parentNode.removeChild(FObjId(_script));
					} catch (e) {}
					fCallback();
				}
			};
		} else if (FBrowser.isFirefox || FBrowser.isSafari || FBrowser.isOpera || FBrowser.isChrome) {
			_script.onload = function () {
				try {
					FObjId(_script).parentNode.removeChild(FObjId(_script));
				} catch (e) {}
				fCallback();
			};
		} else {
			try {
				FObjId(_script).parentNode.removeChild(FObjId(_script));
			} catch (e) {}
			fCallback();
		}
	}
};
(function () {
	var cache = {};
	this.tmpl = function tmpl(str, data) {
		var fn = !/\W/.test(str) ? cache[str] = cache[str] || tmpl(document.getElementById(str).innerHTML) : new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" +
				str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'")
				 + "');}return p.join('');");
		return data ? fn(data) : fn;
	};
})();
var HouseWxBridgeReady = {
	init : function () {
		HouseWxBridgeReady.shareAppMessage();
		HouseWxBridgeReady.shareTimeline();
		HouseWxBridgeReady.shareWeibo();
	},
	shareAppMessage : function () {
		WeixinJSBridge.on("menu:share:appmessage", function (b) {
			bossSend(g_info.actname + 'share_pengyou');
			bossSend(g_info.actname + 'share');
			bossSend('share');
			WeixinJSBridge.invoke("sendAppMessage", {
				appid : "",
				img_url : g_info.coverPicUrl,
				img_width : "65",
				img_height : "65",
				link : document.location.href,
				desc : "【" + pagetitle + "】",
				title : g_info.houseName
			}, function (d) {
				WeixinJSBridge.log(d.err_msg);
			})
		});
	},
	shareTimeline : function () {
		WeixinJSBridge.on("menu:share:timeline", function (b) {
			bossSend(g_info.actname + 'share_quan');
			bossSend(g_info.actname + 'share');
			bossSend('share');
			WeixinJSBridge.invoke("shareTimeline", {
				img_url : g_info.coverPicUrl,
				img_width : "65",
				img_height : "65",
				link : document.location.href,
				desc : "【" + pagetitle + "】",
				title : g_info.houseName + '-' + pagetitle
			}, function (d) {
				WeixinJSBridge.log(d.err_msg);
			})
		});
	},
	shareWeibo : function () {
		var url = document.location.href;
		WeixinJSBridge.on('menu:share:weibo', function (argv) {
			bossSend(g_info.actname + 'share_weibo');
			bossSend(g_info.actname + 'share');
			bossSend('share');
			WeixinJSBridge.invoke('shareWeibo', {
				"content" : g_info.houseName + "【" + pagetitle + "】" + document.location.href,
				"url" : document.location.href
			}, function (res) {
				WeixinJSBridge.log(res.err_msg);
			});
		})
	}
}
if (typeof WeixinJSBridge != "undefined" && WeixinJSBridge.invoke) {
	HouseWxBridgeReady.init();
	try {
		WeixinJSBridge.invoke('hideToolbar');
	} catch (e) {}

} else {
	document.addEventListener("WeixinJSBridgeReady", HouseWxBridgeReady.init);
	document.addEventListener("WeixinJSBridgeReady", function () {
		try {
			WeixinJSBridge.invoke('hideToolbar');
		} catch (e) {}

	});
};
var page_detail = {
	init : function () {
		function L$(src) {
			if (typeof(src) === 'string') {
				src = document.getElementById(src);
			}
			return src;
		}
		function FoldPanel(id) {
			this.btn = L$(id);
			this.hidePanel = this.btn.parentNode.parentNode.getElementsByTagName("div")[0];
			var _this = this;
			this.btn.onclick = function () {
				if (!_this.hidePanel.style.display || _this.hidePanel.style.display === "none") {
					_this.hidePanel.style.display = "block";
					this.innerHTML = '收起<em class="up"></em>';
				} else {
					_this.hidePanel.style.display = "none";
					this.innerHTML = '更多<em class="down"></em>';
				}
			};
		}
		var panel1 = new FoldPanel("bulidIntro");
		if (surroundflag == 0) {
			var panel2 = new FoldPanel("peripheral");
		} else if (surroundflag == 1) {
			if (document.getElementById('peitaoall') != null) {
				document.getElementById('peitaoall').style.display = 'none';
			}
			document.getElementById('peitaoless').style.display = 'block';
		}
	},
	showMoreSurround : function () {
		var aobj = document.getElementById('peripheral');
		if (aobj != null && aobj.innerHTML == '更多<em class="down"></em>') {
			document.getElementById('peitaoless').style.display = 'none';
			document.getElementById('peitaoall').style.display = 'block';
			aobj.innerHTML = '收起<em class="up"></em>';
		} else if (aobj != null && aobj.innerHTML == '收起<em class="up"></em>') {
			document.getElementById('peitaoless').style.display = 'block';
			document.getElementById('peitaoall').style.display = 'none';
			aobj.innerHTML = '更多<em class="down"></em>';
		}
	}
};
var page_kanfangsignup = {
	init : function () {
		function $(id) {
			return document.getElementById(id);
		}
		function trim(str) {
			return str.replace(/(^\s*)|(\s*$)/g, "");
		}
		$('username').onblur = function () {
			console.log(this.value);
			this.className = 'input_focus';
		}
		$('phone').onblur = function () {
			this.className = 'input_focus';
		}
		function formCheck() {
			if (trim($('username').value) == '') {
				showTip(false, '请填写姓名');
				return;
			}
			if ($('username').value.length > 10) {
				showTip(false, '姓名太长');
				return;
			}
			if (trim($('phone').value) == '') {
				showTip(false, '请填写手机号');
				return;
			}
			var regExp = new RegExp('^1[0-9]{10}$');
			if (!regExp.test(trim($('phone').value))) {
				showTip(false, '请填写正确的手机号码');
				return;
			}
			document.getElementById('post_form').submit();
			document.getElementById('weixin_signup').onclick = false;
			return;
		}
		window.formCheck = formCheck;
		var timer = null;
		function showTip(success, msg) {
			msg = msg || '';
			var tip = $('popup_box');
			var html = '';
			if (success) {
				html = '<span class="success"></span>' + '<p class="state">提交成功</p>';
			} else {
				html = '<span class="fail"></span>' + '<p class="state">提交失败</p>';
			}
			if (msg) {
				html += '<p class="tip">' + msg + '</p>';
			}
			tip.innerHTML = html;
			tip.style.display = 'block';
			if (timer != null) {
				clearTimeout(timer);
			}
			timer = setTimeout(function () {
					$('popup_box').style.display = 'none';
					timer = null;
				}, 3000);
		}
		function postDataHandler(result) {
			if (result.ret == 0) {
				showTip(true);
				$('username').value = '';
				$('phone').value = '';
				$('sex_male').className = 'on';
				$('sex_female').className = '';
			} else if (result.ret < 0) {
				showTip(false, result.msg);
			}
			document.getElementById('weixin_signup').onclick = formCheck;
		}
		window.postDataHandler = postDataHandler;
		$('sex_male').onclick = function () {
			$('sex_male').className = 'on';
			$('sex_female').className = '';
			$('sex').value = 1;
		};
		$('sex_female').onclick = function () {
			$('sex_male').className = '';
			$('sex_female').className = 'on';
			$('sex').value = 2;
		};
	}
};
var page_groupbuy = {
	init : function () {
		function $(id) {
			return document.getElementById(id);
		}
		function trim(str) {
			return str.replace(/(^\s*)|(\s*$)/g, "");
		}
		$('username').onblur = function () {
			this.className = 'input_focus';
		}
		$('phone').onblur = function () {
			this.className = 'input_focus';
		}
		function formCheck() {
			if (trim($('username').value) == '') {
				showTip(false, '请填写姓名');
				return;
			}
			if ($('username').value.length > 10) {
				showTip(false, '姓名太长');
				return;
			}
			if (trim($('phone').value) == '') {
				showTip(false, '请填写手机号');
				return;
			}
			var regExp = new RegExp('^1[0-9]{10}$');
			if (!regExp.test(trim($('phone').value))) {
				showTip(false, '请填写正确的手机号码');
				return;
			}
			document.getElementById('post_form').submit();
		}
		window.formCheck = formCheck;
		function getLeftTime() {
			var leftSec = leftTime.day * 24 * 60 * 60 + leftTime.hour * 60 * 60 + leftTime.minute * 60 - 60;
			if (leftSec <= 0) {
				clearInterval(timer);
				$('leftTime').innerHTML = '活动已结束';
				return;
			}
			leftTime.day = Math.floor(leftSec / (24 * 60 * 60));
			leftSec = leftSec % (24 * 60 * 60);
			leftTime.hour = Math.floor(leftSec / (60 * 60));
			leftSec = leftSec % (60 * 60);
			leftTime.minute = Math.floor(leftSec / 60);
			leftSec = leftSec % 60;
			$('leftTime').innerHTML = "距离活动时间：<em>" + leftTime.day + "</em>天<em>" + leftTime.hour + "</em>小时<em>" + leftTime.minute + "</em>分";
		}
		var timer = null;
		if (hasActivity) {
			timer = setInterval(getLeftTime, 1000 * 60);
		}
		var timer = null;
		function showTip(success, msg) {
			msg = msg || '';
			var tip = $('popup_box');
			var html = '';
			if (success) {
				html = '<span class="success"></span>' + '<p class="state">提交成功</p>';
			} else {
				html = '<span class="fail"></span>' + '<p class="state">提交失败</p>';
			}
			if (msg) {
				html += '<p class="tip">' + msg + '</p>';
			}
			tip.innerHTML = html;
			tip.style.display = 'block';
			if (timer != null) {
				clearTimeout(timer);
			}
			timer = setTimeout(function () {
					$('popup_box').style.display = 'none';
					timer = null;
				}, 3000);
		}
		function postDataHandler(result) {
			if (result.ret == 0) {
				showTip(true);
				$('username').value = '';
				$('phone').value = '';
				$('sex_male').className = 'on';
				$('sex_female').className = '';
			} else if (result.ret < 0) {
				showTip(false, result.msg);
			}
		}
		window.postDataHandler = postDataHandler;
		$('sex_male').onclick = function () {
			$('sex_male').className = 'on';
			$('sex_female').className = '';
			$('sex').value = 1;
		};
		$('sex_female').onclick = function () {
			$('sex_male').className = '';
			$('sex_female').className = 'on';
			$('sex').value = 2;
		};
		if ($('bulidIntro') != null) {
			var flag = false;
			$('bulidIntro').onclick = function () {
				if (flag == false) {
					flag = true;
					$('actInfoPart').style.display = 'none';
					$('actInfoAll').style.display = 'block';
					$('bulidIntro').innerHTML = '收起<em class="up"></em>';
				} else {
					flag = false;
					$('actInfoPart').style.display = 'block';
					$('actInfoAll').style.display = 'none';
					$('bulidIntro').innerHTML = '更多<em class="down"></em>';
				}
			};
		}
	}
};
var page_map = {
	map : null,
	housePosition : null,
	userPosition : null,
	positionTimerId : null,
	timeoutMillSec : 5000,
	isShowError : false,
	init : function () {
		var Label = function (opts, address) {
			soso.maps.Overlay.call(this, opts);
			this.address = address;
		};
		Label.prototype = new soso.maps.Overlay();
		Label.prototype.construct = function () {
			this.dom = document.createElement('div');
			this.dom.style.cssText = 'position:absolute;width:250px;margin-left:-125px;background: rgba(255,255,255,.8);border-radius:10px;-webkit-box-shadow: 0 0 6px rgba(0,0,0,.7); border:1px solid #BEBEB7;'
				var leftDiv = document.createElement('div');
			leftDiv.style.cssText = 'float:left;width:190px;min-height:54px;padding:4px;border-right:1px solid rgb(190, 190, 183);';
			leftDiv.innerHTML = this.address;
			var img = document.createElement('img');
			img.style.cssText = 'float:right;width:48px;position:absolute;top:50%;margin-top:-24px;z-index:500;';
			img.width = '48';
			img.height = '48';
			img.setAttribute('bosszone', 'mapnavarrow');
			img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJBJREFUeNrs2VEKgCAQRVFH2pH7X4JrGg38DAoamx7cB0IfgXMcSyJz96KcWsQDAAAAAAAAAACgBmit+RyagLP4dRmCqEnFlyhETSw+BGG7P2hWcU8msd77Lzvgwfd924G7bTRX3TgHACTm2PBapAMAACg8xFd5eyixhQAAAAAAAAC1GL9ZAQAAAACAcoYAAwBKviYUBGQ0LwAAAABJRU5ErkJggg==';
			img.addEventListener('click', function () {
				page_map.showDrivingLine();
			});
			this.dom.appendChild(leftDiv);
			this.dom.appendChild(img);
			this.getPanes().overlayMouseTarget.style.WebkitTransform = "translate3d(0, 0, 0)";
			this.getPanes().overlayMouseTarget.appendChild(this.dom);
		};
		Label.prototype.draw = function () {
			var position = this.get('position');
			if (position) {
				var pixel = this.getProjection().fromLatLngToDivPixel(position);
				this.dom.style.left = pixel.getX() + 'px';
				this.dom.style.top = (pixel.getY() - this.dom.offsetHeight - 40) + 'px';
			}
		};
		Label.prototype.destroy = function () {
			this.dom.parentNode.removeChild(this.dom);
		};
		var map,
		houselocation;
		var that = this;
		var container = document.getElementById("container");
		var position = new soso.maps.LatLng(lat, lng);
		this.housePosition = position;
		if (lat != '' && lng != '') {
			map = new soso.maps.Map(container, {
					center : new soso.maps.LatLng(lat, lng),
					zoomLevel : 15,
					mapTypeControl : false,
					panControl : false,
					zoomControl : false,
				});
			this.map = map;
			var label = new Label({
					map : map,
					position : position
				}, address);
			houselocation = new soso.maps.Marker({
					map : map,
					position : position
				});
		} else {}
		function throttle(func, wait, options) {
			var context,
			args,
			result;
			var timeout = null;
			var previous = 0;
			options || (options = {});
			var later = function () {
				previous = options.leading === false ? 0 : new Date;
				timeout = null;
				result = func.apply(context, args);
			};
			return function () {
				var now = new Date;
				if (!previous && options.leading === false)
					previous = now;
				var remaining = wait - (now - previous);
				context = this;
				args = arguments;
				if (remaining <= 0) {
					clearTimeout(timeout);
					timeout = null;
					previous = now;
					result = func.apply(context, args);
				} else if (!timeout && options.trailing !== false) {
					timeout = setTimeout(later, remaining);
				}
				return result;
			};
		};
		var interval = 300;
		var control = 0;
		var maxZoom = 18;
		var minZoom = 6;
		var controlFunc = throttle(function () {
				switch (control) {
				case 1:
					if (maxZoom > map.getZoom()) {
						map.zoomBy(1);
					}
					break;
				case 2:
					if (minZoom < map.getZoom()) {
						map.zoomBy(-1);
					}
					break;
				}
			}, interval);
		Fid('zoomin_button').onclick = function () {
			control = 1;
			controlFunc();
		};
		Fid('zoomout_button').onclick = function () {
			control = 2;
			controlFunc();
		};
		Fid('position_button').onclick = throttle(function () {
				map.setCenter(position);
			}, interval);
		window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function () {
			setTimeout(function () {
				map.setCenter(position);
			}, 100);
		}, false);
	},
	showDrivingLine : function () {
		if (page_map.userPosition != null) {
			page_map.drivingLine(page_map.map, page_map.userPosition, page_map.housePosition);
		} else {
			page_map.getUserLocation(function (userPosition) {
				page_map.userPosition = userPosition;
				page_map.drivingLine(page_map.map, page_map.userPosition, page_map.housePosition);
			});
		}
	},
	drivingLine : function (map, from, to) {
		function clearOverlay(overlays) {
			var overlay;
			while (overlay = overlays.pop()) {
				overlay.setMap(null);
			}
		}
		var route_lines = [];
		var user_position_marker;
		var directionsService = new soso.maps.DrivingService({
				complete : function (response) {
					var start = response.detail.start,
					end = response.detail.end;
					var anchor = new soso.maps.Point(6, 6),
					size = new soso.maps.Size(24, 36),
					user_icon = new soso.maps.MarkerImage('http://api.map.soso.com/v2/0/8c/theme/default/imgs/marker.png', size, new soso.maps.Point(0, 0), anchor);
					user_position_marker && user_position_marker.setMap(null);
					clearOverlay(route_lines);
					user_position_marker = new soso.maps.Marker({
							icon : user_icon,
							position : from,
							map : map,
							zIndex : 1
						});
					directions_routes = response.detail.routes;
					for (var i = 0; i < directions_routes.length; i++) {
						var route = directions_routes[i],
						legs = route;
						map.fitBounds(response.detail.bounds);
						var steps = legs.steps;
						route_steps = steps;
						polyline = new soso.maps.Polyline({
								path : route.path,
								strokeColor : '#3893F9',
								strokeWeight : 6,
								map : map
							})
							route_lines.push(polyline);
					}
				}
			});
		directionsService.setPolicy(soso.maps.DrivingPolicy['LEAST_DISTANCE']);
		directionsService.search(from, to);
	},
	showError : function (msg, scope) {
		scope = scope || this;
		msg = msg || '';
		var tip = document.getElementById('popup_box');
		var html = '';
		if (msg) {
			html += '<p class="tip">' + msg + '</p>';
		}
		tip.innerHTML = html;
		tip.style.display = 'block';
		if (scope.isShowError) {}
		else {
			scope.isShowError = true;
			setTimeout(function () {
				tip.style.display = 'none';
				scope.isShowError = false;
			}, 3000);
		}
	},
	fail : function (scope) {
		scope = scope || this;
		scope.showError('定位超时，请稍后重试', scope);
	},
	success : function (callback, userPosition, scope) {
		scope = scope || this;
		callback(userPosition);
	},
	startPositionTimer : function (scope) {
		scope = scope || this;
		scope.positionTimerId = setTimeout(function () {
				scope.fail();
				scope.positionTimerId = null;
			}, scope.timeoutMillSec);
	},
	stopPositionTimer : function (scope) {
		scope = scope || this;
		if (scope.positionTimerId == null) {
			return;
		}
		clearTimeout(scope.positionTimerId);
		scope.positionTimerId = null;
	},
	locateUserWithHTML5 : function (callback, scope) {
		scope = scope || page_map;
		scope.startPositionTimer();
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (position) {
				scope.stopPositionTimer(scope);
				var position = new soso.maps.LatLng(position.coords.latitude, position.coords.longitude);
				scope.success(callback, position, scope);
			}, function (error) {
				scope.stopPositionTimer(scope);
				scope.fail(scope);
			});
		} else {
			scope.fail(scope);
		}
	},
	getUserLocation : function (callback) {
		var that = this;
		if (userLatLngFlag) {
			var position = new soso.maps.LatLng(userLat, userLng);
			that.success(callback, position, that);
		} else {
			if (openid != null) {
				var url = '/index.php?mod=houseweixin&act=getuserlocation&openid=' + openid;
				FJsLoader.load('getuserlocation', url, function () {
					if (!userLat && !userLng) {
						that.locateUserWithHTML5(callback, that);
					} else {
						var position = new soso.maps.LatLng(userLat, userLng);
						that.success(callback, position, that);
					}
				});
			} else {
				that.locateUserWithHTML5(callback, that);
			}
		}
	}
};
var page_pic = {
	init : function () {
		var bindFlag = false;
		var zeptoLoadSuccess = false;
		var iscrollLoadSuccess = false;
		var pattern = /MicroMessenger/i;
		if (!pattern.test(navigator.userAgent)) {
			setTimeout(function () {
				if (typeof WeixinJSBridge == "undefined") {
					bindFlag = true;
					FJsLoader.load('zepto', 'http://mat1.gtimg.com/www/webapp/js/zepto.min.js', function () {
						zeptoLoadSuccess = true;
						if (iscrollLoadSuccess) {
							bigMapViewer();
						}
					});
					FJsLoader.load('iscroll', 'http://mat1.gtimg.com/joke/wxauto/iscroll.js', function () {
						iscrollLoadSuccess = true;
						if (zeptoLoadSuccess) {
							bigMapViewer();
						}
					});
					window.bigMapViewer = function () {
						if (iscroll) {
							iscroll.destroy();
						}
						var picInfoList = [];
						for (var i = 0; i < thumbPicList.length; i++) {
							picInfoList.push({
								thumbPicUrl : thumbPicList[i],
								initPicUrl : 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',
								style : '',
								imgHeight : 0,
								imgWidth : 0
							});
						}
						var bigPicIndex = 0;
						function resetImg(img, imgInfo) {
							var w = $(window).width();
							var h = $(window).height();
							if (w >= h) {
								imgInfo.style = "height:" + h + "px;width:auto;";
								if (imgInfo.imgHeight != 0) {
									img.css({
										height : h + 'px',
										width : 'auto',
										marginTop : '0px'
									});
								}
							} else {
								imgInfo.style = "width:" + w + "px;height:auto;";
								if (imgInfo.imgHeight != 0) {
									var marginTop = parseInt((h - imgInfo.imgHeight * w / imgInfo.imgWidth) / 2);
									img.css({
										height : 'auto',
										width : w + 'px',
										marginTop : marginTop + 'px'
									});
									imgInfo.style += "margin-top:" + marginTop + "px;";
								}
							}
						}
						function relayoutIScroll(show) {
							var show = show || false;
							var w = $(window).width();
							var h = $(window).height();
							for (var i = 0; i < thumbPicList.length; i++) {
								var img = $('#gallery img').eq(i);
								if (img.attr('src') == img.data('src')) {
									resetImg(img, picInfoList[i]);
								}
							}
							var html = tmpl("iscroll_tmpl", {
									picList : picInfoList,
									liWidth : w,
									liHeight : h
								});
							$('#scroller').css('width', w * picInfoList.length + 'px');
							$('#scroller').html(html);
							if (!iscroll) {
								iscroll = new iScroll('gallery', {
										zoom : false,
										snap : true,
										momentum : false,
										hScrollbar : false,
										vScrollbar : false,
										fixScrollBar : false,
										hScroll : true,
										onScrollEnd : function () {
											if (this.dirX != 0) {
												bigPicIndex = this.currPageX;
												showBigImg(this.currPageX);
											}
										}
									});
							} else {
								if (show) {
									showBigImg(bigPicIndex, true);
								}
							}
						}
						var iscroll = null;
						var iscrollIsShow = false;
						relayoutIScroll(iscrollIsShow);
						$("#btn_close").click(function () {
							$('.wrap').css('overflow-y', 'auto');
							$(".bigImg").hide();
							iscrollIsShow = false;
						});
						window.showBigImg = function (index, refresh) {
							iscrollIsShow = true;
							$('.wrap').css('overflow-y', 'hidden');
							if (index < 0 || index >= thumbPicList.length) {
								return;
							}
							$(".bigImg").show();
							$("#btn_close").show();
							if (refresh) {
								iscroll.refresh();
								iscroll.scrollToElement($('#iscroll_li_' + index)[0], 0);
							}
							var img = $('#gallery img').eq(index);
							var imgUrl = img.data('src');
							picInfoList[index].initPicUrl = imgUrl;
							setTimeout(function () {
								var aImg = new Image();
								aImg.src = imgUrl;
								if (aImg.complete) {
									picInfoList[index].imgWidth = aImg.width;
									picInfoList[index].imgHeight = aImg.height;
									resetImg(img, picInfoList[index]);
									img.attr('src', imgUrl);
								} else {
									aImg.onload = function () {
										picInfoList[index].imgWidth = aImg.width;
										picInfoList[index].imgHeight = aImg.height;
										resetImg(img, picInfoList[index]);
										img.attr('src', imgUrl);
									};
								}
							}, 0);
						}
						window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function () {
							setTimeout(function () {
								relayoutIScroll(iscrollIsShow);
							}, 100);
						}, false);
					}
				}
			}, 0);
		}
		function showBigPic(curPicUrl, picUrlList) {
			WeixinJSBridge.invoke("imagePreview", {
				current : curPicUrl,
				urls : picUrlList
			});
		}
		window.refreshPicList = function (retData) {
			if (retData.ret == 1) {
				document.getElementById('leftLi').innerHTML = '';
				document.getElementById('rightLi').innerHTML = '';
				var picList = retData.data;
				setTimeout(function () {
					var alltype = document.getElementById('bdlv').getElementsByTagName('li');
					var alltypelen = alltype.length;
					for (var i = 0; i < alltypelen; i++) {
						alltype[i].className = '';
						var tmp = alltype[i].getAttribute('id').split('_')[1];
						alltype[i].childNodes[1].childNodes[1].setAttribute('onclick', 'loadPicJson("/index.php?mod=houseweixin&act=picbytype&aid=' + picList.aid + '&type=' + tmp + '", ' + tmp + ')');
					}
					var type = document.getElementById('page_' + picList.type);
					type.className = 'active';
					type.childNodes[1].childNodes[1].setAttribute('onclick', '');
				}, 100);
				iPage = 1;
				iBtn = true;
				thumbPicIndex = 0;
				thumbPicFlag = false;
				thumpPicIndexCounter = 0;
				aPicList = eval('(' + picList.big + ')');
				thumbPicList = eval('(' + picList.thumb + ')');
				if (zeptoLoadSuccess && iscrollLoadSuccess) {
					bigMapViewer();
				}
				getList();
			}
		};
		function loadPicJson(typeUrl, type) {
			FJsLoader.load('pic_type', typeUrl, function () {});
			window.location.hash = type;
		}
		window.loadPicJson = loadPicJson;
		var oUlList = document.getElementById('ulList');
		var oUl = oUlList.getElementsByTagName('ul');
		var iLen = oUl.length;
		var iPage = 1;
		var iBtn = true;
		var thumbPicIndex = 0;
		var thumbPicNumPerList = 20;
		var thumbPicFlag = false;
		var thumpPicIndexCounter = 0;
		function getList() {
			var data = getPicList();
			if (data.length == 0) {
				return;
			}
			var i = 0;
			function show() {
				if (i == data.length) {
					iBtn = true;
					return;
				}
				if (thumpPicIndexCounter >= thumbPicList.length) {
					return;
				}
				var timer = setTimeout(function () {
						if ((thumpPicIndexCounter + 1) % thumbPicNumPerList == 0) {
							getList();
						} else {
							show();
						}
					}, 10000);
				var _index = getSort();
				var oDiv = document.createElement('li');
				var aImg = document.createElement('img');
				var picbosszone = '';
				if (cur_type == 6) {
					picbosszone = 'yangbanjianpic';
				} else if (cur_type == 5) {
					picbosszone = 'xiaoguotupic';
				} else if (7) {
					picbosszone = 'guihuatupic';
				} else if (4) {
					picbosszone = 'xiaoqushijingpic';
				} else if (8) {
					picbosszone = 'zhoubianpeitaopic';
				}
				oDiv.setAttribute('bosszone', picbosszone);
				aImg.src = pic_loading;
				aImg.setAttribute('style', 'width:127px');
				aImg.setAttribute('data-index', thumpPicIndexCounter);
				oDiv.appendChild(aImg);
				var aIcon = document.createElement('div');
				aIcon.setAttribute('class', 'photo');
				oDiv.appendChild(aIcon);
				oUl[_index].appendChild(oDiv);
				var oImage = new Image();
				oImage.onload = function () {
					aImg.src = this.src;
					clearTimeout(timer);
					show();
				};
				oImage.onerror = function () {
					clearTimeout(timer);
					show();
				};
				oImage.onabort = function () {
					clearTimeout(timer);
					show();
				};
				oImage.src = thumbPicList[thumpPicIndexCounter];
				if (typeof WeixinJSBridge != "undefined" && WeixinJSBridge.invoke) {
					aImg.onclick = (function (i) {
						return function () {
							showBigPic(aPicList[i], aPicList);
						}
					})(thumpPicIndexCounter);
				} else {
					if (bindFlag) {
						aImg.onclick = (function (i) {
							return function () {
								showBigImg(i, true);
							}
						})(thumpPicIndexCounter);
					} else {
						document.addEventListener("WeixinJSBridgeReady", (function (aImg, i) {
								return function () {
									aImg.onclick = function () {
										showBigPic(aPicList[i], aPicList);
									};
								};
							})(aImg, thumpPicIndexCounter));
					}
				};
				i++;
				thumpPicIndexCounter++;
			}
			show();
		}
		getList();
		window.onscroll = function () {
			var _index = getSort();
			var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
			var ih = scrollTop + document.documentElement.clientHeight + 100;
			if (iBtn) {
				iBtn = false;
				iPage++;
				getList();
			}
		}
		function getTop(obj) {
			var iTop = 0;
			while (obj) {
				iTop += obj.offsetTop;
				obj = obj.offsetParent;
			}
			return iTop;
		}
		function getSort() {
			var v = oUl[0].offsetHeight;
			var _index = 0;
			for (var i = 1; i < iLen; i++) {
				if (oUl[i].offsetHeight < v) {
					v = oUl[i].offsetHeight;
					_index = i;
				}
			}
			return _index;
		}
		function getPicList() {
			var picList = [];
			if (thumbPicFlag) {
				return [];
			}
			var end = thumbPicIndex + thumbPicNumPerList;
			if (end > thumbPicList.length - 1) {
				end = thumbPicList.length;
				thumbPicFlag = true;
			}
			for (; thumbPicIndex < end; thumbPicIndex++) {
				picList[picList.length] = thumbPicList[thumbPicIndex];
			}
			thumbPicIndex = end;
			return picList;
		}
	}
};
var page_unitpic = {
	init : function () {
		window.MOUSE_DOWN = 'ontouchstart' in document ? 'touchstart' : 'mousedown';
		window.MOUSE_UP = 'ontouchend' in document ? 'touchend' : 'mouseup';
		window.MOUSE_MOVE = 'ontouchmove' in document ? 'touchmove' : 'mousemove';
		var oBtnMagnify = document.getElementById('btn_magnify');
		var oBtnReductor = document.getElementById('btn_reductor');
		var page = 1;
		var oDiv = document.getElementById('imgDiv');
		oBtnMagnify.addEventListener('click', dargBegin, false);
		oBtnReductor.addEventListener('click', dargEnd, false);
		function dargBegin() {
			if (!(thumbPicList[iscroll.currPageX].imgHeight == 0)) {
				startMove();
				$('#dargImg').show();
				$('#btn_magnify').hide();
				$('#btn_reductor').show();
			} else {
				var img = $('#gallery img').eq(iscroll.currPageX);
				loadAndShowImg(img, thumbPicList[iscroll.currPageX], function () {
					$('#dargImg').show();
					$('#btn_magnify').hide();
					$('#btn_reductor').show();
				});
			}
			var disX = 0;
			var disY = 0;
			var prevX = 0;
			var prevY = 0;
			$('#dargImg').ontouchstart = function (e) {
				e.preventDefault()
			};
			oDiv.addEventListener(MOUSE_DOWN, touchDiv, false);
			function touchDiv(ev) {
				if (ev.targetTouches.length == 1) {
					ev.preventDefault();
					ev = ev.targetTouches[0];
					disX = ev.pageX - oDiv.offsetLeft;
					disY = ev.pageY - oDiv.offsetTop;
					prevX = ev.pageX;
					prevY = ev.pageY;
					oDiv.addEventListener(MOUSE_MOVE, oDivTouchmove, false);
					oDiv.addEventListener(MOUSE_UP, oDivTouchend, false);
				}
				function oDivTouchmove(ev) {
					if (ev.targetTouches.length == 1) {
						ev.preventDefault();
						ev = ev.targetTouches[0];
						oDiv.style.left = ev.pageX - disX + 'px';
						oDiv.style.top = ev.pageY - disY + 'px';
						prevX = ev.pageX;
						prevY = ev.pageY;
					}
				}
				function oDivTouchend(ev) {
					oDiv.removeEventListener(MOUSE_UP, oDivTouchend, false);
					oDiv.removeEventListener(MOUSE_MOVE, oDivTouchmove, false);
					startMove();
				}
			}
		};
		function startMove() {
			var W = window.innerWidth,
			H = window.innerHeight;
			var w = parseInt(oDiv.style.width),
			h = parseInt(oDiv.style.height);
			var L = oDiv.offsetLeft,
			T = oDiv.offsetTop;
			var w_DIF = W - w,
			h_DIF = H - h;
			if (w_DIF >= 0 && h_DIF >= 0) {
				oDiv.style.left = parseInt((W - w) / 2) + 'px';
				oDiv.style.top = parseInt((H - h) / 2) + 'px';
			} else if (h_DIF >= 0 && w_DIF < 0) {
				if (L < w_DIF) {
					L = w_DIF;
				} else if (L > 0) {
					L = 0;
				}
				oDiv.style.left = L + 'px';
				oDiv.style.top = parseInt((H - h) / 2) + 'px';
			} else if (w_DIF >= 0 && h_DIF < 0) {
				if (T < h_DIF) {
					T = h_DIF;
				} else if (T > 0) {
					T = 0;
				}
				oDiv.style.left = parseInt((W - w) / 2) + 'px';
				oDiv.style.top = T + 'px';
			} else {
				if (L < w_DIF) {
					L = w_DIF;
				} else if (L > 0) {
					L = 0;
				}
				if (T < h_DIF) {
					T = h_DIF;
				} else if (T > 0) {
					T = 0;
				}
				oDiv.style.left = L + 'px';
				oDiv.style.top = T + 'px';
			}
		}
		function dargEnd() {
			$('#dargImg').hide();
			$('#btn_magnify').show();
			$('#btn_reductor').hide();
		}
		function resize() {
			startMove();
		}
		window.addEventListener("resize", resize, false);
		function loadingBegin() {
			$('#house_more').hide();
			$('#pic_loading').show();
		}
		function loadingEnd() {
			$('#pic_loading').hide();
			$('#house_more').show();
		}
		function nextpage() {
			page++;
			loadingBegin();
			showMorePic();
			loadingEnd();
		}
		$('#house_more').click(nextpage);
		var thumbPicIndex = 0;
		var thumbPicFlag = false;
		var hasMore = true;
		var thumbNumPerPage = 5;
		window.refreshUnitPicList = function (retData) {
			var picList = retData.data;
			for (var i = 0; i < picList.length; i++) {
				picList[i].imgWidth = 0;
				picList[i].imgHeight = 0;
				picList[i].style = '';
				picList[i].initPicUrl = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
			}
			thumbPicList = thumbPicList.concat(picList);
			if (retData.ret == 1) {
				hasMore = false;
				$('#house_more').css('background', 'none');
				$('#house_more').html('已到最后一页了');
				$('#house_more').off('click');
			}
			_showPic(picList);
			relayoutIScroll(iscrollIsShow);
		};
		function _showPic(picList) {
			var len = picList.length;
			var html = '';
			for (var i = 0; i < len; i++) {
				var picInfo = picList[i];
				html += '<li bosszone="unitpic">';
				html += '<a href="javascript:void(0);" onclick="showBigImg(' + thumbPicIndex + ', true);">';
				html += ' <div class="picWarp">';
				html += '  <div class="picTab">';
				html += '   <div class="picTd">';
				html += '    <img src="' + picInfo.thumbPicUrl + '" />';
				html += '   </div>';
				html += '  </div>';
				html += ' </div>';
				html += ' <div class="txt">';
				html += '  <p>' + picInfo.title + '</p>';
				html += '  <p>' + picInfo.info + '</p>';
				html += '  <p>' + picInfo.area + '</p>';
				html += ' </div>';
				html += '</a>';
				html += '</li>';
				thumbPicIndex++;
			}
			$('#pic_list').append(html);
		}
		function showMorePic() {
			if (!hasMore) {
				return;
			}
			var url = "/index.php?mod=houseweixin&act=getunitpicbypage&aid=" + aid + "&page=" + page;
			FJsLoader.load('more_pic_ajax', url, function () {});
		}
		showMorePic();
		var bigPicIndex = 0;
		function resetImg(img, imgInfo) {
			var w = $(window).width();
			var h = $(window).height();
			if (w >= h) {
				imgInfo.style = "height:" + h + "px;width:auto;";
				if (imgInfo.imgHeight != 0) {
					img.css({
						height : h + 'px',
						width : 'auto',
						marginTop : '0px'
					});
				}
			} else {
				imgInfo.style = "width:" + w + "px;height:auto;";
				if (imgInfo.imgHeight != 0) {
					var marginTop = parseInt((h - imgInfo.imgHeight * w / imgInfo.imgWidth) / 2);
					img.css({
						height : 'auto',
						width : w + 'px',
						marginTop : marginTop + 'px'
					});
					imgInfo.style += "margin-top:" + marginTop + "px;";
				}
			}
		}
		function relayoutIScroll(show) {
			show = show || false;
			var w = $(window).width();
			var h = $(window).height();
			for (var i = 0; i < thumbPicList.length; i++) {
				var img = $('#gallery img').eq(i);
				if (img.attr('src') == img.data('src')) {
					resetImg(img, thumbPicList[i]);
				}
			}
			var html = tmpl("iscroll_tmpl", {
					picList : thumbPicList,
					liWidth : w,
					liHeight : h
				});
			$('#scroller').css('width', w * thumbPicList.length + 'px');
			$('#scroller').html(html);
			if (!iscroll) {
				iscroll = new iScroll('gallery', {
						zoom : false,
						snap : true,
						momentum : false,
						hScrollbar : false,
						vScrollbar : false,
						fixScrollBar : false,
						hScroll : true,
						onScrollEnd : function () {
							if (this.dirX != 0) {
								bigPicIndex = this.currPageX;
								showBigImg(this.currPageX);
							}
							if (this.currPageX % thumbNumPerPage >= 3 && this.dirX == 1) {
								nextpage();
							}
						}
					});
			} else {
				if (show) {
					showBigImg(bigPicIndex, true);
				}
			}
		}
		var iscroll = null;
		var iscrollIsShow = false;
		$("#btn_close").click(function () {
			$('#wrapper').removeClass('unitpicOverflowY');
			$(".bigImg").hide();
			iscrollIsShow = false;
			dargEnd();
		});
		function loadAndShowImg(img, imgInfo, callback) {
			setTimeout(function () {
				var aImg = new Image();
				aImg.src = imgInfo.picUrl;
				if (aImg.complete) {
					imgInfo.imgWidth = aImg.width;
					imgInfo.imgHeight = aImg.height;
					resetImg(img, imgInfo);
					img.attr('src', imgInfo.picUrl);
					$('#btn_magnify').show();
					oDiv.style.width = imgInfo.imgWidth + 'px';
					oDiv.style.height = imgInfo.imgHeight + 'px';
					oDiv.style.backgroundImage = 'url(' + imgInfo.picUrl + ')';
					oDiv.style.backgroundPosition = 'center center';
					oDiv.style.backgroundRepeat = 'no-repeat';
					if (typeof callback == 'function') {
						callback();
					}
					startMove();
				} else {
					aImg.onload = function () {
						imgInfo.imgWidth = aImg.width;
						imgInfo.imgHeight = aImg.height;
						resetImg(img, imgInfo);
						img.attr('src', imgInfo.picUrl);
						$('#btn_magnify').show();
						oDiv.style.width = imgInfo.imgWidth + 'px';
						oDiv.style.height = imgInfo.imgHeight + 'px';
						oDiv.style.backgroundImage = 'url(' + imgInfo.picUrl + ')';
						oDiv.style.backgroundPosition = 'center center';
						oDiv.style.backgroundRepeat = 'no-repeat';
						if (typeof callback == 'function') {
							callback();
						}
						startMove();
					};
				}
			}, 0);
		}
		window.showBigImg = function (index, refresh) {
			document.getElementById('pgv_iframe').src = '/unitpic_pgv.shtml?' + 'houseid=' + houseId + '&act=' + g_info.actname;
			if (index < 0 || index >= thumbPicList.length) {
				return;
			}
			bigPicIndex = index;
			iscrollIsShow = true;
			$('#wrapper').addClass('unitpicOverflowY');
			if (index % thumbNumPerPage >= 3) {
				nextpage();
			}
			$("#desc_unit").html(thumbPicList[index].title);
			$(".bigImg").show();
			$("#btn_close").show();
			if (refresh) {
				iscroll.refresh();
				iscroll.scrollToElement($('#iscroll_li_' + index)[0], 0);
			}
			var img = $('#gallery img').eq(index);
			var imgUrl = img.data('src');
			thumbPicList[index].initPicUrl = imgUrl;
			loadAndShowImg(img, thumbPicList[index]);
		}
		window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", function () {
			setTimeout(function () {
				relayoutIScroll(iscrollIsShow);
			}, 100);
		}, false);
	}
};
var page_feature = {
	init : function () {
		function adjustImg() {
			var maxWidth = $(window).width() - 30;
			var allImages = document.getElementsByTagName('img');
			for (var i = allImages.length - 1; i >= 0; i--) {
				var img = allImages[i];
				var imageRate = img.offsetWidth / img.offsetHeight;
				if (img.offsetWidth > maxWidth) {
					img.style.width = maxWidth + "px";
					img.style.height = maxWidth / imageRate + "px";
				}
			};
		}
		window.addEventListener("load", adjustImg, false);
		window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", adjustImg, false);
	}
};
var gBossZoneHandler = new bossZoneHandler();
var gImage;
var registerZone2 = gBossZoneHandler.registerZone2;
if (document.addEventListener)
	document.addEventListener("click", registerZone2, false);
else if (document.attachEvent)
	document.attachEvent("onclick", registerZone2);
function bossZoneHandler() {
	var sFlag = false;
	this.registerZone2 = function (ev, clickType) {
		var loopTryNum = 10;
		try {
			var zoneId = '';
			if (typeof clickType == 'undefined') {
				if (sFlag)
					return true;
				var ev = window.event || ev;
				var et = ev.srcElement || ev.target;
				for (var i = loopTryNum - 1, tagNode = et; i >= 0; i--, tagNode = tagNode.parentNode) {
					if (tagNode.attributes['bosszone']) {
						zoneId = tagNode.attributes['bosszone'].nodeValue;
						break;
					}
				}
			} else {
				zoneId = ev.bossZone;
				sFlag = true;
				setTimeout(function () {
					sFlag = false;
				}, 200);
			}
			if (!zoneId)
				return;
			bossSend(zoneId);
		} catch (e) {}

	}
}
function bossSend(zoneId) {
	var bossID = 1982;
	var a = document.cookie.match(new RegExp('(^|)o_cookie=([^;]*)(;|$)'));
	var iQQ = (a == null ? "" : unescape(a[2]));
	var b = document.cookie.match(new RegExp('(^|)wxid_' + aid + '=([^;]*)(;|$)'));
	var sBak1 = (b == null ? "" : unescape(b[2]));
	var c = document.cookie.match(new RegExp('(^|)uwxid_' + aid + '=([^;]*)(;|$)'));
	var sBak2 = (c == null ? "" : unescape(c[2]));
	var iCityId = cityId;
	var iHouseId = houseId;
	var ip = "";
	var iFrom = 1;
	var iurl = 'http://btrace.qq.com/collect?sIp=' + ip + '&iQQ=' + iQQ + '&sBiz=qq.com&sOp=' + zoneId + '&iSta=&iTy=' + bossID + '&iFlow=&iFrom=' + iFrom + '&iCityId=' + iCityId + '&iHouseId=' + iHouseId + '&iBak1=&iBak2=&sBak1=' + sBak1 + '&sBak2=' + sBak2;
	gImage = new Image(1, 1);
	gImage.src = iurl;
}
/*  |xGv00|cdf1c60c90eb66488149222e2bc79448 */