document.addEventListener('deviceready', onDeviceReady, false);
	
function onDeviceReady() {
	document.addEventListener('backbutton', back, false);
}

/***********  LIST START  ***********/
var listInit = 1, draftInit = 1, searchInit = 1, keyword;
function getUsedMachineList() {
	showPageLoading();
	$("#loadmore").html("正在加载...");
	var param = { "page" : page, "rows" : rows, "sort" : "mach_reg_id", "order" : "desc" };
	getDataFromServer("basedata/coMachRegListJson.action", param, function(data) {
		buildPageData(data, false);
	});
}

// 查询草稿数据
function getUsedMachineListDraft() {
	showPageLoading();
	ap.dbFindAll("Phone_Used_Mach_Reg", buildDraftData, '*', "createUserId=" + getStore("USERID"));
}

// 加载更多
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
	var param = { "page" : page, "rows" : rows, "sort" : "mach_reg_id", "order" : "desc" };
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
		getDataFromServer("basedata/coMachRegListJson.action", param, function(data) {
			buildPageData(data, searchInit == 1);
			searchInit = 0;
		});
	} else {// 重置
		page = 1;
		searchInit = 1;
		param["page"] = page;
		getDataFromServer("basedata/coMachRegListJson.action", param, function(data) {
			buildPageData(data, true);
		});
	}
}

// 获取服务器json数据后加载页面
function buildPageData(data, isClear) {
	data = eval("(" + data + ")");
	var html = '';
	var len = data.rows.length;
	if (len == 0 && listInit == 1) {
		html += '<li class="ui-li">';
		html += '<div class="ui-li-wrapper-a ui-txt-inner">';
		html += '<span class="ui-li-txt">没有查询到相应数据</span></div></li>';
		$("#loadmore").html("共查询到0条数据");
		$("#machineregist_list").empty().append(html);
	} else {
		for (var i = 0; i < len; i++) {
			var mach = data.rows[i];
			html += '<li class="ui-li" onclick="jumpToDetailPage(' + mach.mach_reg_id + ', 1);">';
			html += '<div class="ui-li-wrapper-b">';
			html += '<span class="ui-li-txt ui-txt-inner">' + mach.model_name + (!!mach.serial_no ? ',' + mach.serial_no : '') + '</span><br />';
			html += '<span class="ui-li-txt-desc ui-txt-inner">' + mach.brand_name + ', ' + mach.product_name + '</span></div></li>';
		}
		var loadmorestr = '共查询到';
		if (isClear) {
			loadmorestr += len + "条数据，点击加载更多...";
			$("#machineregist_list").empty().append(html);
		} else {
			loadmorestr += (len + $("#machineregist_list").children().length) + "条数据，点击加载更多...";
			$("#machineregist_list").append(html);
		}
		$("#loadmore").html(loadmorestr);
	}
	listInit = 0;
	initTabs("#content", "list", 0);
	refreshScroll("#apply_wrapper", true, false);
	hidePageLoading();
}

// 获取手机json数据后加载页面
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
			var mach = data.rows.item(i);
			html += '<li class="ui-li" onclick="jumpToDetailPage(' + mach._id + ', 0);">';
			html += '<div class="ui-li-wrapper-b">';
			html += '<span class="ui-li-txt ui-txt-inner">' + mach.brandName + ', ' + mach.productName + '</span><br />';
			html += '<span class="ui-li-txt-desc ui-txt-inner">' + mach.modelName;
			html += ((mach.serialNo == null || mach.serialNo == '') ? '' : ', ' + mach.serialNo) + '</span></div></li>';
		}
		$("#draft_list").append(html);
	}
	draftInit = 0;
	refreshScroll("#draft_wrapper", true, false);
	hidePageLoading();
}

// 初始化list tab页
// 后面切换tab页不再重新获取数据
function initListTab(tabId, num) {
	if (listInit == 1) {
		getUsedMachineList();
		listInit = 0;
	}
	initTabs("#content", tabId, num);
}

// 初始化draft tab页
// 后面切换tab页不再重新获取数据
function initDraftTab(tabId, num) {
	if (draftInit == 1) {
		getUsedMachineListDraft();
		draftInit = 0;
	}
	initTabs("#content", tabId, num);
}

// 跳转到详细页
function jumpToDetailPage(mid, type) {
	insertStore("CURR_IN_MODE", type);// 详细页进入方式：1表示列表，0表示草稿
	insertStore("CURR_MACH_REG_ID", mid);//当前主键ID
	window.location.href = 'machineregistdetail.html';
}
/***********  LIST END  ***********/

/***********  DETAIL START  ***********/
function getUsedMachineDetail() {
	showPageLoading();
	getDataFromServer("basedata/coMachRegJson.action", { "keyId" : getStore("CURR_MACH_REG_ID") }, function(json) {
		json = eval("(" + json + ")");
		buildPageDetail(json.data.coMachReg);
	});
}

function getUsedMachineDetailDraft() {
	showPageLoading();
	ap.dbFindAll("Phone_Used_Mach_Reg", function(result) {
		buildPageDetail(result.rows.item(0));
	}, "*", "_id=" + getStore("CURR_MACH_REG_ID"));
}

function buildPageDetail(mach) {
	stuffDetailDatas(mach);
	hidePageLoading();
}

function jumpToEditPage() {
	window.location.replace("machineregistadd.html");
}
/***********  DETAIL END  ***********/

/***********  ADD START  ***********/
function loadEditData() {
	showPageLoading();
	if (getStore("CURR_MACH_REG_ID")) {
		$("#header_title").html("编辑设备登记");
		ap.dbFindAll("Phone_Used_Mach_Reg", function(result) {
			var item = result.rows.item(0);
			stuffFormDatas(item);
			if (!!item.brandId) {
				$("#brand-list-selected").html(item.brandName);
				loadProduct();
			} else {
				manualInput('brand');
				$("#brandName").val(item.brandName);
				$("#productName").val(item.productName);
				$("#modelName").val(item.modelName);
			}
			if (!!item.productId) {
				$("#product-list-selected").html(item.productName);
				loadModel();
			} else {
				manualInput('product');
				$("#productName").val(item.productName);
				$("#modelName").val(item.modelName);
			}
			if (!!item.modelId)	{
				$("#model-list-selected").html(item.modelName);
			} else {
				manualInput('model');
				$("#modelName").val(item.modelName);
			}
			item.isEngineReman == 1 ? $("#isEngineReman").attr("checked", "checked") : $("#isEngineReman").attr("checked", false);
			hidePageLoading();
		}, "*", "_id=" + getStore("CURR_MACH_REG_ID"));
	} else {
		$("#header_title").html("新增设备登记");
	}
}

function loadBrand() {
	showPageLoading();
	ap.dbFindAll("Phone_Comm_Brand", function(result) {
		var list = '<p class="ui-select-option">--- 请选择 ---</p>';
		for (var i = 0; i < result.rows.length; i++) {
			var item = result.rows.item(i);
			list += '<p class="ui-select-option" onclick="optionSelected(\'brand\', ' + (i + 1) + ', ' + item.brandId + ', loadProduct);clearChildren(\'product\',\'model\')">' + item.brandName + '</p>';
		}
		list += '<p class="ui-select-option" onclick="manualInput(\'brand\');">手动输入</p>';
		list += '<p class="ui-select-option" onclick="optionSelected(\'brand\', -1, 0)">取消</p>';
		list = "<div>" + list + "</div>";
		$("#brand-list").empty().append(list);
		hidePageLoading();
	}, "brandId, brandName", "isUse=1");
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
	if ($("#product-validate").hasClass("ui-input-disabled")) {
		$("#product-validate").removeClass("ui-input-disabled");
		$("#product-validate").attr("onclick", "openSelectList('product')");
	}
	var brandId = $("#brandId").val();
	ap.dbFindAll("Phone_Comm_Product", function(result) {
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
		//applyScroll(container, true);
		//refreshScroll(container, true);

		if (callback)
			callback();
	}, "productId, productName", "isUse=1 and brandId=" + brandId);
}

function loadModel(callback) {
	if ($("#model-validate").hasClass("ui-input-disabled")) {
		$("#model-validate").removeClass("ui-input-disabled");
		$("#model-validate").attr("onclick", "openSelectList('model')");
	}
	var productId = $("#productId").val();
	ap.dbFindAll("Phone_Comm_Model", function(result) {
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
		//applyScroll(container, true);
		//refreshScroll(container, true);
		if (callback)
			callback();
	}, "modelId, modelName", "isUse=1 and productId=" + productId, [ 'modelName', 'asc' ]);
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


function prepareForm() {
	var brandId = $("#brandId").val(), brandName = $.trim($("#brandName").val());
	if (!brandId && brandName)
		$("#brandId").val(0);
	var productId = $("#productId").val(), productName = $.trim($("#productName").val());
	if (!productId && productName)
		$("#productId").val(0);
	var modelId = $("#modelId").val(), modelName = $.trim($("#modelName").val());
	if (!modelId && modelName)
		$("#modelId").val(0);
}

function submitServer() {
	prepareForm();
	if (validate()) {
		showPageLoading();
		checkboxHandler();
		var paramObj = translateJSON();
		blockedPostData('basedata/coMachRegSubmit.action', paramObj, function(json) {
			var success = function() {
				toast("保存成功", 5000);
				hidePageLoading();
				backFromSave();
			};
			
			if (getStore("CURR_MACH_REG_ID")) {
				ap.dbDelete("Phone_Used_Mach_Reg", { "_id" : getStore("CURR_MACH_REG_ID") }, success);
			} else {
				success();
			}
		}, function(data, errorMessages) {
			if (errorMessages && errorMessages.length)
				alert(errorMessages.join("\n"));
			else
				alert("保存失败");

			hidePageLoading();
		});
	}
}

function saveDraft() {
	checkboxHandler2();
	if (validate()) {
		showPageLoading();
		var paramObj = translateDraft();
		if (getStore("CURR_MACH_REG_ID")) {
			ap.dbUpdate("Phone_Used_Mach_Reg", paramObj, { _id : getStore("CURR_MACH_REG_ID") }, function(result) {
				toast("保存成功", 3000);
				hidePageLoading();
				backFromSave();
			});
		} else {
			ap.dbInsert("Phone_Used_Mach_Reg", paramObj, function(result) {
				toast("保存成功", 3000);
				hidePageLoading();
				backFromSave();
			});
		}
	}
}

function validate() {
	dismissSavePop();
	var msg = '';
	var flag = true;
	var list = [
	    { component : "#product", emptyMsg : "产品不能为空" },
	    { component : "#model", emptyMsg : "机型不能为空" }
	];
	$(":required").each(function() {
		if (!$(this).val()) {
			$(this).parents(".ui-body").addClass("ui-check-error");
			msg += $(this).attr("placeholder") + '\n';
			flag = false;
			$(this).on("change", function() {
				if (!!$(this).val()) {
					$(this).parents(".ui-body").removeClass("ui-check-error");
				}
			});
		}
	});
	$(list).each(function() {
		if (!$(this.component + "Name").val()) {
			$(this.component + "Name").parent().addClass("ui-check-error");
			$(this.component + "Id").parent().addClass("ui-check-error");
			msg += this.emptyMsg + '\n';
			flag = false;
		}
	});
	if (!flag)
		alertMsg(msg);
	return flag;
}

function getParameter() {
	var paramstr = '';
	for (var i = 0; i < $(":input").length; i++) {
		if (!!$(":input").eq(i).attr("id")) {
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

function translateJSON() {
	var arr = getParameter().split("&");
	var json = new Object();
	for (var i = 0; i < arr.length; i++) {
		var subarr = arr[i].split("=");
		if (subarr[0] == 'brandId' || subarr[0] == 'productId' || subarr[0] == 'modelId' || subarr[0] == 'serialNo') {
			json['mach.' + subarr[0]] = subarr[1];
		} else if (subarr[0] == 'brandName' || subarr[0] == 'productName' || subarr[0] == 'modelName') {
			json[subarr[0]] = subarr[1];
		} else {
			json['en.' + subarr[0]] = subarr[1];
		}
	}
	return json;
}

function translateDraft() {
	var arr = getParameter().split("&");
	var json = new Object();
	for (var i = 0; i < arr.length; i++) {
		var subarr = arr[i].split("=");
		json[subarr[0]] = subarr[1];
	}
	json['createUserId'] = getStore("USERID");
	json['createUserName'] = getStore("USERNAME");
	json['createDate'] = getCurrTime();
	return json;
}
/***********  ADD END  ***********/