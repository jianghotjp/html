// 本地
//var SERVERURL = "http://10.40.120.94:7001/dooums/";
// 测试
var SERVERURL = "http://testdoosim.doosaninfracore.cn:7002/dooums/";
// 正式
//var SERVERURL = "http://dooums.doosaninfracore.cn/dooums/";

var page, rows = 10;
var VERSION = 'V1.4.6'; // 当前版本号

/**
 * 扩展jquery，将表格input转为json对象;serializeObject
 *
$.fn.serializeObject=function(){var o={};var a=this.serializeArray();$.each(a,function(){if(!this.value)return;if(o[this.name]){if(!o[this.name].push){o[this.name]=[o[this.name]];}o[this.name].push(this.value||'');}else{o[this.name]=this.value||'';}});return o;}
*/
// 创建数据库
function createTables() {
	if (DBCONNECT) {
		createTableNamedUser();
		createTableNamedRole();
		createTableNamedFunc();
		createTableNamedBrand();
		createTableNamedProduct();
		createTableNamedModel();
		createTableNamedCode();
		createTableNamedArea();
		createTableNamedTemplate();
		createTableNamedTemplateDetail();
        createTableNamedTemplateDetail2();
		createTableNamedTemplateClass();
		createTableNamedTemplatePhoto();
		createTableNamedTemplateLevel();
		createTablenamedTemplateDeprec();
		createTableNamedSyncLog();
		createTableNamedMachReg();
		createTableNamedCustomer();
		createTableNamedCustMachine();
		createTableNamedCustContact();
		createTableNamedApply();
		createTableNamedReport();
		createTableNamedReportDetail();
		createTableNamedEvalPhoto();
	} else {
        alertMsg("数据库连接失败");
    }
}

// 查询网络连接
function checkConnection() {
	var networkState = navigator.network.connection.type;///Users/jerei/Projects/dooums_mbl/FWPhone_iOS/platforms/ios/www/js/main.js
	var states = {};
	states[Connection.UNKNOWN]	= -2;	// 无法识别
	states[Connection.NONE]		= -1;	// 无
	states[Connection.WIFI]		=  1;	// WIFI
	states[Connection.CELL_2G]	=  2;	// 2G
	states[Connection.CELL_3G]	=  3;	// 3G
	states[Connection.CELL_4G]	=  4;	// 4G
	states[Connection.ETHERNET] =  5;	// 蜂窝
	states[Connection.CELL] 	=  6;	
	return states[networkState];
}

// 再次点击退出程序
function onBackKeyDown(){
	toast('再点击一次退出程序', 3500);
	document.removeEventListener("backbutton", onBackKeyDown, false); // 注销返回键
	document.addEventListener("backbutton", onExitApp, false); //绑定退出事件
	// 2秒后重新注册
	var intervalID = window.setInterval(function(){
		window.clearInterval(intervalID);
		document.removeEventListener("backbutton", onExitApp, false);
		document.addEventListener("backbutton", onBackKeyDown, false);
	}, 2000);
}

// 退出程序
function onExitApp() {
	window.localStorage.clear();
	navigator.app.exitApp();
}

function loginMode() {
	var mode = getStore("USERLOGINMODE");
	if (!mode || mode == 0) 
		return false;
	return true;
}

// 返回上一页
function back() {
	if (($(".ui-page").attr("id") || "").indexOf("add") != -1) {
		navigator.notification.confirm('如果离开，数据将不会保存', onConfirm, '确定离开本页面?', [ '确定', '取消' ]);
	} else {
		backFromSave();
	}
}

function backFromSave() {
	window.history.go((location.href.charAt(location.href.length - 1) == "#") ? -2 : -1);
}

function onConfirm(buttonIndex) {
	if (buttonIndex == 1) {
		backFromSave();
	}
}

// 存储数据
function insertStore(key, value) {
	window.localStorage.setItem(key, value);
}

// 移除数据
function removeStore(key) {
	window.localStorage.removeItem(key);
}

// 根据key值查询数据
function getStore(key) {
	return window.localStorage.getItem(key);
}

//存储json数据
function insertJsonStore(key, value) {
	insertStore(key, JSON.stringify(value));
}
// 根据key值查询json数据
function getJsonStore(key) {
	var val = getStore(key);
	return val ? JSON.parse(val) : null;
}

// 获取json数据中的key值并存入数组
function getDataKeys(obj){
	var keys = [];
	for(var p in obj){
		keys.push(p);
	}
	return keys;
}

// 绑定数据到页面元素(详细页面)
function stuffDetailDatas(data) {
	var keys = getDataKeys(data);
	for (var i = 0; i < keys.length; i++) {
		if ($("#" + keys[i])) {
			if (keys[i] == 'sex' || keys[i] == 'gender') {
				$("#" + keys[i]).html(data[keys[i]] == 1 ? "男" : "女");
			} else if (keys[i].indexOf('is') != -1) {
				$("#" + keys[i]).html(data[keys[i]] == 1 ? "是" : "否");
			} else if (keys[i].indexOf('price') != -1 || keys[i].indexOf('Price') != -1) {
				$("#" + keys[i]).html((data[keys[i]] == null || data[keys[i]] == "") ? "0" : data[keys[i]] );
			} else if (keys[i].indexOf('date') != -1 || keys[i].indexOf('Date') != -1) {
				$("#" + keys[i]).html((data[keys[i]] == null || data[keys[i]] == "") ? "------" : data[keys[i]].substring(0, 10));
			} else {
				$("#" + keys[i]).html((data[keys[i]] == null || data[keys[i]] == "") ? "------" : data[keys[i]]);
			}
		}
	}
}

function stuffFormDatas(data) {
	var keys = getDataKeys(data);
	for (var i = 0; i < keys.length; i++) {
		if ($("#" + keys[i])) {
			$("#" + keys[i]).val((data[keys[i]] == null || data[keys[i]] == "" || data[keys[i]] == "------") ? "" : data[keys[i]]);
		}
	}
}

/**
 * 以data的key为id，向元素中填写值，如果是checkbox/radio，则值相等时选中
 * @param data
 */
function fillFormWithKey(data) {
	if (!data)
		return;
	for (var k in data) {
		if (data.hasOwnProperty(k)) {
			var v = data[k];
			var inp = $("#" + k);
			//console.info("// " + k + " - " + inp.length + " : [" + v + "]");
			if (inp.length) {
				if (v === null)
					v = "";
				var t = inp.attr("type");
				if (t == "checkbox" || t == "radio") {
					if (v == inp.val())
						inp.attr("checked", "checked");
				} else {
					inp.val(v);
				}
			}
		}
	}
}

function getDataFromServer(urlstring, params, callback, error) {
	var network = checkConnection();
	console.log("网络环境：" + network);
	if (network > 0) {
		$.ajax({
			url: SERVERURL + urlstring,
			type: "POST",
			data: params,
			timeout: 40000,
			beforeSend: function(xhr) {
				if (!!getStore("USERID")) {
					xhr.setRequestHeader('userid', getStore("USERID"));
				}
				xhr.setRequestHeader('phone', 1);
			},
			success: callback,
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				alertMsg("网络连接故障，请重试");
				if (error)
					error(XMLHttpRequest, textStatus, errorThrown);
	        },
			complete: function(XMLHttpRequest, textStatus) {
				console.log("status : " + XMLHttpRequest.status + ", args = " + arguments.length);
				console.log("statusText : " + XMLHttpRequest.statusText);
	            console.log("ready : " + XMLHttpRequest.readyState);
	            console.log("html : " + XMLHttpRequest.responseText);
	            console.log("text : " + textStatus);
	            hidePageLoading();
			}
		});
	} else {
		alertMsg("网络异常，请先连接网络再重试");
		hidePageLoading();
	}
}


var __blocked_posting = 0;
/**
 * 提交数据，提交完成之前阻塞下一个请求
 * @param url 地址
 * @param data 参数对象
 * @param success 保存成功
 * @param failed 保存失败（action返回错误信息）
 * @param error 保存失败（action抛出异常或其他错误）
 * @returns
 */
function blockedPostData(url, data, success, failed, error, allowConcurrent) {
	
	var network = checkConnection();
	if (network < 0) {
		hidePageLoading();
		return alertMsg("网络异常，请先连接网络再重试");
	}
	
	
	if (__blocked_posting && !allowConcurrent)
		return alertMsg("正在提交数据，请稍候...");
	
	__blocked_posting = 1;
	var dt = {};
	$.extend(dt,data);
	if (!dt["struts.enableJSONValidation"])
		dt["struts.enableJSONValidation"] = true;
	
	$.ajax({
		url: SERVERURL + url,
		type: "POST",
		data: dt,
		//timeout: 30000,
		beforeSend: function(xhr) {
			if (!!getStore("USERID"))
				xhr.setRequestHeader('userid', getStore("USERID"));
			xhr.setRequestHeader('phone', 1);
		},
		success: function(jsonText) {
			console.log(jsonText);
			__blocked_posting = 0;
			var data = {};
			try{
				data = $.parseJSON(jsonText);
			} catch(e) {
				//转型失败
				console.log("err parsing json -> " + jsonText);
				if (!failed)
					alertMsg("服务器返回无效消息:" + jsonText);
				else
					failed(null, ["服务器返回无效消息"]);
				return hidePageLoading();
			}
			if (data.notLogin) {
				hidePageLoading();
				return alertMsg("请登录");
			}
			
			// 如果有异常信息（fieldErrors/errorMessages/errors)，则显示异常，如果提供failed回调，则调用failed，然后结束
			var fieldErrors = [], df = data.fieldErrors, de = data.errors;
			if (df) {
				for (var i in df)
					if (df.hasOwnProperty(i))
						fieldErrors = fieldErrors.concat(df[i]);
			}
			if (de) {
				for (var i in de)
					if (de.hasOwnProperty(i))
						fieldErrors = fieldErrors.concat(de[i]);
			}
			var errorMsg = fieldErrors.concat(data.errorMessages || []);
			var filteredErrMsg = [];
			for (var i = 0; i < errorMsg.length; ++i) {
				var e = errorMsg[i];
				if (e)
					filteredErrMsg.push(e);
			}
			if (filteredErrMsg.length) {
				dismissSavePop();
				if (!failed) {
					toast(filteredErrMsg.join('\n'), 10000);
				} else {
					failed(data, filteredErrMsg);
					return hidePageLoading();
				}
			} else {
				// 如果服务器返回actionMessages而且没有提供success回调，则显示服务器消息
				if (data.actionMessages && data.actionMessages.length && !success)
					toast(data.actionMessages.join('\n'), 3000);
				else if (success)
					success(data);
			}
			hidePageLoading();
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			__blocked_posting = 0;
			console.log("error -> " + textStatus + "/" + errorThrown + "/" + XMLHttpRequest.responseText + "/" + XHMLHttpRequest.responseXML);
			console.log(errorThrown);
			for (var i in errorThrown)
				console.log(">> " + i + "/" + errorThrown[i]);
			if (error)
				error(XMLHttpRequest.responseText, textStatus);
			else
				alertMsg(XMLHttpRequest.responseText);
			hidePageLoading();
        }
	});
}

function initTabs(contentId, tabId, num) {
	$("#" + tabId).siblings().addClass("ui-hidden").end().removeClass("ui-hidden");
	var tabs = $("#navbar").children().removeClass("ui-btn-active");
	$(tabs[num]).addClass("ui-btn-active");
	$(contentId).resize();
    $('#content').stop(1).animate({scrollTop:'0'},300);
}

function openSelectList(sel) {
	var selectId = "#" + sel + "-list";
	var shadowId = "#" + sel + "-shadow";
	centerPop($(selectId));
	
	$(selectId).removeClass('ui-hidden');
	$(shadowId).removeClass('ui-hidden');
	
	applyScroll(selectId, true);
	
	document.removeEventListener("backbutton", back, false);
	document.addEventListener("backbutton", dismiss, false);
}

function dismiss() {
	$(".ui-select-container, .ui-popup-shadow").each(function() {
		if (!$(this).hasClass("ui-hidden")) {
			$(this).addClass("ui-hidden");
		}
	});
	
	document.removeEventListener("backbutton", dismiss, false);
	document.addEventListener("backbutton", back, false);
}

function optionSelected(sel, optionId, value, callback) {
	var selectId = "#" + sel + "-list";
	
	var inputId = "#" + sel;
	if (sel != 'industryType' && sel != 'bussiness' && sel != 'sex') {
		inputId += "Id";
	}
	
	var inputName = "#" + sel;
	if (sel == 'industryType' || sel == 'buyerType') {
		inputName += 'Desc';
	} else {
		inputName += 'Name';
	}
	
	var inputWrapper = "#" + sel + "-validate";
	
	var lis = $(selectId).find(".ui-select-option");
	var idx = 0;
	lis.each(function() {
		var t = $(this);
		if (idx == optionId) {
			t.addClass("ui-select-option-active");
			$("#" + sel + "-list-selected").html(t.html());
			if (sel != 'sex')
				$(inputName).val(t.html());
			$(inputId).val(value);
			if (!!$(inputWrapper) && $(inputWrapper).hasClass("ui-check-error")) {
				$(inputWrapper).removeClass("ui-check-error");
			}
		} else {
			t.removeClass("ui-select-option-active");
		}
		++idx;
	});
	if (callback) {
		callback();
	}
	dismiss();
}

function traggleCollapsible(obj) {
	if ($(obj).attr("cst") == 1) {
		$(obj).attr("cst", 0);
		$(obj).find(".ui-icon-carat-r").removeClass("ui-icon-carat-r").addClass("ui-icon-carat-d");
		$(obj).next().removeClass("ui-hidden");
	} else {
		$(obj).attr("cst", 1);
		$(obj).find(".ui-icon-carat-d").removeClass("ui-icon-carat-d").addClass("ui-icon-carat-r");
		$(obj).next().addClass("ui-hidden");
	}
}

function showPhoto(obj) {
	var header = $(obj).find("p").html();
	$("#photo-show-header").empty().append("<h1>" + header + "</h1>");
	
	var dw = $(window).width(), dh = $(window).height();
	var pw = Math.floor(dw * 0.9), ph = Math.floor(pw * 3 / 4);
	var leftOffset = (dw - pw) / 2;
	var topOffset = (dh - ph) / 2;
	
	$("<img />").attr("src", $(obj).find("img").attr("src")).width(pw - 30).height(ph - 30).appendTo($("#photo-show-content").empty());
	$("#photoPop").css("left", leftOffset + "px").css("top", topOffset + "px").width(pw).height(ph).removeClass('ui-hidden');
	$("#photoShadow").removeClass('ui-hidden');
	
	document.removeEventListener('backbutton', back, false);
	document.addEventListener('backbutton', dismissPhotoPop, false);
}

function dismissPhotoPop() {
	$("#photoShadow, #photoPop").addClass('ui-hidden');
	document.removeEventListener('backbutton', dismissPhotoPop, false);
	document.addEventListener('backbutton', back, false);
}

function showPageLoading() {
	$("#loadingPop").removeClass("ui-hidden");
	var leftOffset = ($(window).width() - $("#loadingTable").outerWidth()) / 2;
	var topOffset = ($(window).height() - $("#loadingTable").outerHeight()) / 2;
	$("#loadingTable").css({ left: leftOffset + "px", top: topOffset + "px" });
}

function hidePageLoading() {
	$("#loadingPop").addClass("ui-hidden");
}

function showSavePop() {
	if (checkConnection() > 0) {
		$("#submit").show();
	} else {
		$("#submit").hide();
	}
	
	var topOffset = $(window).height() - $("#saveDataPop").outerHeight();
	$("#saveDataPop").css({ left : "0px", top : topOffset + "px" });
	$("#saveDataPop, #saveDataShadow").removeClass("ui-hidden");
	
	$("#buyerTypeId").attr("disabled", "disabled");
	
	document.removeEventListener("backbutton", back, false);
	document.addEventListener("backbutton", dismissSavePop, false);
}

function dismissSavePop() {
	$("#saveDataShadow, #saveDataPop").addClass("ui-hidden");
	
	$("#buyerTypeId").removeAttr("disabled");
	
	document.removeEventListener("backbutton", dismissSavePop, false);
	document.addEventListener("backbutton", back, false);
}

function getCurrDate() {
	return getCurrTime(true);
}

function getCurrTime(dateOnly) {
	return getTimeString(new Date(), dateOnly);
}

function getTimeString(date, dateOnly) {
	if (!date)
		date = new Date();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	if (dateOnly)
		return date.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
	else
		return date.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day) + ' ' + ( date.getHours() < 10 ? '0' + date.getHours() : date.getHours() ) + ':' + ( date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() )  + ':' + ( date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds() );
}

function getTime(mill) {
	var date = new Date();
	date.setTime(mill);
	var month = date.getMonth() + 1;
	var day = date.getDate();
	return date.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day) + ' ' + ( date.getHours() < 10 ? '0' + date.getHours() : date.getHours() ) + ':' + ( date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes() )  + ':' + ( date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds() );
}

// yyyyMMddHHmmss
function getTimestamp() {
	var d = new Date();
	var s = "" + d.getFullYear() + ("" + (101 + d.getMonth())).substring(1) + ("" + (100 + d.getDate())).substring(1) + 
				("" + (100 + d.getHours())).substring(1) + ("" + (100 + d.getMinutes())).substring(1) + ("" + (100 + d.getSeconds())).substring(1);
	return s;
}

// 切换下拉列表为输入框
function changeInput(id) {
	$("#" + id + "-select").hide();
	$("#" + id + "-input").show();
	$("#" + id + "-link").show();
	$("#" + id + 'Id').val(0);
	$("#" + id + "Name").val("");
}

// 切换输入框为下拉列表
function changeSelect(id) {
	$("#" + id + "-select").show();
	$("#" + id + "-input").hide();
	$("#" + id + "-link").hide();
	$("#" + id + 'Id').val(0);
	$("#" + id + "Name").val("");
	$("#" + id + '-list-selected').html("---请选择---");
}

//为保存草稿组织表单数据
function orgData4draft(selector,prefix){
	var obj = $(selector).serializeObject();
	var o = {};
	for(var p in obj){
		if(!p)return;
		if(p == 'struts.enableJSONValidation')continue;
		var np = p.substring(prefix.length);
		o[np] = obj[p];
	}
	return o;
}

//处理checkbox点击事件
function checkboxHandler() {
	var arr = $(':checkbox');
	if(!arr || arr.length <= 0) return;
	$(arr).each(function() {
		var ischeck = $(this).is(":checked");
		$(this).val(!ischeck ? false : true);
	});
}

function checkboxHandler2() {
	var arr = $(':checkbox');
	if(!arr || arr.length <= 0) return;
	$(arr).each(function() {
		var ischeck = $(this).is(":checked");
		$(this).val(!ischeck ? 0 : 1);
	});
}
/**
 * 转换为BeanStyle 属性名称
 * @param rows
 * @returns {Array}
 */
function convertToBeanList(rows) {
	var list = [];
	for (var i = 0; i < rows.length; i++) {
		var data = new Object();
		var row = rows[i];
		for (var o in row) {
			if (o.indexOf('_') != -1) {
				var arr = o.split('_');
				var key = arr[0];
				for (var j = 1; j < arr.length; j++) {
					key += arr[j].replace(arr[j].charAt(0), arr[j].charAt(0).toUpperCase());
				}
				data[key] = row[o];
			} else {
				data[o] = row[o];
			}
		}
		list.push(data);
	}
	return list;
}

/**
 * 调用系统ALERT，去掉英文提示
 * @param msg
 * @param callback
 */
function alertMsg(msg, callback) {
	navigator.notification.alert(msg, callback, '提示', '确定');
}

/**
 * 水平垂直居中弹出层
 * @param pop
 */
function centerPop(pop) {
	pop = $(pop);
	pop.css({ 
		left : Math.floor(($(window).width() - pop.outerWidth()) / 2) + "px", 
		top : Math.floor(($(window).height() - pop.outerHeight()) / 2) + "px" 
	});
}


/**
 * 检测系统版本以确定是否需要启用iScroll
 * @returns {Boolean}
 */
function isNeedIScroll() {
	if (!window.device)	// workaround for ios
		return console.log("!! no window.device");
	console.log("platform = " + device.platform + ", version = " + device.version);
	var ver = parseFloat(/^(\d+\.\d+).*$/.exec(device.version)[1]) || 0;
	return (device.platform == "Android" && ver < 3) || (device.platform == "iOS" && ver < 5);
}


var _scrollId = 0;
/**
 * 应用iscroll滚动
 * @param selector
 */
function applyScroll(selector, isUseTransform, scrollToTop) {
	if (!isNeedIScroll())
		return;
	
	var t = $(selector);
	if (t.length > 1) {
		t.each(function() {
			applyScroll(this, isUseTransform, scrollToTop);
		});
	} else {
		var iscroll = t.data("iscroll");
		if (!iscroll) {
			if (window.IScroll) {
				if (!t.attr("id"))
					t.attr("id", "sw__" + (++_scrollId));
				iscroll = new IScroll("#" + t.attr("id"));
				iscroll.options.useTransform = isUseTransform;
				t.data("iscroll", iscroll);
				console.log("// reg scroll -> " + t.attr("id"));
			} else {
				console.log("IScroll not defined, cannot apply scroll on '" + t.attr("id") + "/" + t.attr("class") + "'");
			}
		} else {
			console.log("// scroll already exists -> " + t.attr("id"));
			if (scrollToTop)
				refreshScroll(iscroll, isUseTransform, scrollToTop);
		}
	}
}

/**
 * 重新计算滚动高度尺寸
 * @param target 选择器或iscroll对象
 * @returns
 */
function refreshScroll(target, isUseTransform, scrollToTop) {
	if (!target)
		return;
	
	if (typeof target == "string" || target.jquery)
		return $(target).each(function() {
			refreshScroll($(this).data("iscroll"), isUseTransform, scrollToTop);
		});
	
	if (target)
		setTimeout(function() {
			target.options.useTransform = isUseTransform;
			target.refresh();
			if (scrollToTop)
				target.scrollTo(0, 0);
		}, 0);
}

function scrollTo(target, scrollY) {
	if (!target)
		return;
	
	target = $(target);
	if (target.length > 1)
		return $(target).each(function() {
			scrollTo(this, scrollY);
		});
	if (target.data("iscroll"))
		target.data("iscroll").scrollTo(0, scrollY);
}


/**
 * yyyy-MM-dd [HH:MM[:ss[.fff]]]，支持中文格式
 */
Date.__DateRegex = /^\s*(\d{2,4})[^\d]{1,2}(\d{1,2})[^\d]{1,2}(\d{1,2})([^\d]{1,2})?(\s+(\d{1,2}):(\d{1,2})(:(\d{1,2})(\.(\d{1,3}))?)?)?\s*$/;
/**
 * 将字符串转换为日期，支持MM/dd/yyyy和yyyy-MM-dd
 * @param {Object} d
 */
function parseDate(d)
{
  var v = Date.parse(d);
  if (!isNaN(v))
    return new Date(v);
  
  var ms = Date.__DateRegex.exec(d);
  if (ms)
  {
    var d = new Date(
              ms[1] ? parseInt(ms[1], 10) : 0, 
              ms[2] ? (parseInt(ms[2], 10) - 1) : 0, 
              ms[3] ? parseInt(ms[3], 10) : 0,
              ms[6] ? parseInt(ms[6], 10) : 0,
              ms[7] ? parseInt(ms[7], 10) : 0,
              ms[9] ? parseInt(ms[9], 10) : 0,
              ms[11] ? parseInt(ms[11], 10) : 0
            );
    return isNaN(d) ? null : d;
  }
  return null;
}


/**
 * 获取月份差
 * @param dstart 开始日期，字符串或日期
 * @param dend 结束日期，字符串或日期
 * @param nonNegative 是否只返回非负值
 * @returns {Number}
 */
function getMonthDiff(dstart, dend, nonNegative) {
	if (dstart && dend) {
		dstart = parseDate(dstart);
		dend = parseDate(dend);
		if (dstart && dend) {
			var dd = Math.floor((dend.valueOf() - dstart.valueOf()) / 1000 / 60 / 60 / 24);
			var md = Math.floor(dd * 360 / 365 / 30);
			if (nonNegative && md < 0)
				md = 0;
			return md;
		} else {
			return 0;
		}
	} else {
		return 0;
	}
}

var Part = [
      [ 16000901, "part_model_tag.jpg" ],      
      [ 16000902, "part_front_left.jpg" ],      
      [ 16000903, "part_front_right.jpg" ],      
      [ 16000904, "part_back_left.jpg" ], 
      [ 16000905, "part_bucket_front_side.jpg" ],      
      [ 16000906, "part_bucket_back_side.jpg" ],      
      [ 16000907, "part_right_guide_wheel.jpg" ],      
      [ 16000908, "part_right_link_shell.jpg" ],      
      [ 16000909, "part_right_drive_wheel.jpg" ],      
      [ 16000910, "part_left_guide_wheel.jpg" ],      
      [ 16000911, "part_left_link_shell.jpg" ],      
      [ 16000912, "part_left_drive_wheel.jpg" ],      
      [ 16000913, "part_hour_meter.jpg" ],      
      [ 16000914, "part_cab.jpg" ],      
      [ 16000915, "part_engine.jpg" ],      
      [ 16000916, "part_hydraulic_pump.jpg" ]
];

function getPartImg(partId) {
	for (var i = 0; i < Part.length; i++) {
		if (Part[i][0] == partId) {
			return Part[i][1];
		}
	}
	return '';
}


function simplifyHtml(str, clen) {
	var s = str.substr(str.indexOf("<body"));
	s = s.substr(0, s.lastIndexOf("</body>"));
	s = s.replace(/\u003c.*?\u003e/g, "").replace(/[\n\r][\u3000\u0020]+?[\n\r]/g, "\n").replace(/[\n\r]{2,}/g, "\n");
	if (clen)
		s = s.substr(0, Math.min(clen, s.length));
	return s;
}


// 文件上传错误消息
var fileTransferErrorMessage = {
	"1" : "文件未找到",		//	FileTransferError.FILE_NOT_FOUND_ERR = 1;
	"2" : "无效地址",		//	FileTransferError.INVALID_URL_ERR = 2;
	"3" : "网络连接错误", 	//	FileTransferError.CONNECTION_ERR = 3;
	"4" : "用户已取消"		//	FileTransferError.ABORT_ERR = 4;	
};


// 检查设备
var __isAndroid = true, __isIos = false;
document.addEventListener('deviceready', function() {
	if (!window.device)	// workaround for ios
		return console.log("!!! no window.device");
	console.log("platform = " + device.platform + ", version = " + device.version);
	__isAndroid = device.platform == "Android";
	__isIos = device.platform == "iOS";
}, false);


/**
 * 简易消息提示
 * @param msg
 * @param duration
 */
//function toast(msg, duration) {
//	if (__isAndroid)
//		navigator.notification.toast(msg, duration);
//}

//自动消失信息提示框接口 String msg
var toastime;
function toast(msg) {
	var toastMsg = "<div></div>";
	$toastDiv = $(toastMsg);
	$toastDiv.html(msg);
	$toastDiv.addClass("toast");
	$toastDiv.appendTo("body");
	var screenWidth = ($(window).width() - $toastDiv.width()) / 2 - 15 + "px";	
	var screenHeight = ($(window).height() - $toastDiv.height()) / 2 + "px";
	$toastDiv.css("top", screenHeight);
	$toastDiv.css("left", screenWidth);
	toastime = setInterval("toastFade()", 4000);
}

function toastFade() {
	$(".toast").fadeOut("slow", function(){
		clearInterval(toastime);
		$(".toast").remove();		
	});
}