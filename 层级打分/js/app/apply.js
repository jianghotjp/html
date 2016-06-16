document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
	document.addEventListener('backbutton', backToLast, false);
}

function backToLast() {
	var f = $('#list').css('display');
	if (!f || f == 'block') {//list显示,从服务器端查询到的数据，返回按钮应返回到menu,同时清空list中的数据
		$('#list').hide();
		$('#apply_list').empty();
		removeStore("APPLY_MENU_TYPE");//menu状态代码为:undefined;
		getApplyMenu();
	} else {//返回home页面
		removeStore("APPLY_MENU_TYPE");
		window.history.back();
	}
}

/***********  LIST START  ***********/
var listInit = 1, draftInit = 1, searchInit = 1, keyword;
// 获取菜单
// 数据格式[{name:'未评估',count:10,no_:1},{name:'评估中',count:10,no_:2},{name:'已评估',count:10,no_:3}]
function getApplyMenu() {
	showPageLoading();
	$('#menu, #footer').show();
	$('#list, #draft').hide();
	$("#content").css("bottom", "3em");
	getDataFromServer('used/eval/evalAppListMenu4Phone.action?ranId='+Math.random(), null, function(data) {
		data = eval('(' + data + ')');
		var arr = data.data.listMenu;
		var html = '';
		$(arr).each(function() {
			html += '<li class="ui-li" onclick="scrollTo($(\'#apply_wrapper\'), 0);page=1;getApplyList(' + this.no_ + ');">';
			html += '<div class="ui-li-wrapper-a ui-txt-inner">';
			html += '<span class="ui-li-txt no-margin">' + this.name + '(' + this.count + ')</span></div></li>';
		});
		$('#apply_menu').empty().append(html);
		initTabs("#content", 'menu', 0);
		hidePageLoading();
	});
}

function getApplyList(no) {
	showPageLoading();
	$('#menu, #draft, #footer').hide();
	$('#list').show();
	$("#content").css({ bottom : 0 });
	insertStore("APPLY_MENU_TYPE", no);//获取服务器端数据，no代表列表状态代码
	var param = { "page" : page, "rows" : rows, "sort" : "app_id", "order" : "desc" };
	if (no == 1) {//未评估
		$.extend(param, { "phoneFilter" : 1 } );
	} else if (no == 2) {//评估中
		$.extend(param, { "phoneFilter" : 2 } );
	}
	getDataFromServer("used/eval/evalAppListJson.action", param, function(data) {
		buildPageData(data, no);
	});
}

function getApplyListDraft() {
	showPageLoading();
	ap.dbFindAll("Phone_Du_Eval_App", buildDraftData, '*', "createUserId=" + getStore("USERID"));
}

function pullUpAction() {
	page += 1;
	$("#loadmore").html("正在加载...");
	if (!!$("#keyword").val()) {
		setTimeout(search(getStore("APPLY_MENU_TYPE")), 200);
	} else {
		setTimeout(getApplyList(getStore("APPLY_MENU_TYPE")), 200);
	}
}

function search(no) {
	showPageLoading();
	var param = { "page" : page, "rows" : rows, "sort" : "app_id", "order" : "desc" };
	if (no == 1) {//未评估
		$.extend(param, { "phoneFilter" : 1 } );
	} else if (no == 2) {//评估中
		$.extend(param, { "phoneFilter" : 2 } );
	}
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
		getDataFromServer("used/eval/evalAppListJson.action", param, function(data) {
			buildPageData(data, no, searchInit == 1);
			searchInit = 0;
		});
	} else {// 重置
		page = 1;
		searchInit = 1;
		param["page"] = page;
		getDataFromServer("used/eval/evalAppListJson.action", param, function(data) {
			buildPageData(data, no, true);
		});
	}
}

function buildPageData(data, no, isClear) {
	data = eval("(" + data + ")");
	var html = '';
	var len = data.rows.length;
	if (len == 0 && listInit == 1) {
		html += '<li class="ui-li">';
		html += '<div class="ui-li-wrapper-a ui-txt-inner">';
		html += '<span class="ui-li-txt">没有查询到相应数据</span></div></li>';
		$("#loadmore").html("共查询到0条数据");
		$("#apply_list").append(html);
	} else {
		for (var i = 0; i < len; i++) {
			var en = data.rows[i];
			html += '<li class="ui-li" onclick="jumpToDetailPage(' + en.app_id + ', 1);">';
			html += '<div class="ui-li-wrapper-b">';
			html += '<span class="ui-li-txt ui-txt-inner">' + en.app_no + '</span><br />';
			html += '<span class="ui-li-txt-desc ui-txt-inner">' + en.brand_name + ', ' + en.product_name + ', ' + en.model_name + (!!en.serian_no ? ', ' + en.serial_no : '');
			html += !!en.create_user_id ? ', ' + en.create_user_name : '' + '</span>';
			html += '</div></li>';
		}
		var loadmorestr = '共查询到';
		if (isClear) {
			loadmorestr += len + "条数据，点击加载更多...";
			$("#apply_list").empty().append(html);
		} else {
			loadmorestr += (len + $("#apply_list").children().length) + "条数据，点击加载更多...";
			$("#apply_list").append(html);
		}
		$("#loadmore").html(loadmorestr);
	}
	listInit = 0;
	initTabs("#content", "list", 0);
	refreshScroll("#apply_wrapper", true, false);
	hidePageLoading();
}

function buildDraftData(data) {
	var html = '';
	var len = data.rows.length;
	if (len == 0) {
		html += '<li class="ui-li">';
		html += '<div class="ui-li-wrapper-a ui-txt-inner">';
		html += '<span class="ui-li-txt">没有查询到相应数据</span></div></li>';
		$("#draft_list").append(html);
	} else {
		for (var i = 0; i < len; i++) {
			var apply = data.rows.item(i);
			html += '<li class="ui-li" onclick="jumpToDetailPage(' + apply._id + ', 0);">';
			html += '<div class="ui-li-wrapper-b">';
			html += '<span class="ui-li-txt ui-txt-inner">' + apply.brandName + ', ' + apply.productName + '</span><br />';
			html += '<span class="ui-li-txt-desc ui-txt-inner">' + apply.modelName + (!!apply.serialNo ? ', ' + apply.serialNo : '');
			html += !!apply.createUserName ? ', ' + apply.createUserName : '' + '</span></div></li>';
		}
		$("#draft_list").append(html);
	}
	draftInit = 0;
	refreshScroll("#draft_wrapper", true, false);
	hidePageLoading();
}

function initListTab(tabId, num) {
	$('#apply_list').empty();
	removeStore("APPLY_MENU_TYPE");//menu状态代码为：undefined;
	getApplyMenu();
	initTabs("#content", tabId, num);
}

function initDraftTab(tabId, num) {
	$('#menu, #list').hide();
	$('#draft').show();
	if (draftInit == 1) {
		getApplyListDraft();
		draftInit = 0;
	}
	insertStore("APPLY_MENU_TYPE", 0);//列表状态为草稿
	initTabs("#content", tabId, num);
}

function jumpToDetailPage(cid, type) {
	insertStore("CURR_APPLY_ID", cid);
	insertStore("CURR_IN_MODE", type);
	window.location.href = 'applydetail.html';
}
/***********  LIST END  ***********/

/***********  DETAIL START  ***********/
function getApplyDetail() {
	showPageLoading();
	getDataFromServer('used/eval/evalAppDetailJson.action', { "keyId" : getStore("CURR_APPLY_ID") }, function(data) {
		data = eval( '(' + data + ')');
		stuffDetailDatas(data.en);
		$("#workYear").html(data.en.WYear + "年" + data.en.WMonth + "月");
		$("#hasCert").html(data.en.hasCert == 1 ? "是" : "否");
		$("#hasInvoice").html(data.en.hasInvoice == 1 ? "是" : "否");
		$("#hasContract").html(data.en.hasContract == 1 ? "是" : "否");
        $("#isOrigpain").html(data.en.isOrigpain == 1 ? "是" : "否");
        $("#isStandpart").html(data.en.isStandpart == 1 ? "是" : "否");
		// 根据设备来源选择是否显示
		if (data.en.sourceTypeId == 1000201) {
			$("#adeal").show();
		} else if (data.en.sourceTypeId == 1000202) {
			$("#adeal").show();
			$("#reProduct, #reModel, #rePrice").hide();
			$("#cpBrand, #cpProduct, #cpModel, #cpEvalPrice, #cpNewPrice").hide();
		} else {
			$("#adeal").hide();
			$("#abase, #aused, #aphoto").removeClass("ui-navbar-item-c").addClass("ui-navbar-item-b");
		}
		
		$("#salePrice, #custExpPrice, #reProductName, #reModelName, #reMachinePrice, #compBrandName, #compProductName, #compModelName, #compPrice, #compNewPrice").hide();
		buildPhotos(data.en);
		hidePageLoading();
	});
}

function buildPhotos(en) {
	var ul = '<ul style="display:block;">';
	if (!!en.appPhotoAttachments && en.appPhotoAttachments.length > 0) {// 部位
		for (var p = 0; p < en.appPhotoAttachments.length; p++) {
			var part = en.appPhotoAttachments[p];
			ul += '<li class="ui-li-photo">';
			ul += '<a href="' + SERVERURL + "upload/" + part.pathName + part.fileName + '">';
			ul += '<img src="' + SERVERURL + "upload/" + part.pathName + part.fileName + '" class="small-pic" alt="' + getPartName(en, part) + '"/></a>';
			ul += '<p class="pic-desc-name">' + getPartName(en, part) + '</p></li>';
		}
	}
	if (!!en.attachmentDetails && en.attachmentDetails.length > 0) {// 增加
		for (var a = 0; a < en.attachmentDetails.length; a++) {
			var attach = en.attachmentDetails[a];
			ul += '<li class="ui-li-photo">';
			var remark = attach.remark;
			if (remark) {
				var p = remark.indexOf("\n");
				if (p != -1) {
					remark = remark.substring(0, p);
				}
				remark = remark.indexOf("_") != -1 ? remark.substring(0, remark.indexOf("_")) : remark;
			}
			ul += '<a href="' + SERVERURL + "upload/" + attach.pathName + attach.fileName + '">';
			ul += '<img src="' + SERVERURL + "upload/" + attach.pathName + attach.fileName + '" class="small-pic" alt="' + (remark || "") + '"/></a>';
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
	for (var i = 0; i < en.appPhotos.length; i++) {
		if (en.appPhotos[i].attachmentDetailId == part.attachmentDetailId) {
			partName = en.appPhotos[i].partCodeName;
			break;
		}
	}
	return partName;
}

function getApplyDetailDraft() {
	showPageLoading();
	ap.dbFindAll('Phone_Du_Eval_App',function(data) {
		var en = data.rows.item(0);
		stuffDetailDatas(en);
		if (!!en.workYear) {
			var WYear = (en.workYear / 12).toFixed(0);
			var WMonth = en.workYear % 12;
			$("#workYear").html(WYear + "年" + WMonth + "月");
		} else {
			$("#workYear").html("------");
		}
		$("#hasCert").html(en.hasCert == 1 ? "是" : "否");
		$("#hasInvoice").html(en.hasInvoice == 1 ? "是" : "否");
		$("#hasContract").html(en.hasContract == 1 ? "是" : "否");
        $("#isOrigpain").html(en.isOrigpain == 1 ? "是" : "否");
        $("#isStandpart").html(en.isStandpart == 1 ? "是" : "否");
		// 根据设备来源选择是否显示
		if (en.sourceTypeId == 1000201) {
			$("#adeal").show();
		} else if (en.sourceTypeId == 1000202) {
			$("#adeal").show();
			$("#reProduct, #reModel, #rePrice").hide();
			$("#cpBrand, #cpProduct, #cpModel, #cpEvalPrice, #cpNewPrice").hide();
		} else {
			$("#adeal").hide();
			$("#abase, #aused, #aphoto").removeClass("ui-navbar-item-c").addClass("ui-navbar-item-b");
		}
		
		$("#salePrice").html(!!en.salePrice ? en.salePrice / 10000 : 0);
		$("#custExpPrice").html(!!en.custExpPrice ? en.custExpPrice / 10000 : 0);
		$("#reMachinePrice").html(!!en.reMachinePrice ? en.reMachinePrice / 10000 : 0);
		$("#compPrice").html(!!en.compPrice ? en.compPrice / 10000 : 0);
		$("#compNewPrice").html(!!en.compNewPrice ? en.compNewPrice / 10000 : 0);
		$("#WCustExpPrice, #RProductName, #RModelName, #WReMachinePrice, #CBrandName, #CProductName, #CModelName, #WCompPrice, #WCompNewPrice").hide();
		buildPhotosDraft(en.evalTemplateId);
		hidePageLoading();
	}, '*', '_id=' + getStore("CURR_APPLY_ID"));
}

function buildPhotosDraft(tid) {
	ap.dbFindAll("Phone_Eval_Template_Photo", function(result) {
		var html = '';
		for (var p = 0; p < result.rows.length; p++) {
			var part = result.rows.item(p);
			var tp = '<li class="ui-li-photo">';
			tp += '<a href="../../img/' + getPartImg(part.photoPartId) + '">';
			tp += '<img id="' + part.photoPartId + '" src="../../img/' + getPartImg(part.photoPartId) + '" class="small-pic" alt="' + part.photoPartName + '"/></a>';
			tp += '<p class="pic-desc-name">' + part.photoPartName + '</p></li>';
			html += tp;
		}
		$("#photoinfo").empty().append('<ul style="display:block;">' + html + '</ul>');
		
		ap.dbFindAll("Phone_Du_Eval_Photo", function(data) {
			var other = '';
			for (var i = 0; i < data.rows.length; i++) {
				var item = data.rows.item(i);
				console.log("//" + JSON.stringify(item));
				if (item.partId > 0) {
					$("#" + item.partId).attr("src", item.photoPath);
					$("#" + item.partId).parent('a').attr("href", item.photoPath);
				} else {
					other += '<li class="ui-li-photo">';
					other += '<a href="' + item.photoPath + '">';
					other += '<img src="' + item.photoPath + '" class="small-pic" ';
					var remark = item.remark;
					if (remark) {
						var p = remark.indexOf("\n");
						if (p != -1) {
							remark = remark.substring(0, p);
						}
					}
					other += 'alt="' + remark + '" /></a>';
					other += '<p class="pic-desc-name">' + remark + '</p></li>';
				}
			}
			if (other)
				$("#photoinfo ul").append($(other));
			$("#photoinfo ul").append($("<div style='float:none;clear:both;height:0;'>&nbsp;</div>"));
			refreshScroll("#content", true, true);
			Code.photoSwipe('a', '#photoinfo');
		}, "*", "billId=" + getStore("CURR_APPLY_ID") + " and billType='APP'");
	}, "*", "evalTemplateId=" + tid);
}
/***********  DETAIL END  ***********/