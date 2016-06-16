document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
	document.addEventListener('backbutton', back, false);
}

/***********  LIST START  ***********/
var init = 1, searchInit = 1, keyword;
function getUsedMachineList() {
	showPageLoading();
	$("#loadmore").html("正在加载...");
	var param = { "page" : page, "rows" : rows, "sort" : "rec_id", "order" : "asc" };
	getDataFromServer("used/stock/machSalableStockListJson.action", param, function(data) {
		buildPageData(data, false);
	});
}

function pullUpAction() {
	page += 1;
	$("#loadmore").html("正在加载...");
	if (!!$("#keyword").val()) {
		setTimeout(search, 200);
	} else {
		setTimeout(getUsedMachineList, 200);
	}
}

function search() {
	showPageLoading();
	var param = { "page" : page, "rows" : rows, "sort" : "rec_id", "order" : "desc" };
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
		getDataFromServer("used/stock/machSalableStockListJson.action", param, function(data) {
			buildPageData(data, searchInit == 1);
			searchInit = 0;
		});
	} else {// 重置
		page = 1;
		searchInit = 1;
		param["page"] = page;
		getDataFromServer("used/stock/machSalableStockListJson.action", param, function(data) {
			buildPageData(data, true);
		});
	}
}

function buildPageData(data, isClear) {
	data = eval("(" + data + ")");
	var html = '';
	var len = data.rows.length;
	if (len == 0 && init == 1) {
		html += '<li class="ui-li">';
		html += '<div class="ui-li-wrapper-a ui-txt-inner">';
		html += '<span class="ui-li-txt">没有查询到相应数据</span></div></li>';
		$("#loadmore").html("共查询到0条数据");
		$("#usedmachine_list").empty().append(html);
	} else {
		for (var i = 0; i < len; i++) {
			var machine = data.rows[i];
			html += '<li class="ui-li" onclick="jumpToDetailPage(' + machine.rec_id + ');">';
			html += '<div class="ui-li-wrapper-b">';
			html += '<span class="ui-li-txt ui-txt-inner">' + machine.model_name + (machine.serial_no ? ', ' + machine.serial_no : '') + '</span><br />';
			html += '<span class="ui-li-txt-desc ui-txt-inner">' + machine.brand_name + ', ' + machine.product_name + ', ' + machine.stock_status_name;
			html += '</span></div></li>';
		}
		var loadmorestr = '共查询到';
		if (isClear) {
			loadmorestr += len + "条数据，点击加载更多...";
			$("#usedmachine_list").empty().append(html);
		} else {
			loadmorestr += (len + $("#usedmachine_list").children().length) + "条数据，点击加载更多...";
			$("#usedmachine_list").append(html);
		}
		$("#loadmore").html(loadmorestr);
	}
	init = 0;
	refreshScroll("#apply_wrapper", true, false);
	hidePageLoading();
}

function jumpToDetailPage(mid) {
	insertStore("CURR_USEDMACHINE_ID", mid);
	window.location.href = 'usedmachinedetail.html';
}
/***********  LIST END  ***********/

/***********  DETAIL START  ***********/
function getUsedMachineDetail() {
	showPageLoading();
	getDataFromServer("used/stock/machSalableStockDetailJson.action", { keyId : getStore("CURR_USEDMACHINE_ID") }, function(json) {
		json = eval("(" + json + ")");
		stuffDetailDatas(json.data.record);
		var en = { reptPhotoAttachments : [], exPhotos : [] };
		var photos = json.data.photos, exPhotos = json.data.exPhotos;
		if (photos && photos.length) {
			$(photos).each(function() {
				en.reptPhotoAttachments.push(this);
			});
		}
		if (exPhotos && exPhotos.length) {
			$(exPhotos).each(function() {
				en.exPhotos.push(this);
			});
		}
		buildPhotos(en);
		hidePageLoading();
	});
}

function buildPhotos(en) {
	var ul = '<ul style="display:block;">';
	if (!!en.reptPhotoAttachments && en.reptPhotoAttachments.length > 0) {// 部位
		for (var p = 0; p < en.reptPhotoAttachments.length; p++) {
			var part = en.reptPhotoAttachments[p];
			ul += '<li class="ui-li-photo">';
			ul += '<a href="' + SERVERURL + "upload/" + part.pathName + part.fileName + '">';
			ul += '<img src="' + SERVERURL + "upload/" + part.pathName + part.fileName + '" class="small-pic" alt="' + part.partCodeName + '"></a>';
			ul += '<p class="pic-desc-name">' + part.partCodeName + '</p></li>';
		}
	}
	if (!!en.exPhotos && en.exPhotos.length > 0) {// 增加
		for (var a = 0; a < en.exPhotos.length; a++) {
			var attach = en.exPhotos[a];
			ul += '<li class="ui-li-photo">';
			ul += '<a href="' + SERVERURL + "upload/" + attach.pathName + attach.fileName + '">';
			ul += '<img src="' + SERVERURL + "upload/" + attach.pathName + attach.fileName + '" class="small-pic" alt="' + attach.remark + '"></a>';
			ul += '<p class="pic-desc-name">' + attach.remark + '</p></li>';
		}
	}
	ul += "<div style='float:none;clear:both;height:0;'>&nbsp;</div></ul>";
	$("#photoinfo").empty().append(ul);
	Code.photoSwipe('a', '#photoinfo');
}
/***********  DETAIL END  ***********/