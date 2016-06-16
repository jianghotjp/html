document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
	document.addEventListener('backbutton', back, false);
}

/* 本地评估模板id-name映射 */
var evalTemplateMap = {};
/* 工况代码id-code映射 */
var workConditionCodeMap = {};
/* 评估等级id-code映射 */
var evalLevelCodeMap = {};

/***********  LIST START  ***********/
var listInit = 1, draftInit = 1, searchInit = 1, keyword;
function getReportList() {
	showPageLoading();
	$("#loadmore").html("正在加载...");
	var param = { "page" : page, "rows" : rows, "sort" : "report_id", "order" : "desc" };
	getDataFromServer("used/eval/evalReptListJson.action", param, function(data) {
		buildPageData(data, false);
	});
}

function getReportListDraft() {
	showPageLoading();
	ap.dbFindAll("Phone_Du_Eval_Report", buildDraftData, '*', "createUserId=" + getStore("USERID"));
}

function initListTab(tabId, num) {
	if (listInit == 1) {
		getReportList();
		listInit = 0;
	}
	initTabs("#content", tabId, num);
}

function initDraftTab(tabId, num) {
	if (draftInit == 1) {
		getReportListDraft();
		draftInit = 0;
	}
	initTabs("#content", tabId, num);
}

function pullUpAction() {
	page += 1;
	$("#loadmore").html("正在加载...");
	if (!!$("#keyword").val()) {
		setTimeout(search, 50);
	} else {
		setTimeout(getReportList, 50);
	}
}

//关键字查询
function search() {
	showPageLoading();
	var param = { "page" : page, "rows" : rows, "sort" : "report_id", "order" : "desc" };
	if (!!$("#keyword").val()) {
		if (keyword != $("#keyword").val()) {// 判断关键字是否有变化
			keyword = $("#keyword").val();
			searchInit = 1;
		}
		if (searchInit == 1) {
			page = 1;
		} else {
			page++;
		}
		param["page"] = page;
		$.extend(param, { "keyword" : keyword });
		getDataFromServer("used/eval/evalReptListJson.action", param, function(data) {
			buildPageData(data, searchInit == 1);
			searchInit = 0;
		});
	} else {// 重置
		page = 1;
		searchInit = 1;
		param["page"] = page;
		getDataFromServer("used/eval/evalReptListJson.action", param, function(data) {
			buildPageData(data, true);
		});
	}
}

function buildPageData(data, isClear) {
	data = eval("(" + data + ")");
	var html = '';
	var len = data.rows.length;
	if (len == 0 && listInit == 1) {
		html += '<li class="ui-li">';
		html += '<div class="ui-li-wrapper-a ui-txt-inner">';
		html += '<span class="ui-li-txt">没有查询到相应数据</span></div></li>';
		$("#loadmore").html("共查询到0条数据");
		$("#report_list").empty().append(html);
	} else {
		for (var i = 0; i < len; i++) {
			var report = data.rows[i];
			html += '<li class="ui-li" onclick="jumpToDetailPage(' + report.report_id + ', 1);">';
			html += '<div class="ui-li-wrapper-b">';
			html += '<span class="ui-li-txt ui-txt-inner">' + report.report_no + '</span><br />';
			html += '<span class="ui-li-txt-desc ui-txt-inner">' + report.brand_name + ', ' + report.product_name + ', ' + report.model_name + (!!report.serial_no ? ', ' + report.serial_no : '');
			html += (!!report.create_user_name ? ', ' + report.create_user_name : '') + '</span></div></li>';
		}
		var loadmorestr = '共查询到';
		if (isClear) {
			loadmorestr += len + "条数据，点击加载更多...";
			$("#report_list").empty().append(html);
		} else {
			loadmorestr += (len + $("#report_list").children().length) + "条数据，点击加载更多...";
			$("#report_list").append(html);
		}
		$("#loadmore").html(loadmorestr);
	}
	listInit = 0;
	initTabs("#content", "list", 0);
	refreshScroll(".scroll-wrapper", true, false);
	clearEvalCache();
	hidePageLoading();
}

function clearEvalCache() {
	removeStore("CURR_EVAL_TEMPLATE_ID");
	removeStore("CURR_EVAL_TEMPLATE_ITEM_ID");
    removeStore("CURR_EVAL_TEMPLATE_ITEM2_ID");
	removeStore("CURR_EVAL_TEMPLATE_ITEM_NAME");
	removeStore("CURR_EVAL_TEMPLATE_ITEM_RATE");
	removeStore("PAGE_DATA_STRING");
	
	var keys = [], j = 0;
	for (var i = 0; i < window.localStorage.length; i++) {
		var key = window.localStorage.key(i);
		if (key.indexOf('POINT_') != -1) {
			keys[j] = key;
			j++;
		}
	}
	for (var k = 0; k < keys.length; k++) {
		removeStore(keys[k]);
	}
}

function buildDraftData(data) {
	var html = '';
	var len = data.rows.length;
	if (len == 0) {
		html += '<li class="ui-li">';
		html += '<div class="ui-li-wrapper-a ui-txt-inner">';
		html += '<span class="ui-li-txt">没有查询到相应数据</span></div></li>';
	} else {
		for (var i = 0; i < len; i++) {
			var report = data.rows.item(i);
			html += '<li class="ui-li" onclick="jumpToDetailPage(' + report._id + ', 0);">';
			html += '<div class="ui-li-wrapper-b">';
			html += '<span class="ui-li-txt ui-txt-inner">' + report.brandName + ', ' + report.productName + '</span><br />';
			html += '<span class="ui-li-txt-desc ui-txt-inner">' + report.modelName;
			html += (!!report.serialNo ? '' : ', ' + report.serialNo) + (!!report.createUserName ? ', ' + report.createUserName : '') + '</span></div></li>';
		}
	}
	$("#draft_list").append(html);
	draftInit = 0;
	hidePageLoading();
	clearEvalCache();
}

function jumpToDetailPage(rid, type) {
	insertStore("CURR_IN_MODE", type);
	insertStore("CURR_REPORT_ID", rid);
	window.location.href = 'reportdetail.html';
}
/***********  LIST END  ***********/

/***********  DETAIL START  ***********/
function dbList2Array(list) {
	if (!list)
		return [];
	var arr = new Array(list.length);
	for (var i = 0, j = list.length; i < j; ++i)
		arr[i] = list.item(i);
	return arr;
}

function getReportDetail() {
	showPageLoading();
	getDataFromServer('used/eval/evalReptDetailJson.action', { keyId : getStore("CURR_REPORT_ID") }, function(json) {
		json = eval("(" + json + ")");
		$(["salePrice", "sysEvalPrice", "evalPrice", "evalPrice", "marketPrice", "evalAffPrice", "custExpPrice", "reMachinePrice", "compPrice", "compNewPrice"]).each(function() {
			var p = json.en[this];
			if (p != null) {
				json.en[this] = Math.floor((p || 0) / 1) / 1;
			}
		});
		
		stuffDetailDatas(json.en);
		
		// 单独拿出打分明细
		insertStore("CURR_REPT_EVAL_DETAIL", JSON.stringify(json.en.reptDetail));
		
		$("#workYear").html(json.en.WYear + "年" + json.en.workMonth + "月");
		$("#evalTemplateName").html(json.en.evalTemplateData.en.evalTemplateName);
		
		// 根据设备来源选择是否显示
		if (json.en.sourceTypeId == 1000201) {
			$("#adeal").show();
		} else if (json.en.sourceTypeId == 1000202) {
			$("#adeal").show();
			$("#reProduct, #reModel, #rePrice").hide();
			$("#cpBrand, #cpProduct, #cpModel, #cpEvalPrice, #cpNewPrice").hide();
		} else {
			$("#adeal").hide();
			$("#abase, #aused, #aident, #aphoto").removeClass("ui-navbar-item-d").addClass("ui-navbar-item-c");
		}
		
		buildPhotos(json.en);
		hidePageLoading();
	} );
}

function buildPhotos(en) {
	var ul = '<ul style="display:block;">';
	if (!!en.reptPhotoAttachments && en.reptPhotoAttachments.length > 0) {// 部位
		for (var p = 0; p < en.reptPhotoAttachments.length; p++) {
			var part = en.reptPhotoAttachments[p];
			ul += '<li class="ui-li-photo">';
			ul += '<a href="' + SERVERURL + "upload/" + part.pathName + part.fileName + '">';
			ul += '<img src="' + SERVERURL + "upload/" + part.pathName + part.fileName + '" class="small-pic" alt="' + getPartName(en, part) + '"></a>';
			ul += '<p class="pic-desc-name">' + getPartName(en, part) + '</p></li>';
		}
	}
	if (!!en.expPhotos && en.expPhotos.length > 0) {// 增加
		for (var a = 0; a < en.expPhotos.length; a++) {
			var attach = en.expPhotos[a];
			var remark = attach.remark;
			if (remark) {
				var p = remark.indexOf("\n");
				if (p != -1) {
					remark = remark.substring(0, p);
				}
				remark = remark.indexOf("_") != -1 ? remark.substring(0, remark.indexOf("_")) : remark;
			}
			ul += '<li class="ui-li-photo">';
			ul += '<a href="' + SERVERURL + "upload/" + attach.pathName + attach.fileName + '">';
			ul += '<img src="' + SERVERURL + "upload/" + attach.pathName + attach.fileName + '" class="small-pic" alt="' + (remark || "") + '"></a>';
			ul += '<p class="pic-desc-name">' + (remark || "") + '</p></li>';
		}
	}
	ul += "<div style='float:none;clear:both;height:0;'>&nbsp;</div>";
	ul += '</ul>';
	$("#photoinfo").empty().append(ul);
	refreshScroll("#content", true, true);
	Code.photoSwipe('a', '#photoinfo');
}

function getPartName(en, part) {
	var partName = '';
	for (var i = 0; i < en.reptPhotos.length; i++) {
		if (en.reptPhotos[i].attachmentDetailId == part.attachmentDetailId) {
			partName = en.reptPhotos[i].partCodeName;
			break;
		}
	}
	return partName;
}

function getReportDetailDraft() {
	showPageLoading();
	ap.dbFindAll("Phone_Du_Eval_Report", function(res1) {
		var temp = res1.rows.item(0);
		ap.dbFindAll("Phone_Du_Eval_Report_Detail", function(res2) {
			var details = dbList2Array(res2.rows);
			temp.details = details;
			
			temp.salePrice = (temp.salePrice || 0) / 10000; 
			temp.evalPrice = (temp.evalPrice || 0) / 10000;  
			temp.sysEvalPrice = (temp.sysEvalPrice || 0) / 10000; 
			temp.custExpPrice = (temp.custExpPrice || 0) / 10000; 
			temp.reMachinePrice = (temp.reMachinePrice || 0) / 10000; 
			temp.compPrice = (temp.compPrice || 0) / 10000;
			temp.compNewPrice = (temp.compNewPrice || 0) / 10000;
			
			stuffDetailDatas(temp);
			
			// 单独拿出打分明细
			insertStore("CURR_REPT_EVAL_DETAIL", JSON.stringify(temp.details));
			
			var WYear = Math.floor(temp.workYear / 12);
			var WMonth = Math.floor(temp.workYear % 12);
			$("#workYear").html(WYear + "年" + WMonth + "月");
			
			// 根据设备来源选择是否显示
			if (temp.sourceTypeId == 1000201) {
				$("#adeal").show();
			} else if (temp.sourceTypeId == 1000202) {
				$("#adeal").show();
				$("#reProduct, #reModel, #rePrice").hide();
				$("#cpBrand, #cpProduct, #cpModel, #cpEvalPrice, #cpNewPrice").hide();
			} else {
				$("#adeal").hide();
				$("#abase, #aused, #aident, #aphoto").removeClass("ui-navbar-item-d").addClass("ui-navbar-item-c");
			}
			
			buildPhotosDraft(temp.evalTemplateId);
			hidePageLoading();
		}, "_id, reportId, evalItemId, evalItemName, salvageRate as salvageValue", "reportId=" + getStore("CURR_REPORT_ID"));
	}, "*", "_id=" + getStore("CURR_REPORT_ID"));
}

function buildPhotosDraft(tid) {
	ap.dbFindAll("Phone_Eval_Template_Photo", function(result) {
		var html = '';
		for (var p = 0; p < result.rows.length; p++) {
			var part = result.rows.item(p);
			var tp = '<li class="ui-li-photo">';
			tp += '<a href="../../img/' + getPartImg(part.photoPartId) + '">';
			tp += '<img id="' + part.photoPartId + '" src="../../img/' + getPartImg(part.photoPartId) + '" class="small-pic" alt="' + part.photoPartName + '"></a>';
			tp += '<p class="pic-desc-name">' + part.photoPartName + '</p></li>';
			html += tp;
		}
		$("#photoinfo").empty().append('<ul style="display:block;">' + html + '</ul>');
		
		ap.dbFindAll("Phone_Du_Eval_Photo", function(data) {
			var other = '';
			for (var i = 0; i < data.rows.length; i++) {
				var item = data.rows.item(i);
				if (item.partId > 0) {
					$("#" + item.partId).attr("src", item.photoPath);
					$("#" + item.partId).parent('a').attr("href", item.photoPath);
				} else {
					var p = '<li class="ui-li-photo">';
					var remark = item.remark;
					if (remark) {
						var z = remark.indexOf("\n");
						if (z != -1) {
							remark = remark.substring(0, z);
						}
					}
					p += '<a href="' + item.photoPath + '">';
					p += '<img id="' + item.photoPartId + '" src="' + item.photoPath + '" class="small-pic" alt="' + remark + '"></a>';
					p += '<p class="pic-desc-name">' + remark + '</p></li>';
					other += p;
				}
			}
			if (other)
				$("#photoinfo ul").append(other);
			$("#photoinfo ul").append($("<div style='float:none;clear:both;height:0;'>&nbsp;</div>"));
			refreshScroll("#content", true, true);
			Code.photoSwipe('a', '#photoinfo');
		}, "*", "billId=" + getStore("CURR_REPORT_ID") + " and billType='REPT'");
		
	}, "*", "evalTemplateId=" + tid);
}

/***********  DETAIL END  ***********/

/***********  ADD START  ***********/
function capturePicture(obj, partId) {
	var name = $(obj).next("p").html();
    //var popover = new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_UP);
    navigator.camera.getPicture(function(data) {
    	//alert("Take picture complete");
    	$(obj).attr("src", data + "?" + new Date().valueOf()).removeData("attachment");  // 重新拍照后需要删除附件数据，表示需要上传
    }, function(e) {
    	console.log("wrong:" + e);
    }, { 
		quality : 50,
		destinationType : Camera.DestinationType.FILE_URI,
		targetWidth : 640,
		targetHeight : 480,
		saveToPhotoAlbum: true,
		//popoverOptions  : popover,
		sourceType : Camera.PictureSourceType.CAMERA,
		imageindex  :partId
	});
}

function addPicture(obj) {
	navigator.notification.prompt('请输入新添加的照片名称:', function(results) {
		if (results.buttonIndex == 1) {
			_addPicture(obj, results.input1);
		}
	}, '提示', [ '确定', '取消' ]);
}
function _addPicture(addPicImg, name, src) {
	if (name && name.indexOf("_") != -1) {
		name = name.substring(0, name.indexOf("_"));
	}
	var li = '<li class="ui-li-photo">';
	li += '<img src="../../img/ad_def_logo.png" oth="' + name + '" class="small-pic" onclick="capturePicture(this);">';
	li += '<p class="pic-desc-name" onclick="modifyPicName(this);">' + name + '</p></li>';
	li = $(li);
	if (src)
		li.find("IMG").attr("src", src);
	$(addPicImg).parent().before(li);
	refreshScroll("#content", false, true);
	return li.find("IMG");
}

function modifyPicName(obj) {
	var defaulttxt = $(obj).html();
	navigator.notification.prompt('请输入新添加的照片名称:', function(results) {
		if (results.buttonIndex == 1) {
			$(obj).html(results.input1);
		}
	}, '提示', [ '确定', '取消' ], defaulttxt);
}

var applyList;
window._apage = 1, window._astop = false;
function getAppList(_page) {
	if (!loginMode()) {
		alertMsg("您现在处于离线状态，无法选择申请单");
		return;
	}
	
	// 在到达最后一页时输入关键字，解锁判定
	if (window.appkeyword != $("#app_keyword").val()) {
		window._astop = false;
	}
	
	// 判定最后一页，不允许查询
	if (_page > 0 && window._astop) {
		toast("已经是最后一页", 3000);
		return;
	}
	
	// _page 可能小于0，表示向上翻页，但window._cpage
    //不能小于1
	window._apage = window._apage + _page;
	if (window._apage < 1) {
		window._apage = 1;
	}
	
	// 如果输入关键字并且关键字与以前不一致，包括第一次输入关键字，将页面设置为1
	if (window.appkeyword != $("#app_keyword").val()) {
		window.appkeyword = $("#app_keyword").val();
		window._apage = 1;
	}
	
	showPageLoading();
	var params = { "page" : window._apage, "rows" : rows, "sort" : "app_id", "order" : "desc", "filter.audit_status" : 1 };
	if (!!$("#app_keyword").val())
		$.extend(params, { "keyword" : $("#app_keyword").val() });
	getDataFromServer("used/eval/popEvalAppListJson.action", params, function(data) {
		data = eval("(" + data + ")");
		applyList = convertToBeanList(data.rows);
		
		// 到达最后一页时标记(不能=，如果=就只能显示一页)
		applyList.length < rows ? window._astop = true : window._astop = false;
		
		console.log("====================");
		console.log("当前页：" + window._apage + ", 最后一页: " + window._astop + ", 参数: " + params.page);
		console.log("====================");
		
		var html = '', idx = 0;
		$(applyList).each(function() {
			html += '<li class="ui-pop-li-compact" onclick="onAppItemClick(' + idx + ');">';
			html += this.appNo + "<br/>";
			html += this.brandName + ', ' + this.productName + ', ' + this.modelName + ', ' + this.stockInType;
			html += '</li>';
			idx++;
		});
		$("#app_list").empty().append(html);
		$("#appListPop").find("p").html("选择评估申请单");
		centerPop($("#appListPop")); 
		$("#appListPop, #appListShadow").removeClass("ui-hidden");
		applyScroll($("#app_list").parent(), false, true);
		document.removeEventListener('backbutton', back, false);
		document.addEventListener('backbutton', closePop, false);
		hidePageLoading();
	});
}

function closePop() {
	$(".ui-popup-shadow, .ui-popup").addClass("ui-hidden");
	document.removeEventListener('backbutton', closePop, false);
	document.addEventListener('backbutton', back, false);
}

function _loadBpm() {
	setElementData("#brand-list-selected", $("#brandName").val());
	if ($("#brandName").val()) {
		$("#product-list-selected").parent().removeClass("ui-input-disabled").attr("onclick", "openSelectList('product')");
		loadProduct();
	}
	setElementData("#product-list-selected", $("#productName").val());
	if ($("#productName").val()) {
		$("#model-list-selected").parent().removeClass("ui-input-disabled").attr("onclick", "openSelectList('model')");
		loadModel();
	}
	setElementData("#model-list-selected", $("#modelName").val());
}

function _loadReBpm() {
	setElementData("#reProduct-list-selected", $("#reProductName").val());
	if ($("#reProductName").val()) {
		$("#reModel-list-selected").parent().removeClass("ui-input-disabled").attr("onclick", "openSelectList('reModel')");
		loadReModel();
	}
	setElementData("#reModel-list-selected", $("#reModelName").val());
}

function _loadCompBpm() {
	setElementData("#compBrand-list-selected", $("#compBrandName").val());
	if ($("#compBrandName").val()) {
		$("#compProduct-list-selected").parent().removeClass("ui-input-disabled").attr("onclick", "openSelectList('compProduct')");
		loadCompProduct();
	}
	setElementData("#compProduct-list-selected", $("#compProductName").val());
	if ($("#compProductName").val()) {
		$("#compModel-list-selected").parent().removeClass("ui-input-disabled").attr("onclick", "openSelectList('compModel')");
		loadCompModel();
	}
}

function onAppItemClick(index) {
	closePop();
	$("#custName").attr("onclick", "void(0)");
	$("#serialNo").attr("onclick", "void(0)");

	var app = applyList[index];
	console.log(JSON.stringify(app));
	
	// 选择申请单时根据设备来源显示交易选项卡
	chengeSourceType(app.sourceTypeId);

	// 价格单位(万)
//	app.wSalePrice = Math.round(app.salePrice / 100) / 100;
//	app.wCustExpPrice = Math.round(app.custExpPrice / 100) / 100;
//	app.wReMachinePrice = Math.round(app.reMachinePrice / 100) / 100;
	
	// 出厂日期去掉时间
	if (app.leaveDate)
		app.leaveDate = getTimeString(parseDate(app.leaveDate), true);
	if (app.expTradeDate)
		app.expTradeDate = getTimeString(parseDate(app.expTradeDate), true);
	// 转换以适应mobile db
	app.isCertNo = app.hasCert;
	app.isContractNo = app.hasContract;
	app.isInvoiceNo = app.hasInvoice;
    app.isOrigpain = app.isOrigpain;
    app.isStandpart = app.isStandpart;
	app.sourceTypeName = app.stockInType;
	app.areaName = app.fullAreaName;
	fillFormWithKey(app);
	
	$("#areaName").val(app.fullAreaName);//显示区域全称
	
	// 需要特殊处理的部分
	// 由申请来的设备使用申请的工作年限，第一次加载时不根据当前日期重新计算
	app.workYear = app.workYear || 0;
	$("#iwYear").val(Math.floor(app.workYear / 12));
	$("#iwMonth").val(app.workYear % 12);
	$("#evalTemplateName").val(evalTemplateMap[app.evalTemplateId] || "");
	
	$("#moreMonth").val(workConditionCodeMap[app.machConditionId] ? workConditionCodeMap[app.machConditionId].codeValue : 0) || 0;

	$("#isEval").val("1");

	_loadBpm();
	_loadReBpm();
	_loadCompBpm();
	setElementData("#compModel-list-selected", $("#compModelName").val());
	setElementData("#sourceType-list-selected", $("#sourceTypeName").val());
	setElementData("#evalTemplate-list-selected", $("#evalTemplateName").val());
	setElementData("#machCondition-list-selected", $("#machConditionName").val());
	
	onTemplateChange(function(template) {
		applyTemplate(function(photoContainer) {
			// 读取照片
			getDataFromServer("used/eval/evalAppDetailJson.action", { keyId : app.appId }, function(data) {
				console.info(">> " + data);
				var a2 = null;
				try {
					a2 = eval("(" + data + ")");
				} catch (ex) {
					console.log(a2);
					return alertMsg("读取评估申请信息失败");
				}
				if (a2.en.appPhotos && a2.en.appPhotos.length && a2.en.appPhotoAttachments) {
					for (var i = 0, ps = a2.en.appPhotos, ts = a2.en.appPhotoAttachments; i < ps.length; ++i) {
						var partCode = ps[i], attach = ts[i];
						var imageUrl = SERVERURL + "upload/" + attach.pathName + attach.fileName;
						trace(imageUrl);
						photoContainer.find("IMG[partId=" + partCode.partCodeId + "]")
							.attr("src", imageUrl)
							.attr("onclick", "capturePicture(this, '" + partCode.partCodeId + "');")
							.data("attachment", attach);
						photoContainer.find("IMG[partId=" + partCode.partCodeId + "]")
							.parent()
							.find("P.pic-desc-name").html(partCode.partCodeName);
					}
				}
				if (a2.en.attachmentDetails && a2.en.attachmentDetails.length) {
					var addPic = photoContainer.find("IMG[addPic=1]");
					$(a2.en.attachmentDetails).each(function() {
						_addPicture(addPic, this.remark, SERVERURL + "upload/" + this.pathName + this.fileName)
							.data("attachment", this);
					});
				}
				refreshScroll("#content", false, true);
			});
		});
	});
}

var custList;
window._cpage = 1, window._cstop = false;
function getCustList(_page) {
	if (!loginMode()) {
		alertMsg("您现在处于离线状态，无法选择客户");
		return;
	}
	
	var appId = parseInt($("#appId").val(), 10);
	if (appId)
		return toast("选择评估申请后不能再选择客户", 3000);
	
	// 在到达最后一页时输入关键字，解锁判定
	if (window.custkeyword != $("#cust_keyword").val()) {
		window._cstop = false;
	}
	
	// 判定最后一页，不允许查询
	if (_page > 0 && window._cstop) {
		toast("已经是最后一页", 3000);
		return;
	}
	
	// _page 可能小于0，表示向上翻页，但window._cpage不能小于1
	window._cpage = window._cpage + _page;
	if (window._cpage < 1) {
		window._cpage = 1;
	}
	
	// 如果输入关键字并且关键字与以前不一致，包括第一次输入关键字，将页面设置为1
	if (window.custkeyword != $("#cust_keyword").val()) {
		window.custkeyword = $("#cust_keyword").val();
		window._cpage = 1;
	}
	
	showPageLoading();
	var params = { "page" : window._cpage, "rows" : rows, "sort" : "cust_id", "order" : "desc" };
	if (!!$("#cust_keyword").val())
		$.extend(params, { "keyword" : $("#cust_keyword").val() });
	getDataFromServer('customer/customerListJson.action', params, function(data) {
		data = eval("(" + data + ")");
		var html = '', idx = 0;
		custList = convertToBeanList(data.rows);
		
		// 到达最后一页时标记(不能=，如果=就只能显示一页)
		custList.length < rows ? window._cstop = true : window._cstop = false;
		
		console.log("====================");
		console.log("当前页：" + window._cpage + ", 最后一页: " + window._cstop + ", 参数: " + params.page);
		console.log("====================");
		
		$(custList).each(function() {
			html += '<li class="ui-pop-li" onclick="onCustItemClick(' + idx + ');">';
			html += this.custName + ', ' + this.areaName + ', ' + this.handPhone;
			html += '</li>';
			idx++;
		});
		$("#cust_list").empty().append(html);
		$("#custListPop").find("p").html("选择客户");
		centerPop($("#custListPop"));
		applyScroll($('#cust_list').parent(), false, true);
		$("#custListPop, #custListShadow").removeClass("ui-hidden");
		document.removeEventListener('backbutton', back, false);
		document.addEventListener('backbutton', closePop, false);
		hidePageLoading();
	});
}
function onCustItemClick(index) {
    closePop();
    var cust = custList[index];
    if (cust.handPhone)
        cust.handPhone = $.trim(cust.handPhone);
    fillPage(cust);
    $("#areaName").val(cust.fullAreaName);//显示区域全称
}
var userList;
window._cpage = 1, window._cstop = false;
function getEvalUserList(_page) {
    if (!loginMode()) {
        alertMsg("您现在处于离线状态，无法选择用户");
        return;
    }
    
//    var appId = parseInt($("#appId").val(), 10);
//    if (appId)
//        return toast("选择评估申请后不能再选择客户", 3000);
    
    // 在到达最后一页时输入关键字，解锁判定
    if (window.evalkeyword != $("#eval_keyword").val()) {
        window._cstop = false;
    }
    
    // 判定最后一页，不允许查询
    if (_page > 0 && window._cstop) {
        toast("已经是最后一页", 3000);
        return;
    }
    
    // _page 可能小于0，表示向上翻页，但window._cpage不能小于1
    window._cpage = window._cpage + _page;
    if (window._cpage < 1) {
        window._cpage = 1;
    }
    
    // 如果输入关键字并且关键字与以前不一致，包括第一次输入关键字，将页面设置为1
    if (window.evalkeyword != $("#eval_keyword").val()) {
        window.evalkeyword = $("#eval_keyword").val();
        window._cpage = 1;
    }
    
    showPageLoading();
    var params = { "page" : window._cpage, "rows" : rows, "sort" : "eval_user_id", "order" : "desc" };
    if (!!$("#eval_keyword").val())
        $.extend(params, { "keyword" : $("#eval_keyword").val() });
    getDataFromServer('used/eval/evalUserListJson.action', params, function(data) {
                      data = eval("(" + data + ")");
                      var html = '', idx = 0;
                      userList = convertToBeanList(data.rows);
                      // 到达最后一页时标记(不能=，如果=就只能显示一页)
                      userList.length < rows ? window._cstop = true : window._cstop = false;
                      
                      console.log("====================");
                      console.log("当前页：" + window._cpage + ", 最后一页: " + window._cstop + ", 参数: " + params.page);
                      console.log("====================");
                      
                      $(userList).each(function() {
                                       html += '<li class="ui-pop-li" onclick="onEvalItemClick(' + idx + ');">';
                                       html += this.evalUserName + ', ' + this.deptName;
                                       html += '</li>';
                                       idx++;
                                       });
                      $("#eval_list").empty().append(html);
                      $("#evalListPop").find("p").html("选择评估师");
                      centerPop($("#evalListPop"));
                      applyScroll($('#eval_list').parent(), false, true);
                      $("#evalListPop, #evalListShadow").removeClass("ui-hidden");
                      document.removeEventListener('backbutton', back, false);
                      document.addEventListener('backbutton', closePop, false);
                      hidePageLoading();
                      });
}
function onEvalItemClick(index) {
	closePop();
	var eval = userList[index];
//	if (eval.handPhone)
//		eval.handPhone = $.trim(cust.handPhone);
	fillPage(eval);
//	$("#areaName").val(cust.fullAreaName);//显示区域全称
}

var machList;
window._dpage = 1, window._dstop = false;
function getMachList(_page) {
	if (!loginMode()) {
		alertMsg("您现在处于离线状态，无法选择设备");
		return;
	}
	
	var appId = parseInt($("#appId").val(), 10);
	if (appId)
		return toast("选择评估申请后不能再选择设备", 3000);
	
	// 在到达最后一页时输入关键字，解锁判定
	if (window.devicekeyword != $("#device_keyword").val()) {
		window._dstop = false;
	}
	
	// 判定最后一页，不允许查询
	if (_page > 0 && window._dstop) {
		toast("已经是最后一页", 3000);
		return;
	}
	
	// _page 可能小于0，表示向上翻页，但window._dpage不能小于1
	window._dpage = window._dpage + _page;
	if (window._dpage < 1) {
		window._dpage = 1;
	}
	
	// 如果输入关键字并且关键字与以前不一致，包括第一次输入关键字，将页面设置为1
	if (window.devicekeyword != $("#device_keyword").val()) {
		window.devicekeyword = $("#device_keyword").val();
		window._dpage = 1;
	}
	
	var custId = parseInt($("#custId").val(), 10);
	showPageLoading();
	if (custId) {
		var params = { "page" : window._dpage, "rows" : rows, "sort" : "mach_id", "order" : "desc" };
		if (!!$("#device_keyword").val())
			$.extend(params, { "keyword" : $("#device_keyword").val() });
		getDataFromServer('basedata/coMachEvalListJson.action?custId=' + $("#custId").val(), params, function(data) {
			data = eval("(" + data + ")");
			var html = '', idx = 0;
			machList = convertToBeanList(data.rows);
			
			// 到达最后一页时标记(不能=，如果=就只能显示一页)
			machList.length < rows ? window._dstop = true : window._dstop = false;
			
			$(machList).each(function() {
				html += '<li class="ui-pop-li" onclick="onMachItemClick(' + idx + ');">';
				html += this.brandName + ', ' + this.productName + ', ' + this.modelName;
				html += !!this.serialNo ? ', ' + this.serialNo : '';
				html += '</li>';
				idx++;
			});
			$("#device_list").empty().append(html);
			$("#deviceListPop").find("p").html("选择设备");
			centerPop($("#deviceListPop"));
			applyScroll($('#device_list').parent(), false, true);
			$("#deviceListPop, #deviceListShadow").removeClass("ui-hidden");
			document.removeEventListener('backbutton', back, false);
			document.addEventListener('backbutton', closePop, false);
			hidePageLoading();
		});
	} else {
		var params = { "page" : window._dpage, "rows" : rows, "sort" : "stock_in_id", "order" : "desc" };
		if (!!$("#device_keyword").val())
			$.extend(params, { "keyword" : $("#device_keyword").val() });
		getDataFromServer('used/stock/unsoldMachStockInListJson.action', params, function(data) {
			data = eval("(" + data + ")");
			var html = '', idx = 0;
			machList = data.rows;
			
			// 到达最后一页时标记(不能=，如果=就只能显示一页)
			machList.length < rows ? window._dstop = true : window._dstop = false;
			
			$(machList).each(function() {
				html += '<li class="ui-pop-li" onclick="onMachItemClick(' + idx + ');">';
				html += this.brandName + ', ' + this.productName + ', ' + this.modelName;
				html += !!this.serialNo ? ', ' + this.serialNo : '';
				html += '</li>';
				idx++;
			});
			$("#device_list").empty().append(html);
			$("#deviceListPop").find("p").html("选择设备");
			centerPop($("#deviceListPop"));
			$("#deviceListPop, #deviceListShadow").removeClass("ui-hidden");
			applyScroll($('#device_list').parent(), false, true);
			document.removeEventListener('backbutton', back, false);
			document.addEventListener('backbutton', closePop, false);
			hidePageLoading();
		});
	}
}

function onMachItemClick(index) {
	closePop();
	var mach = machList[index];
	mach.actionLeaveDate = mach.leaveDate;
	stuffFormDatas(mach);
	updateMachInfo();
	$("#leaveDate").trigger("change");
	console.info(JSON.stringify(mach));
	_loadBpm();
}


function calcLeaveDate() {
	var ld = $("#leaveDate").val();
	var ad = $("#evalDate").val();
	var md = getMonthDiff(ld, ad, true);  // 出厂日期不能晚于评估日期 
	console.log("===========" + md);
	var y = Math.floor(md / 12), m = md % 12;
	$("#iwYear").val(y);
	$("#iwMonth").val(m);
	$("#workYear").val(md).trigger("change"); // 触发计算
}


function setElementData(id, value) {
	if (value != null && value.trim() != '') {
		$(id).html(value);
	}
}

function loadBrand() {
	ap.dbFindAll("Phone_Comm_Brand", function(result) {
		buildBrandDropDownList(result);
		hidePageLoading();
	}, "brandId, brandName", "isUse=1");
}

function buildBrandDropDownList(result) {
	var list = '<p class="ui-select-option">--- 请选择 ---</p>';
	for (var i = 0; i < result.rows.length; i++) {
		var item = result.rows.item(i);
		list += '<p class="ui-select-option" onclick="optionSelected(\'brand\', ' + (i + 1) + ', ' + item.brandId + ', loadProduct);clearChildren(\'product\',\'model\')">' + item.brandName + '</p>';
	}
	list += '<p class="ui-select-option" onclick="manualInput(\'brand\');">手动输入</p>';
	list += '<p class="ui-select-option" onclick="optionSelected(\'brand\', -1, 0)">取消</p>';
	list = "<div>" + list + "</div>";
	$("#brand-list").empty().append(list);
}

function clearChildren() {
	for (var i = 0; i < arguments.length; ++i) {
		var a = arguments[i];
		var showLnk = $("#" + a + "-list-selected").parent();
		if (i > 0)
			showLnk.addClass("ui-input-disabled");
		var textSel = $("#" + a + "-list-selected").html("--- 请选择 ---");
		var nm = $("#" + a + "Name").val("");
		var id = $("#" + a + "Id").val("");
		
		returnToSelect(a);
	}
}

function loadProduct(callback) {
	if ($("#product-show-link").hasClass("ui-input-disabled")) {
		$("#product-show-link").removeClass("ui-input-disabled");
		$("#product-show-link").attr("onclick", "openSelectList('product')");
	}
	var brandId = $("#brandId").val();
	ap.dbFindAll("Phone_Comm_Product", function(result) {
		buildProductDropDownList(result);
		if (callback)
			callback();
	}, "productId, productName", "isUse=1 and brandId=" + brandId);
}

function buildProductDropDownList(result) {
	var list = '<p class="ui-select-option">--- 请选择 ---</p>';
	for (var i = 0; i < result.rows.length; i++) {
		var item = result.rows.item(i);
		list += '<p class="ui-select-option" onclick="optionSelected(\'product\', ' + (i + 1) + ', ' + item.productId + ', loadModel);clearChildren(\'model\')">' + item.productName + '</p>'
	}
	list += '<p class="ui-select-option" onclick="manualInput(\'product\');">手动输入</p>';
	list += '<p class="ui-select-option" onclick="optionSelected(\'product\', -1, 0)">取消</p>';
	var container = $("#product-list");
	// 使用iscroll时需要一个固定的子元素，避免在刷新时失去滚动效果
	container = !container.children().length ? $("<div></div>").appendTo(container) : container.children(":eq(0)");
	$(container).empty().append(list);
}

function loadModel(callback) {
	if ($("#model-show-link").hasClass("ui-input-disabled")) {
		$("#model-show-link").removeClass("ui-input-disabled");
		$("#model-show-link").attr("onclick", "openSelectList('model')");
	}
	var productId = $("#productId").val();
	ap.dbFindAll("Phone_Comm_Model", function(result) {
		buildModelDropDownList(result);
		if (callback)
			callback();
	}, "modelId, modelName", "isUse=1 and productId=" + productId, [ 'modelName', 'asc' ]);
}

function buildModelDropDownList(result) {
	var list = '<p class="ui-select-option">--- 请选择 ---</p>';
	for (var i = 0; i < result.rows.length; i++) {
		var item = result.rows.item(i);
		list += '<p class="ui-select-option" onclick="optionSelected(\'model\', ' + (i + 1) + ', ' + item.modelId + ');">' + item.modelName + '</p>';
	}
	list += '<p class="ui-select-option" onclick="manualInput(\'model\');">手动输入</p>';
	list += '<p class="ui-select-option" onclick="optionSelected(\'model\', -1, 0)">取消</p>';
	var container = $("#model-list");
	// 使用iscroll时需要一个固定的子元素，避免在刷新时失去滚动效果
	container = !container.children().length ? $("<div></div>").appendTo(container) : container.children(":eq(0)");
	$(container).empty().append(list);

}

//从选择变为手动输入品牌、产品、机型
function manualInput(sel, doNotClearValue){
	dismiss();
	switch(sel){
	case 'brand':
		$('#brand-select,#product-select,#model-select').hide();
		$('#brand-input,#product-input,#model-input').show();
		$("#product-input,#model-input").find(".ui-icon").hide();
		if (!doNotClearValue) {
			$("#brandId,#productId,#modelId").val(0);
			$("#brandName,#productName,#modelName").val("");
		}
		break;	
	case 'product':
		$('#product-select,#model-select').hide();
		$('#product-input,#model-input').show();
		$("#product-input").find(".ui-icon").removeClass("ui-hidden");
		$("#model-input").find(".ui-icon").addClass("ui-hidden");
		if (!doNotClearValue) {
			$("#productId,#modelId").val(0);
			$("#productName,#modelName").val("");
		}
		break;	
	case 'model':
		$('#model-select').hide();
		$('#model-input').show();
		$("#model-input").find(".ui-icon").removeClass("ui-hidden");
		if (!doNotClearValue) {
			$("#modelId").val(0);
			$("#modelName").val("");
		}
		break;
	default:break;
	}
}
//从手动输入重置为选择品牌、产品、机型
function returnToSelect(sel){
	switch(sel){
	case 'brand':
		$('#brand-select,#product-select,#model-select').show();
		$('#brand-input,#product-input,#model-input').hide();
		$("#brandId,#brandName,#productId,#productName,#modelId,#modelName").val("");
		$("#brand-list-selected,#product-list-selected,#model-list-selected").html("---请选择---");
		$("#product-list-selected,#model-list-selected").parent().addClass("ui-input-disabled").attr("onclick", "void(0)");
		break;
	case 'product':
		$('#product-select,#model-select').show();
		$('#product-input,#model-input').hide();
		$("#productId,#productName,#modelId,#modelName").val("");
		$("#product-list-selected,#model-list-selected").html("---请选择---");
		$("#model-list-selected").parent().addClass("ui-input-disabled").attr("onclick", "void(0)");
		break;
	case 'model':
		$('#model-select').show();
		$('#model-input').hide();
		$("#modelId,#modelName").val("");
		$("#model-list-selected").html("---请选择---");
		break;
	default:break;
	}
}


// 下拉列表切换
function backToDropDown(sel) {
	if (sel == 'brand') {
		$("#brand-show-link").parent().parent().removeClass("ui-hidden");
		$("#brandId").parent().parent().addClass("ui-hidden");
		$("#product-show-link").parent().parent().removeClass("ui-hidden");
		$("#productId").parent().parent().addClass("ui-hidden");
	} else if (sel == 'product') {
		$("#product-show-link").parent().parent().removeClass("ui-hidden");
		$("#productId").parent().parent().addClass("ui-hidden");
	}
	$("#model-show-link").parent().parent().removeClass("ui-hidden");
	$("#modelId").parent().parent().addClass("ui-hidden");
}

function loadCompBrand(callback) {
	ap.dbFindAll("Phone_Comm_Brand", function(result) {
		buildCompBrandDropDownList(result);
		if (callback)
			callback();
	}, "brandId, brandName", "isUse=1 and isSelf=0");
}

function buildCompBrandDropDownList(result) {
	var list = '<p class="ui-select-option">--- 请选择 ---</p>';
	for (var i = 0; i < result.rows.length; i++) {
		var item = result.rows.item(i);
		list += '<p class="ui-select-option" onclick="optionSelected(\'compBrand\', ' + (i + 1) + ', ' + item.brandId + ', loadCompProduct);clearChildren(\'compProduct\',\'compModel\')">' + item.brandName + '</p>';
	}
	list += '<p class="ui-select-option" onclick="optionSelected(\'compBrand\', -1, 0)">取消</p>';
	var container = $("#compBrand-list");
	// 使用iscroll时需要一个固定的子元素，避免在刷新时失去滚动效果
	container = !container.children().length ? $("<div></div>").appendTo(container) : container.children(":eq(0)");
	$(container).empty().append(list);
}

function loadCompProduct(callback) {
	if ($("#compProduct-show-link").hasClass("ui-input-disabled")) {
		$("#compProduct-show-link").removeClass("ui-input-disabled");
		$("#compProduct-show-link").attr("onclick", "openSelectList('compProduct')");
	}
	var brandId = $("#compBrandId").val();
	ap.dbFindAll("Phone_Comm_Product", function(result) {
		buildCompProductDropDownList(result);
		if (callback)
			callback();
	}, "productId, productName", "isUse=1 and brandId=" + brandId);
}

function buildCompProductDropDownList(result) {
	var list = '<p class="ui-select-option">--- 请选择 ---</p>';
	for (var i = 0; i < result.rows.length; i++) {
		var item = result.rows.item(i);
		list += '<p class="ui-select-option" onclick="optionSelected(\'compProduct\', ' + (i + 1) + ', ' + item.productId + ', loadCompModel);clearChildren(\'compModel\')">' + item.productName + '</p>'
	}
	list += '<p class="ui-select-option" onclick="optionSelected(\'compProduct\', -1, 0)">取消</p>';
	var container = $("#compProduct-list");
	// 使用iscroll时需要一个固定的子元素，避免在刷新时失去滚动效果
	container = !container.children().length ? $("<div></div>").appendTo(container) : container.children(":eq(0)");
	$(container).empty().append(list);
}

function loadCompModel(callback) {
	if ($("#compModel-show-link").hasClass("ui-input-disabled")) {
		$("#compModel-show-link").removeClass("ui-input-disabled");
		$("#compModel-show-link").attr("onclick", "openSelectList('compModel')");
	}
	var productId = $("#compProductId").val();
	ap.dbFindAll("Phone_Comm_Model", function(result) {
		buildCompModelDropDownList(result);
		if (callback)
			callback();
	}, "modelId, modelName", "isUse=1 and productId=" + productId, [ 'modelName', 'asc' ]);
}

function buildCompModelDropDownList(result) {
	var list = '<p class="ui-select-option">--- 请选择 ---</p>';
	for (var i = 0; i < result.rows.length; i++) {
		var item = result.rows.item(i);
		list += '<p class="ui-select-option" onclick="optionSelected(\'compModel\', ' + (i + 1) + ', ' + item.modelId + ');">' + item.modelName + '</p>';
	}
	list += '<p class="ui-select-option" onclick="optionSelected(\'compModel\', -1, 0)">取消</p>';
	var container = $("#compModel-list");
	// 使用iscroll时需要一个固定的子元素，避免在刷新时失去滚动效果
	container = !container.children().length ? $("<div></div>").appendTo(container) : container.children(":eq(0)");
	$(container).empty().append(list);
}

function loadReProduct(callback) {
	ap.dbFindAll("Phone_Comm_Product", function(result) {
		buildReProductDropDownList(result);
		if (callback)
			callback();
	}, "productId, productName", "isUse=1 and brandId=1");
}

function buildReProductDropDownList(result) {
	var list = '<p class="ui-select-option">--- 请选择 ---</p>';
	for (var i = 0; i < result.rows.length; i++) {
		var item = result.rows.item(i);
		list += '<p class="ui-select-option" onclick="optionSelected(\'reProduct\', ' + (i + 1) + ', ' + item.productId + ', loadReModel);clearChildren(\'reModel\')">' + item.productName + '</p>'
	}
	list += '<p class="ui-select-option" onclick="optionSelected(\'reProduct\', -1, 0)">取消</p>';
	var container = $("#reProduct-list");
	// 使用iscroll时需要一个固定的子元素，避免在刷新时失去滚动效果
	container = !container.children().length ? $("<div></div>").appendTo(container) : container.children(":eq(0)");
	$(container).empty().append(list);
}

function loadReModel(callback) {
	if ($("#reModel-show-link").hasClass("ui-input-disabled")) {
		$("#reModel-show-link").removeClass("ui-input-disabled");
		$("#reModel-show-link").attr("onclick", "openSelectList('reModel')");
	}
	var productId = $("#reProductId").val();
	ap.dbFindAll("Phone_Comm_Model", function(result) {
		buildReModelDropDownList(result);
		if (callback)
			callback();
	}, "modelId, modelName", "isUse=1 and productId=" + productId, [ 'modelName', 'asc' ]);
}

function buildReModelDropDownList(result) {
	var list = '<p class="ui-select-option">--- 请选择 ---</p>';
	for (var i = 0; i < result.rows.length; i++) {
		var item = result.rows.item(i);
		list += '<p class="ui-select-option" onclick="optionSelected(\'reModel\', ' + (i + 1) + ', ' + item.modelId + ');">' + item.modelName + '</p>';
	}
	list += '<p class="ui-select-option" onclick="optionSelected(\'reModel\', -1, 0)">取消</p>';
	var container = $("#reModel-list");
	// 使用iscroll时需要一个固定的子元素，避免在刷新时失去滚动效果
	container = !container.children().length ? $("<div></div>").appendTo(container) : container.children(":eq(0)");
	$(container).empty().append(list);
}

function loadCode() {
	// 设备来源
	ap.dbFindAll("Phone_Comm_Code_Detail", function(result) {
		var list = '<p class="ui-select-option">--- 请选择 ---</p>';
		for (var i = 0; i < result.rows.length; i++) {
			var item = result.rows.item(i);
			list += '<p class="ui-select-option" onclick="optionSelected(\'sourceType\', ' + (i + 1) + ', ' + item.codeId + ', function(){chengeSourceType('+item.codeId+')});">' + item.codeName + '</p>';
		}
		list += '<p class="ui-select-option" onclick="optionSelected(\'sourceType\', -1, 0)">取消</p>';
		list = "<div>" + list + "</div>";
		$("#sourceType-list").empty().append(list);
	}, 'codeId, codeName', 'typeNo="CD010002"');
	// 工况
	ap.dbFindAll("Phone_Comm_Code_Detail", function(result) {
		var list = '<p class="ui-select-option">--- 请选择 ---</p>';
		for (var i = 0; i < result.rows.length; i++) {
			var item = result.rows.item(i);
			workConditionCodeMap[item.codeId] = item;
			list += '<p class="ui-select-option" onclick="optionSelected(\'machCondition\', ' + (i + 1) + ', ' + item.codeId + ', function(){chooseMachCondition(' + item.codeValue + ')});">' + item.codeName + '</p>';
		}
		list += '<p class="ui-select-option" onclick="optionSelected(\'machCondition\', -1, 0)">取消</p>';
		list = "<div>" + list + "</div>";
		insertJsonStore("workConditionCodeMap", workConditionCodeMap);
		$("#machCondition-list").empty().append(list);
	}, 'codeId, codeName, codeValue', 'typeNo="CD010011"');
	// 评估等级
	ap.dbFindAll("Phone_Comm_Code_Detail", function(result) {
		for (var i = 0; i < result.rows.length; i++) {
			var item = result.rows.item(i);
			evalLevelCodeMap[item.codeId] = item;
		}
		insertJsonStore("evalLevelCodeMap", evalLevelCodeMap);
	}, 'codeId, codeName', 'typeNo="CD040010" ORDER BY codeId');
	// 模板
	ap.dbFindAll("Phone_Eval_Template", function(data) {
		if (data && data.rows) {
			for (var i = 0, j = data.rows; i < j.length; ++i) {
				var t = j.item(i);
				evalTemplateMap[t.evalTemplateId] = t.evalTemplateName;
			}
		}
		insertJsonStore("evalTemplateMap", evalTemplateMap);
	}, "evalTemplateId, evalTemplateName", "1=1");
    //微调原因
    ap.dbFindAll('Phone_Comm_Code_Detail',function(data){
                 var deprecCauseId = data.rows;
                 var html = '';
                 if(!!deprecCauseId && deprecCauseId.length > 0)
                 for(var i = 0; i < deprecCauseId.length; i++) {
                 html += '<p class="ui-select-option" onclick="optionSelected(\'deprecCauseId\','+i+','+deprecCauseId.item(i).codeId+');">'+deprecCauseId.item(i).codeName+"</p>";
                 }
                 html += '<p class="ui-select-option" onclick="optionSelected(\'deprecCauseId\','+(-1)+',0);">取消</p>';
                 html = "<div>" + html + "</div>";
                 $('#deprecCauseId-list').append(html);
                 },"codeId,codeName",'isUse = 1 and typeNo = "CD050001"');
}

function chooseMachCondition(cond) {
	$("#moreMonth").val(cond);
	calcEvalFormValues();
}

function loadTemplate() {
	ap.dbFindAll("Phone_Eval_Template", function(result) {
		var list = '<p class="ui-select-option">--- 请选择 ---</p>';
		for (var i = 0; i < result.rows.length; i++) {
			var item = result.rows.item(i);
			list += '<p class="ui-select-option" onclick="optionSelected(\'evalTemplate\', ' + (i + 1) + ', ' + item.evalTemplateId + ', onTemplateChange);">' + item.evalTemplateName + '</p>';
		}
		list += '<p class="ui-select-option" onclick="optionSelected(\'evalTemplate\', -1, 0)">取消</p>';
		list = "<div>" + list + "</div>";
		$("#evalTemplate-list").empty().append(list);
	}, 'evalTemplateId, evalTemplateName', "isUse=1");
}

function jumpToEvalPage() {
	var template = getCurrentTemplate();
	if (!template) {
		toast("请选择评估模板", 3000);
	} else {
		var pageDataStr = JSON.stringify(extractPage());
		var photoStr = JSON.stringify(_loadPhotos2());// 获取页面图片并解析字符串，不仅仅只是从服务器上获取
		insertStore("PAGE_DATA_STRING", pageDataStr);
		insertStore("PAGE_PHOTO_STRING", photoStr);
		insertStore("PAGE_EVALUATING", "1");	// 进入评分表的标记，返回时根据此标记判断是否从评分页面返回，在页面加载处理完毕时清除此标记
		console.log("跳往评分页面")
		console.log("保存页面数据:" + pageDataStr);
		console.log("保存照片信息:" + photoStr);
		window.location.href = "evallist.html";
	}
}

function jumpToShowEvalPage() {
	var tempId = parseInt($("#evalTemplateId").html(), 10) || 0;
	console.log(tempId);
	insertStore("CURR_REPT_TEMPID", tempId);
	window.location.href = "showevallist.html";
}

function fillPage(params) {
	for (var k in params) {
		var v = params[k];
		var inp = $("#" + k);
		if (inp.length) {
			var type = inp.attr("type");
			if (type == "checkbox") {
				if (v)
					inp.attr("checked", "checked");
				else
					inp.removeAttr("checked");
			} else {
				inp.val(v);
			}
		}
	}
}

function extractPage() {
	var params = {};
	$(":input[id]").each(function() {
		var t = $(this);
		var id = t.attr("id");
		var val = t.val();
		if (t.attr("type") == "checkbox") {
			val = this.checked;
		}
		params[id] = val;
	});
	return params;
}


function calculatTotalMonth() {
	var workYear = parseInt($("#iwYear").val(), 10) || 0;
	var workMonth = parseInt($("#iwMonth").val(), 10) || 0;
	console.log("workYear=" + workYear + ", workMonth=" + workMonth);
	$("#workYear").val(workYear * 12 + workMonth);
	calculatDeprec();
}

function calculatDeprec() {
	console.log("templateid = " + $("#evalTemplateId").val());
	if (!$("#evalTemplateId").val())
		return;
	var workhours = $('#workHour').val() || 0;
	var totalmonth = $('#workYear').val() || 0;
	
	var moremonth = $('#moreMonth').val() || 0;
	totalmonth = parseInt(totalmonth, 10) + parseInt(moremonth, 10) * 12;
	console.log("workYear:" + totalmonth + ", workHour:" + workhours + ", moreMonth:" + moremonth);
	
	//正常情况下折旧率以工作时间为准，当计时表出现故障时以销售时间为准
	//工作小时和 年限分别计算折旧率，两者取其高--2014.02.16
	var totaldeprecrate = 0;
	ap.dbFindAll("Phone_Eval_Template_Deprec", function(result) {
		var hourdeprec = 0, monthdeprec = 0;
		if (!!workhours) {
			for (var i = 0; i < result.rows.length; i++) {
				var deprec = result.rows.item(i);
				console.log("min:" + deprec.minWorkHour + ", max:" + deprec.maxWorkHour);
				if (parseInt(workhours, 10) >= deprec.minWorkHour && parseInt(workhours, 10) <= deprec.maxWorkHour) {
					hourdeprec = deprec.deprecRate;
					break;
				}
			}
		} 
		if (!!totalmonth) {
			for (var i = 0; i < result.rows.length; i++) {
				var deprec = result.rows.item(i);
				console.log("leaveDate:" + deprec.leaveDate);
				if (totalmonth <= deprec.leaveDate) {
					monthdeprec = deprec.deprecRate;
					break;
				}
			}
		}
		
		totaldeprecrate = hourdeprec > monthdeprec ? hourdeprec : monthdeprec;
		console.log("deprecrate:" + totaldeprecrate);
		$('#deprecRate').val(totaldeprecrate);
	}, "*", "evalTemplateId=" + $("#evalTemplateId").val());
}

/**
 * 提前计算需要计算的值
 */
function prepareForm() {
	var wSalePrice = parseFloat($("#wSalePrice").val());
	var wCustExpPrice = parseFloat($("#wCustExpPrice").val());
	var wEvalPrice = parseFloat($("#wEvalPrice").val());
	var wSysEvalPrice = parseFloat($("#wSysEvalPrice").val());
	var wReMachinePrice = parseFloat($("#wReMachinePrice").val());
	var wMarketPrice = parseFloat($("#wMarketPrice").val());
	var wCompPrice = parseFloat($("#wCompPrice").val());
	var wCompNewPrice = parseFloat($("#wCompNewPrice").val());
	
	if (!isNaN(wSalePrice))
		$("#salePrice").val(wSalePrice * 1);
	if (!isNaN(wCustExpPrice))
		$("#custExpPrice").val(wCustExpPrice * 1);
	if (!isNaN(wEvalPrice))
		$("#evalPrice").val(wEvalPrice * 1);
	if (!isNaN(wSysEvalPrice))
		$("#sysEvalPrice").val(wSysEvalPrice * 1);
	if (!isNaN(wReMachinePrice))
		$("#reMachinePrice").val(wReMachinePrice * 1);
	if (!isNaN(wMarketPrice))
		$("#marketPrice").val(wMarketPrice * 1);
	if (!isNaN(wCompPrice))
		$("#compPrice").val(wCompPrice * 1);
	if (!isNaN(wCompNewPrice))
		$("#compNewPrice").val(wCompNewPrice * 1);
	
	var reMachinePrice = parseFloat($("#reMachinePrice").val()) || 0;
	$("#reMachinePrice").val(reMachinePrice);
	var sysEvalprice = parseFloat($("#sysEvalPrice").val()) || 0;
	$("#sysEvalPrice").val(sysEvalprice);
	var evalAffPrice = parseFloat($("#evalAffPrice").val()) || 0;
	$("#evalAffPrice").val(evalAffPrice);
	var marketPrice = parseFloat($("#marketPrice").val()) || 0;
	$("#marketPrice").val(marketPrice);
	var compPrice = parseFloat($("#compPrice").val()) || 0;
	$("#compPrice").val(compPrice);
	var compNewPrice = parseFloat($("#compNewPrice").val()) || 0;
	$("#compNewPrice").val(compNewPrice);
	
	$("#actionLeaveDate").val($("#leaveDate").val());
}

/*
function calculatEvalPrice() {
//	var data = translateJSON(getParameter2());
//	console.log(data.salePrice);
//	console.log(data.salvageRate);
//	console.log(data.deprecRate);
//	console.log(data.levelPrice);
	prepareForm();
	var data = {
		salePrice : parseFloat($("#salePrice").val()) || 0,
		salvageRate : parseFloat($("#salvageRate").val()) || 0,
		deprecRate : parseFloat($("#deprecRate").val()) || 0,
		levelPrice : parseFloat($("#levelPrice").val()) || 0
	};
	console.info(JSON.stringify(data));
	
	var sysprice;
	if (!data.levelPrice)
		sysprice = 0;
	else
		sysprice = Math.round(data.salePrice * data.salvageRate * (100 - data.deprecRate) * (data.salvageRate / data.levelPrice));
	console.log("sysprice = " + sysprice);
	
	$("#sysEvalPrice").val(sysprice);
	$("#wSysEvalPrice").val(Math.floor(sysprice * 100) / 100);
}
*/
function form2Obj() {
	var params = {};
	$(":input[id][name]").each(function() {
		var t = $(this);
		var n = t.attr("name");
		if (t.attr("type") != "checkbox") {
			params[n] = t.val() == null ? '' : t.val();
		} else {
			params[n] = this.checked;
		}
	});
	return params;
}

function submitServer() {	
	showPageLoading();
	
	prepareForm();
	var params = form2Obj();
	delete params["en.wSalePrice"];
	delete params["en.wReMachinePrice"];
	delete params["en.wCustExpPrice"];
	delete params["en.wMarketPrice"];
	delete params["en.wCompPrice"];
	delete params["en.wCompNewPrice"];
	delete params["app_keyword"];
	delete params["cust_keyword"];
    delete params["eval_keyword"];
	delete params["device_keyword"];
	if (!params["en.custExpPrice"])
		params["en.custExpPrice"] = 0;
	if (!params["en.expTradeDate"])
		params["en.expTradeDate"] = getCurrDate();
	
	toast("正在提交数据，请稍候", 4000);

	// 先校验
	params["validateOnly"] = 1;
	blockedPostData('used/eval/updateEvalRept.action', params, function(json) {
		// 提交数据
		uploadFile(function(obj) {
			// 去掉验证标识，准备保存
			delete params["validateOnly"];
			var attachments=obj?obj.attachments:[];
			var partIds=obj?obj.partIds:[];
			var extAtts=obj?obj.extAtts:[];
			
			if (attachments) {
				if (attachments.length < 16) {
					alertMsg("评估照片至少上传16张，请补充");
					dismissSavePop();
					return;
				}
				params.attachmentDetailsLength=attachments.length;
				params.evalPhotosLength=partIds.length;
				params.extAttsLength=extAtts.length;
				for (var i = 0; i < attachments.length; ++i) {
					params["attachmentDetails[" + i + "].createDate"]=attachments[i].createDate;
					params["attachmentDetails[" + i + "].fileName"]=attachments[i].fileName;
					params["attachmentDetails[" + i + "].fileSize"]=attachments[i].fileSize;
					params["attachmentDetails[" + i + "].fileType"]=attachments[i].fileType;
					params["attachmentDetails[" + i + "].originalName"]=attachments[i].originalName;
					params["attachmentDetails[" + i + "].pathName"]=attachments[i].pathName;
				}
				for (var j=0; j < partIds.length; ++j){
					params["evalPhotos[" + j + "].partCodeId"]=partIds[j];
				}
				for (var k=0; k<extAtts.length; k++){
					params["expPhotos[" + k + "].createDate"]=extAtts[k].createDate;
					params["expPhotos[" + k + "].fileName"]=extAtts[k].fileName;
					params["expPhotos[" + k + "].fileSize"]=extAtts[k].fileSize;
					params["expPhotos[" + k + "].fileType"]=extAtts[k].fileType;
					params["expPhotos[" + k + "].originalName"]=extAtts[k].originalName;
					params["expPhotos[" + k + "].pathName"]=extAtts[k].pathName;
					var remark = extAtts[k].originalName.indexOf("_") == -1 ? extAtts[k].originalName : extAtts[k].originalName.substring(0, extAtts[k].originalName.indexOf("_"));
					params["expPhotos[" + k + "].remark"]=extAtts[k].remark != null ? extAtts[k].remark : remark;
				}
			}
			
			var template = getCurrentTemplate();
			if (template) {
				var idx = 0;
				$(template.details).each(function() {
					if (this.levelId == 2) {
						params["reptDetailList[" + idx + "].evalItemId"] = this.evalItemId;
						params["reptDetailList[" + idx + "].salvageValue"] = this.salvageValue || 0;
						//console.info("#" + idx + " " + JSON.stringify(this));
						++idx;
					}
				});
				params.reptDetailListLength = idx;
			}
			
			console.log("saving report : " + JSON.stringify(params));
			blockedPostData('used/eval/updateEvalRept.action', params, function(json) {
				var draftReportId = getStore("CURR_REPORT_ID");
				if (draftReportId) {
					ap.dbDelete("Phone_Du_Eval_Report_Detail", { reportId : draftReportId }, function() {
						ap.dbDelete("Phone_Du_Eval_Photo", { billId : draftReportId, billType : "REPT" }, function() {
							ap.dbDelete("Phone_Du_Eval_Report", { _id : draftReportId }, function() {
								toast("保存成功", 5000);
								hidePageLoading();
								backFromSave();
							});
						});
					});
				} else {
					toast("保存成功", 5000);
					hidePageLoading();
					backFromSave();
				}
			});
		});
	}, function(data, errorMessages) {
		if (errorMessages && errorMessages.length)
			alertMsg(errorMessages.join("\n"));
		else
			alertMsg("无法提交数据至服务器");
		hidePageLoading();
	});
}

function validate(){
	//valInput:需要验证非空的input表单ID,wrapInput:验证不通过时包裹红色边框的表单ID
	var list = [{valInput:'#brandId',wrapInput:['#brand-show-link','#brandName'],msg:'请选择品牌'},
	            {valInput:'#productId',wrapInput:['#product-show-link','#productName'],msg:'请选择产品'},
	            {valInput:'#modelId',wrapInput:['#model-show-link','#modelName'],msg:'请选择机型'},
	            {valInput:'#sourceTypeId',wrapInput:['#sourceType-validate'],msg:'请选择设备来源'},
//                {valInput:'#faultDesc',wrapInput:['#faultDesc-validate'],msg:'请输入故障描述'},
	            {valInput:'#evalTemplateId',wrapInput:['#evalTemplate-validate'],msg:'请选择评估模板'},
	            {valInput:'#machConditionId',wrapInput:['#machCondition-validate'],msg:'请选择工况'}
	           ];
	var prompt = '';
	var pass = true;
	//验证普通项
	$(':required').each(function(){
		var val = $(this).val();
		if(!val){
			
			if ($("#sourceTypeId").val() != 1000201 && $("#sourceTypeId").val() != 1000202) {
				if ($(this).attr("id") != 'wCustExpPrice' && $(this).attr("id") != 'expTradeDate') {
					$(this).parents('.ui-body').addClass('ui-check-error');
					$(this).parents('ui-body').on('change',function(){
						$(this).parents('.ui-body').removeClass('ui-check-error');
					});
					prompt += $(this).attr('placeholder')+'\n';
					pass = false;
				}
			} else {
				$(this).parents('.ui-body').addClass('ui-check-error');
				$(this).on('change',function(){
					$(this).parents('.ui-body').removeClass('ui-check-error');
				});
				prompt += $(this).attr('placeholder')+'\n';
				pass = false;
			}
		}
	})
	//验证下拉项
	$(list).each(function(){
		var val = $(this.valInput).val();
		if(!val){
			$.each(this.wrapInput,function(index,element){
				$(element).css('border','solid 1px red');
				$(element).bind('change,focus',function(){
					$(this).css('border','none');
				})
			});
			prompt += (this.msg + '\n');
			pass = false;
		}
	})
	
	if(!pass){
		dismissSavePop();
		alertMsg(prompt);
	}
	return pass;
}

function getParameter() {
	$("#evalDate").val(getCurrDate());
	var paramstr = '';
	for (var i = 0; i < $(":input").length; i++) {
		if ($(":input").eq(i).attr("id")) {
			paramstr += $(":input").eq(i).attr("name");
			paramstr += '=';
			paramstr += $(":input").eq(i).val() == null ? '' : $(":input").eq(i).val();
			if (i < $(":input").length - 1) {
				paramstr += '&';
			}
		}
	}
	console.log(paramstr);
	return paramstr;
}

function translateJSON(params) {
	var arr = params.split("&");
	var json = new Object();
	for (var i = 0; i < arr.length; i++) {
		var subarr = arr[i].split("=");
		json[subarr[0]] = subarr[1];
	}
	return json;
}

function getParameterDraft() {
	var paramstr = '';
	for (var i = 0; i < $(":input").length; i++) {
		if ($(":input").eq(i).attr("id")) {
			var id = $(":input").eq(i).attr("id");
			paramstr += id + '=';
			paramstr += $(":input").eq(i).val() == null ? '' : $(":input").eq(i).val();
			if (i < $(":input").length - 1) {
				paramstr += '&';
			}
		}
	}
	console.log(paramstr);
	return paramstr;
}

function translateDraft(params, isneed) {
	var arr = params.split("&");
	var json = new Object();
	for (var i = 0; i < arr.length; i++) {
		var subarr = arr[i].split("=");
		json[subarr[0]] = subarr[1];
	}
	if (isneed) {
		json['createUserId'] = getStore("USERID");
		json['createUserName'] = getStore("USERNAME");
		json['createDate'] = getCurrTime();
	}
	return json;
}


function loadData() {
	var storedData = getStore("PAGE_DATA_STRING");
	trace("EVAL REPORT = " + storedData);
	if (!storedData) {
		console.log("进入编辑页面，新建单据");
		// 初次加载
		$("#evalDate").val(getCurrDate());
	} else {
		console.log("从评分表返回编辑页面");
		// 从评估表返回
		var data = JSON.parse(storedData);
		fillPage(data);
		
		if (!!$("#brandName").val()) {
			$("#brand-list-selected").html($("#brandName").val());
		}
		if (!!$("#productName").val()) {
			$("#product-list-selected").html($("#productName").val());
		}
		if (!!$("#modelName").val()) {
			$("#model-list-selected").html($("#modelName").val());
		}
		if (!!$("#sourceTypeName").val()) {
			$("#sourceType-list-selected").html($("#sourceTypeName").val());
		}
		if (!!$("#evalTemplateName").val()) {
			$("#evalTemplate-list-selected").html($("#evalTemplateName").val());
		}
		if (!!$("#machConditionName").val()) {
			$("#machCondition-list-selected").html($("#machConditionName").val());
		}
		if (!!$("#reProductName").val()) {
			$("#reProduct-list-selected").html($("#reProductName").val());
		}
		if (!!$("#reModelName").val()) {
			$("#reModel-list-selected").html($("#reModelName").val());
		}
		if (!!$("#compBrandName").val()) {
			$("#compBrand-list-selected").html($("#compBrandName").val());
		}
		if (!!$("#compProductName").val()) {
			$("#compProduct-list-selected").html($("#compProductName").val());
		}
		if (!!$("#compModelName").val()) {
			$("#compModel-list-selected").html($("#compModelName").val());
		}
		
		if (getCurrentTemplate()) {
			// 从评分明细返回，重新计算
			calcEvalFormValues();
			chengeSourceType(data.sourceTypeId);
			
			applyTemplate(function() {
				// 恢复图片
				var photoStr = getStore("PAGE_PHOTO_STRING");
				console.log("恢复照片信息:" + photoStr);
				if (photoStr) {
					try {
						var photos = $.parseJSON(photoStr);
						var photoContainer = $("#photoinfo");
						if (photos) {
							var atts = photos.attachments, parts = photos.partIds;
							if (atts && parts) {
								for (var i = 0; i < atts.length; ++i) {
									// 区分图片来源是本地还是服务器，已上传的不需要再上传，加上.data()
									if (atts[i]._is_empty == 1) {
										photoContainer.find("IMG[partId=" + parts[i] + "]").attr("src", atts[i]._img_src);
									} else {
										photoContainer.find("IMG[partId=" + parts[i] + "]").data("attachment", atts[i]).attr("src", atts[i]._img_src);
									}
								}
							}
							var extAtts = photos.extAtts;
							if (extAtts) {
								$(extAtts).each(function() {
									var addPic = photoContainer.find("IMG[addPic=1]");
									if (this._img_oth) {
										// 区分图片来源是本地还是服务器，已上传的不需要再上传，加上.data()
										if (this._is_empty == 1) {
											_addPicture(addPic, this._img_oth, this._img_src);
										} else {
											_addPicture(addPic, this.remark, SERVERURL + "upload/" + this.pathName + this.fileName).data("attachment", this);
										}
									}
								});
							}
						}
					} catch (e) {
						console.log("无法恢复图片:" + e.message);
					}
				}
			});
		}
	}
}
/***********  ADD END  ***********/