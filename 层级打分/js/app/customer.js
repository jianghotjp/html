document.addEventListener('deviceready', onDeviceReady, false);
		
function onDeviceReady() {
	document.addEventListener('backbutton', back, false);
}

/***********  LIST START  ***********/
var listInit = 1, draftInit = 1, searchInit = 1, keyword;

//获取草稿数据
function getCustomerListDraft() {
	showPageLoading();
	ap.dbFindAll("Phone_Co_Cust", buildDraftData, '*', "createUserId=" + getStore("USERID"));
}

//从服务器端获取数据
function getCustomerList() {
	showPageLoading();
	$("#loadmore").html("正在加载...");
	var param = { "page" : page, "rows" : rows, "sort" : "create_date", "order" : "desc" };
	getDataFromServer("customer/customerListJson.action", param, function(data) {
		buildPageData(data, false);
	});
}

//点击获取更多
function pullUpAction() {
	page += 1;
	$("#loadmore").html("正在加载...");
	if (!!$("#keyword").val()) {
		setTimeout(search, 200);
	} else {
		setTimeout(getCustomerList, 200);
	}
}

// 关键字查询
function search() {
	showPageLoading();
	var param = { "page" : page, "rows" : rows, "sort" : "create_date", "order" : "desc" };
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
		getDataFromServer("customer/customerListJson.action", param, function(data) {
			buildPageData(data, searchInit == 1);
			searchInit = 0;
		});
	} else {// 重置
		page = 1;
		searchInit = 1;
		param["page"] = page;
		getDataFromServer("customer/customerListJson.action", param, function(data) {
			buildPageData(data, true);
		});
	}
}

function buildPageData(json, isClear) {
	json = eval("(" + json + ")");
	var html = '';
	var len = json.rows.length;
	if(len == 0 && listInit == 1) {
		html += '<li class="ui-li">';
		html += '<div class="ui-li-wrapper-a ui-txt-inner">';
		html += '<span class="ui-li-txt">没有查询到相应数据</span></div></li>';
		$("#loadmore").html("共查询0条数据");
		$("#customer_list").empty().append(html);
	} else {
		for (var i = 0; i < len; i++) {
			var customer = json.rows[i];
			html += '<li class="ui-li" onclick="jumpToDetailPage(' + customer.cust_id + ', 1);">';
			html += '<div class="ui-li-wrapper-b">';
			html += '<span class="ui-li-txt ui-txt-inner">' + customer.cust_name + '</span><br />';
			html += '<span class="ui-li-txt-desc ui-txt-inner">' + customer.hand_phone + ', ' + customer.full_area_name + '</span></div></li>';
		}
		var loadmorestr = '共查询到';
		if (isClear) {
			loadmorestr += len + "条数据，点击加载更多...";
			$("#customer_list").empty().append(html);
		} else {
			loadmorestr += (len + $("#customer_list").children().length) + "条数据，点击加载更多...";
			$("#customer_list").append(html);
		}
		$("#loadmore").html(loadmorestr);
	}
	listInit = 0;
	initTabs("#content", "list", 0);
	refreshScroll("#apply_wrapper", true, false);
	hidePageLoading();
}

function buildDraftData(data){
	var html = '';
	var list = data.rows;
	var len = list.length;
	if(len == 0){
		html += '<li class="ui-li">';
		html += '<div class="ui-li-wrapper-a ui-txt-inner">';
		html += '<span class="ui-li-txt">没有查询到相应数据</span></div></li>';
		$("#draft_list").append(html);
	}else{
		for (var i = 0; i < len; i++) {
			var customer = list.item(i);
			html += '<li class="ui-li" onclick="jumpToDetailPage(' + customer._id + ', 0);">';
			html += '<div class="ui-li-wrapper-b">';
			html += '<span class="ui-li-txt ui-txt-inner">' + customer.custName + '</span><br />';
			html += '<span class="ui-li-txt-desc ui-txt-inner">' + customer.handPhone + ', ' + customer.fullAreaName + '</span></div></li>';
		}
		$("#draft_list").append(html);
	}
	draftInit = 0;
	refreshScroll("#draft_wrapper", true, false);
	hidePageLoading();
}

function jumpToDetailPage(keyId, mode) {
	insertStore("CURR_IN_MODE", mode);
	insertStore("CURR_CUST_ID", keyId);
	window.location.href = 'customerdetail.html';
}

// 初始化list tab页
function initListTab(tabId, num) {
	if (listInit == 1) {
		setTimeout(getCustomerList, 200);
		listInit = 0;
	}
	initTabs("#content", tabId, num);
}

// 初始化draft tab页
function initDraftTab(tabId, num) {
	if (draftInit == 1) {
		setTimeout(getCustomerListDraft, 200);
		draftInit = 0;
	}
	initTabs("#content", tabId, num);
}
/***********  LIST END  ***********/

/***********  DETAIL START  ***********/
function getCustomerDetail() {
	showPageLoading();
	var custId = getStore("CURR_CUST_ID");
	getDataFromServer("customer/customerDetailJson.action", { "keyId" :  custId }, function(json) {
		json = eval("(" + json + ")");
		// 非MI销售人员不允许新建MI客户的联系人和保有设备
		console.log("MI销售人员 : " + (getStore("USERMISALES") == 1 ? "是" : "否"));
		console.log("MI客户 ： " + (json.en.miCustCd == null || json.en.miCustCd == "" ? "否" : "是"));
		getStore("USERMISALES") != 1 && json.en.miCustCd != null && json.en.miCustCd != "" ? $("#addContact, #addMachine").parent().hide() : $("#addContact, #addMachine").parent().show();
		buildDetailPage(json);
		hidePageLoading();
	});
}

// 查询客户草稿，包括联系人和保有设备
function getCustomerDetailDraft() {
	showPageLoading();
	var custId = getStore("CURR_CUST_ID");
	ap.dbFindAll("Phone_Co_Cust", function(custdata) {
		var data = {};
		data.en = custdata.rows.item(0);
		ap.dbFindAll("Phone_Co_Cust_Contact", function(contactdata) {
			var contactList = [];
			for (var c = 0; c < contactdata.rows.length; c++) {
				contactList.push(contactdata.rows.item(c));
			}
			data.relations = contactList;
			ap.dbFindAll("Phone_Co_Cust_Mach", function(machdata) {
				var machList = [];
				for (var m = 0; m < machdata.rows.length; m++) {
					machList.push(machdata.rows.item(m));
				}
				data.machines = machList;
				buildDetailPage(data);
				hidePageLoading();
			}, "*", "custId=" + data.en._id);
		}, "*", "custId=" + data.en._id);
	}, "*", "_id=" + custId);
}

var contactList, contactDraftList, machineList, machineDraftList;
function buildDetailPage(data) {
	stuffDetailDatas(data.en);
	$("#industryDesc").html(data.en.industryTypeDesc);
	contactList = data.relations;
	machineList = data.machines;
	loadContacts();
	loadMachines();
}

//加载联系人信息
function loadContacts() {
	if (getStore("CURR_IN_MODE") == 0) {
		var len = contactList.length;
		var html = '';
		if (len == 0) {
			html += '<li class="ui-li">';
			html += '<div class="ui-li-wrapper-a ui-txt-inner">';
			html += '<span class="ui-li-txt">没有查询到相应数据</span></div></li>';
		}
		if (len > 0) {
			for (var i = 0; i < len; i++) {
				var contact = contactList[i];
				html += '<li class="ui-li" onclick="openContactDetailPop(' + i + ', 1);">';
				html += '<div class="ui-li-wrapper-b">';
				html += '<span class="ui-li-txt ui-txt-inner">' + contact.contactName + (!!contact.bussinessName ? '(' + contact.bussinessName + ')' : '') + '</span><br />';
				html += '<span class="ui-li-txt-desc ui-txt-inner">' + contact.handPhone + (contact.address == null || contact.address == '' ? '' : ', ' + contact.address) + '</span>';
				html += '</div></li>';
			}
		}
		$("#cust_contact_list").append(html);
	} else {
		ap.dbFindAll("Phone_Co_Cust_Contact", function(result) {
			var len = contactList.length;
			var html = '';
			if (len == 0 && !result.rows && (!!result.rows && result.rows.length == 0)) {
				html += '<li class="ui-li">';
				html += '<div class="ui-li-wrapper-a ui-txt-inner">';
				html += '<span class="ui-li-txt">没有查询到相应数据</span></div></li>';
			}
			if (len > 0) {
				for (var i = 0; i < len; i++) {
					var contact = contactList[i];
					html += '<li class="ui-li" onclick="openContactDetailPop(' + i + ', 1);">';
					html += '<div class="ui-li-wrapper-b">';
					html += '<span class="ui-li-txt ui-txt-inner">' + contact.contactName + (!!contact.bussinessName ? '(' + contact.bussinessName + ')' : '') + '</span><br />';
					html += '<span class="ui-li-txt-desc ui-txt-inner">' + contact.handPhone + (contact.address == null || contact.address == '' ? '' : ', ' + contact.address) + '</span>';
					html += '</div></li>';
				}
			}
			if (!!result.rows && result.rows.length > 0) {
				contactDraftList = result.rows;
				for (var j = 0; j < result.rows.length; j++) {
					var contact = result.rows.item(j);
					html += '<li class="ui-li" onclick="openContactDetailPop(' + j + ', 2);">';
					html += '<div class="ui-li-wrapper-b">';
					html += '<span class="ui-li-txt ui-txt-inner">' + contact.contactName + (!!contact.bussinessName ? '(' + contact.bussinessName + ')' : '') + '</span><br />';
					html += '<span class="ui-li-txt-desc ui-txt-inner">' + contact.handPhone + (contact.address == null || contact.address == '' ? '' : ', ' + contact.address) + '</span>';
					html += '<span class="ui-li-count ui-corner-all">草稿</span>';
					html += '</div></li>';
				}
			}
			$("#cust_contact_list").append(html);
		}, "*", "custId=" + getStore("CURR_CUST_ID") + " or _id=" + getStore("CURR_CUST_ID"));
	}
}

function openContactDetailPop(index, type) {
	var contact = !!type && type == 1 ? contactList[index] : contactDraftList.item(index);
	!!contact._id ? $("#edit_contact_link").show() : $("#edit_contact_link").hide();
	
	contact.birthday = !!contact.birthday ? contact.birthday.substring(0, 10) : contact.birthday;
	stuffDetailDatas(contact);
	$('#contactHandPhone').html(contact.handPhone || '------');
	if (!!contact.identityCard) {
		var index = contact.identityCard.length / 2;
		$('#identityCard').html(contact.identityCard.substring(0, index) + ' ' + contact.identityCard.substring(index));
	}
	window.contactId = (!!contact.custContactId ? contact.custContactId : contact._id);
	
	openDetailPopup("#contactDetail");
	refreshScroll("#content", true);
}

//加载保有设备信息
function loadMachines() {
	if (getStore("CURR_IN_MODE") == 0) {
		var len = machineList.length;
		var html = '';
		if (len == 0) {
			html += '<li class="ui-li">';
			html += '<div class="ui-li-wrapper-a ui-txt-inner">';
			html += '<span class="ui-li-txt">没有查询到相应数据</span></div></li>';
		}
		if (len > 0) {
			for (var i = 0; i < len; i++) {
				var machine = machineList[i];
				html += '<li class="ui-li" onclick="openMachineDetailPop(' + i + ', 1);">';
				html += '<div class="ui-li-wrapper-b">';
				html += '<span class="ui-li-txt ui-txt-inner">' + machine.modelName + (!!machine.serialNo ? ', ' + machine.serialNo : '') + '</span><br />';
				html += '<span class="ui-li-txt-desc ui-txt-inner">' + machine.brandName + ', ' + machine.productName + (!!machine.purDate ? ', ' + machine.purDate.substring(0, 10) : '') + '</span>';
				html += '</div></li>';
			}
		}
		$("#cust_machine_list").append(html);
	} else {
		ap.dbFindAll("Phone_Co_Cust_Mach", function(result) {
			var len = machineList.length;
			var html = '';
			if (len == 0 && !result.rows && (!!result.rows && result.rows.length == 0)) {
				html += '<li class="ui-li">';
				html += '<div class="ui-li-wrapper-a ui-txt-inner">';
				html += '<span class="ui-li-txt">没有查询到相应数据</span></div></li>';
			}
			if (len > 0) {
				for (var i = 0; i < len; i++) {
					var machine = machineList[i];
					html += '<li class="ui-li" onclick="openMachineDetailPop(' + i + ', 1);">';
					html += '<div class="ui-li-wrapper-b">';
					html += '<span class="ui-li-txt ui-txt-inner">' + machine.modelName + (!!machine.serialNo ? ', ' + machine.serialNo : '') + '</span><br />';
					html += '<span class="ui-li-txt-desc ui-txt-inner">' + machine.brandName + ', ' + machine.productName + (!!machine.purDate ? ', ' + machine.purDate.substring(0, 10) : '') + '</span>';
					html += '</div></li>';
				}
			}
			if (!!result.rows && result.rows.length > 0) {
				machineDraftList = result.rows;
				for (var j = 0; j < result.rows.length; j++) {
					var mach = result.rows.item(j);
					html += '<li class="ui-li" onclick="openMachineDetailPop(' + j + ', 2);">';
					html += '<div class="ui-li-wrapper-b">';
					html += '<span class="ui-li-txt ui-txt-inner">' + mach.modelName + (!!mach.serialNo ? ', ' + mach.serialNo : '') + '</span><br />';
					html += '<span class="ui-li-txt-desc ui-txt-inner">' + mach.brandName + ', ' + mach.productName + (!!mach.purDate ? ', ' + mach.purDate.substring(0, 10) : '') + '</span>';
					html += '<span class="ui-li-count ui-corner-all">草稿</span>';
					html += '</div></li>';
				}
			}
			$("#cust_machine_list").append(html);
		}, "*", "custId=" + getStore("CURR_CUST_ID") + " or _id=" + getStore("CURR_CUST_ID"));
	}
	
}

function openMachineDetailPop(index, type) {
	var mach = !!type && type == 1 ? machineList[index] : machineDraftList.item(index);
	!!mach._id ? $("#edit_mach_link").show() : $("#edit_mach_link").hide();
	
	stuffDetailDatas(mach);
	$('#modelName').html(mach.modelName || mach.modelNo);
	$('#machIndustryDesc').html(mach.industryDesc || mach.industryTypeDesc || '');
	window.machId = (!!mach.custMachId ? mach.custMachId : mach._id);
	
	openDetailPopup("#machineDetail");
	refreshScroll("#content", true);
}

function openDetailPopup(id) {
	var shadow = id + 'Shadow';
	var pop = id + 'Pop';
	$(shadow + ', ' + pop).removeClass('ui-hidden');
	var leftOffset = ($(window).width() - $(pop).width()) / 2;
	var topOffset = ($(window).height() - $(pop).height()) / 2;
	$(pop).offset({ left: leftOffset, top: topOffset });
	
	document.removeEventListener('backbutton', back, false);
	document.addEventListener('backbutton', dismissPop, false);
}

//取消弹出层
function dismissPop() {
	$(".ui-popup-shadow, .ui-popup").addClass('ui-hidden');
	document.removeEventListener('backbutton', dismissPop, false);
	document.addEventListener('backbutton', back, false);
}
/***********  DETAIL END  ***********/

/***********  CUSTOMER ADD START  ***********/
function loadEditData() {
	showPageLoading();
	if (getStore("CURR_CUST_ID")) {
		$("#header_title").html("编辑客户");
		ap.dbFindAll("Phone_Co_Cust", function(result) {
			var item = result.rows.item(0);
			stuffFormDatas(item);
			$("#industryType").val(item.industryType);
			$("#industryTypeDesc").val(item.industryTypeDesc);
			$("#industryType-list-selected").html(item.industryTypeDesc);
			$("#buyerTypeId").val(item.buyerTypeId);
			$("#buyerTypeDesc").val(item.buyerTypeDesc);
			$("#buyerType-list-selected").html(item.buyerTypeDesc);
			hidePageLoading();
		}, "*", "_id=" + getStore("CURR_CUST_ID"));
	} else {
		$("#header_title").html("新建客户");
	}
}

function loadCustCode() {
	showPageLoading();
	// 行业类型
	ap.dbFindAll('Phone_Comm_Code_Detail', function(data) {
		var html = '';
		for (var i = 0; i < data.rows.length; i++) {
			var item = data.rows.item(i);
			html += '<p class="ui-select-option" onclick="optionSelected(\'industryType\', ' + i + ', ' + item.codeId + ');">' + item.codeName + "</p>";
		}
		html += '<p class="ui-select-option" onclick="optionSelected(\'industryType\', ' + (data.rows.length + 1) + ', 0);">取消</p>';
		html = "<div>" + html + "</div>";
		$('#industryType-list').empty().append(html);
		hidePageLoading();
	}, "codeId, codeName", "isUse=1 and typeNo='A100'");
	// 客户性质
	ap.dbFindAll('Phone_Comm_Code_Detail', function(data) {
		var html = '';
		for(var i = 0; i < data.rows.length; i++) {
			var item = data.rows.item(i);
			html += '<p class="ui-select-option" onclick="optionSelected(\'buyerType\', ' + i + ', ' + item.codeId + ');">' + item.codeName + "</p>";
		}
		html += '<p class="ui-select-option" onclick="optionSelected(\'buyerType\', ' + (data.rows.length + 1) + ', 0);">取消</p>';
		html = "<div>" + html + "</div>";
		$('#buyerType-list').empty().append(html);
		hidePageLoading();
	}, "codeId, codeName", "isUse=1 and typeNo='CD010007'");
}

//校验手机号码是否可用
function validateHandPhone() {
	var custId = $('#custId').val();
	var handPhone = $('#handPhone').val();
	if (!handPhone) {
		alertMsg('请输入有效的手机号码');
		return;
	}
	if (!!handPhone && (handPhone.indexOf('1') != 0 || handPhone.length != 11)) {
		alertMsg("手机号码输入错误（1开头，11位数字）");
		return;
	}
	if (loginMode()) {
		showPageLoading();
		getDataFromServer('customer/validateHandPhone4P.action', {"en.custId" : custId, "en.handPhone" : handPhone}, function(data) {
			var jsonData = eval('('+data+')');
			if(!!jsonData.actionErrors && jsonData.actionErrors.length > 0){//
				toast(jsonData.actionErrors.join('\n'),15000);
			}else{
				toast('此号码可用', 5000);
			}
			hidePageLoading();
		});
	}
}

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
	if (validateCust()) {
		showPageLoading();
		var obj = form2Obj();
		var relationList = [], machineList = [];
		
		ap.dbFindAll("Phone_Co_Cust_Mach", function(machines) {
			
			for (var m = 0; m < machines.rows.length; m++) {
				var item = machines.rows.item(m);
				var machine = {};
				machine['custId'] = 0;
				machine['custMachId'] = 0;
				machine['brandId'] = item.brandId;
				machine['productId'] = item.productId;
				machine['modelId'] = item.modelId;
				machine['serialNo'] = item.serialNo;
				machine['purQty'] = item.purQty;
				machine['isSecondhand'] = item.isSecondhand == 1 ? true : false;
				machine['purDate'] = item.purDate || null;
				machine['purAmount'] = item.purAmount * 10000;
				machine['isSold'] = item.isSold == 1 ? true : false;
				machine['industryType'] = item.industryType;
				machineList.push(machine);
			}
			
			console.log("machine list length = " + machineList.length);
			
			ap.dbFindAll("Phone_Co_Cust_Contact", function(contacts) {
				
				for (var c = 0; c < contacts.rows.length; c++) {
					var cc = contacts.rows.item(c);
					var relation = {};
					relation['custId'] = 0;
					relation['custContactId'] = 0;
					relation['handPhone'] = cc.handPhone;
					relation['contactName'] = cc.contactName;
					relation['bussiness'] = cc.bussiness;
					relation['isMainContactor'] = cc.isMainContactor == 1 ? true : false;
					relation['sex'] = cc.sex == 1 ? true : false;
					relation['identityCard'] = cc.identityCard;
					relation['postCode'] = cc.postCode;
					relation['birthday'] = cc.birthday||null;
					relation['postAddress'] = cc.postAddress;
					relationList.push(relation);
				}
				
				console.log("relation list length = " + relationList.length);
				
				obj.machList = JSON.stringify(machineList);
				obj.relaList = JSON.stringify(relationList);
				
				console.log(JSON.stringify(obj));
				
				blockedPostData('customer/customerSubmit.action', obj, function(json) {
					// 删除数据
					ap.dbDelete("Phone_Co_Cust_Mach", { "custId" : getStore("CURR_CUST_ID") }, function(r1) {
						ap.dbDelete("Phone_Co_Cust_Contact", { "custId" : getStore("CURR_CUST_ID") }, function(r2) {
							ap.dbDelete("Phone_Co_Cust", { "_id" : getStore("CURR_CUST_ID") }, function(r3) {
								toast("保存成功", 3000);
								hidePageLoading();
								backFromSave();
							});
						});
					});
				}, null, null, true);
			}, "*", "custId=" + getStore("CURR_CUST_ID"));
			
		}, "*", "custId=" + getStore("CURR_CUST_ID"));
		
		
		/*
		
		blockedPostData('customer/customerSubmit.action', obj, function(json) {
			ap.dbFindAll("Phone_Co_Cust_Mach", function(machs) {
				ap.dbFindAll("Phone_Co_Cust_Contact", function(contacts) {
					
					var tryCount = 10;
					var objCount = machs.rows.length + contacts.rows.length - 1;
					function tryDelete() {
						--objCount;
						console.log("******" + objCount + "/" + (machs.rows.length + contacts.rows.length - 1));
						if (objCount == 0) {
							// --objCount;
							ap.dbDelete("Phone_Co_Cust_Mach", { "custId" : getStore("CURR_CUST_ID") }, function(r1) {
								ap.dbDelete("Phone_Co_Cust_Contact", { "custId" : getStore("CURR_CUST_ID") }, function(r2) {
									ap.dbDelete("Phone_Co_Cust", { "_id" : getStore("CURR_CUST_ID") }, function(r3) {
										toast("保存成功", 3000);
										backFromSave();
									});
								});
							});
						}
					}
					
					function saveMachine(machine) {
						blockedPostData('customer/machineSubmit.action', machine, function(machJson) {
							tryDelete();
						}, function(msgs) {
							if (msgs) {
								toast("保存保有设备失败:\n" + msgs.join("\n"), 8000);
							}
						}, function() { if (--tryCount > 0) saveMachine(machine); }, true);
					}
					function saveContact(contact) {
						blockedPostData('customer/relationSubmit.action', contact, function(contactJson) {
							tryDelete();
						}, function(msgs) {
							if (msgs) {
								toast("保存联系人失败:\n" + msgs.join("\n"), 8000);
							}
						}, function() { if (--tryCount > 0) saveContact(contact); }, true);
					}
					
					for (var m = 0; m < machs.rows.length; m++) {
						var mach = machs.rows.item(m);
						var machine = getPrefixMachine(mach, json.en.custId);
						saveMachine(machine);
					}
					for (var c = 0; c < contacts.rows.length; c++) {
						var cont = contacts.rows.item(c);
						var contact = getPrefixContact(cont, json.en.custId);
						if (cont.isMainContactor != 1) {
							saveContact(contact);
						}
					}

				}, "*", "custId=" + getStore("CURR_CUST_ID"));
			}, "*", "custId=" + getStore("CURR_CUST_ID"));
		}, null, null, true);
		
		*/
		
		
	}
}

function getPrefixMachine(mach, custId) {
	var machine = {};
	machine['en.brandId'] = mach.brandId;
	machine['brandName'] = mach.brandName;
	machine['en.productId'] = mach.productId;
	machine['productName'] = mach.productName;
	machine['en.modelId'] = mach.modelId;
	machine['modelName'] = mach.modelName;
	machine['en.serialNo'] = mach.serialNo;
	machine['en.purQty'] = mach.purQty;
	machine['en.isSecondhand'] = mach.isSecondhand == 1 ? true : false;
	machine['en.purDate'] = mach.purDate;
	machine['en.purAmount'] = mach.purAmount;
	machine['en.isSold'] = mach.isSold == 1 ? true : false;
	machine['en.industryType'] = mach.industryType;
	machine['industryTypeDesc'] = mach.industryTypeDesc;
	machine['en.custId'] = custId;
	machine['en.custMachId'] = mach.custMachId;
	return machine;
}

function getPrefixContact(cont, custId) {
	var contact = {};
	contact["en.contactName"] = cont.contactName;
	contact["en.handPhone"] = cont.handPhone;
	contact["en.bussiness"] = cont.bussiness;
	contact["bussinessName"] = cont.bussinessName;
	contact["en.isMainContactor"] = cont.isMainContactor == 1 ? true : false;
	contact["en.sex"] = cont.sex == 1 ? true : false;
	contact["en.identityCard"] = cont.identityCard;
	contact["en.telNoBus"] = cont.telNoBus;
	contact["en.postCode"] = cont.postCode;
	contact["en.birthday"] = cont.birthday;
	contact["en.postAddress"] = cont.postAddress;
	contact["en.custId"] = custId;
	contact["en.custContactId"] = cont.custContactId;
	return contact;
}

function saveDraft() {
	if (validateCust()) {
		showPageLoading();
		var paramObj = translateDraft(getParameterDraft(), true);
		if (getStore("CURR_CUST_ID")) {
			ap.dbUpdate("Phone_Co_Cust", paramObj, { _id : getStore("CURR_CUST_ID") }, function(result) {
				ap.dbFindAll("Phone_Co_Cust_Contact", function(contacts) {
					var contact = contacts.rows.item(0);
					var param = translateDraft(getParameterDraft());
					var contactObj = {
						custId: contact.custId,
						handPhone: param.handPhone,
						contactName: param.custName
					};
					ap.dbUpdate("Phone_Co_Cust_Contact", contactObj, { _id : contact._id }, function(res) {
						toast("保存成功", 3000);
						hidePageLoading();
						backFromSave();
					});
				}, "*", "isMainContactor=1 and custId=" + getStore("CURR_CUST_ID"));
			});
		} else {
			ap.dbInsert("Phone_Co_Cust", paramObj, function(result) {
				var contactObj = {
					custId: result.insertId,
					handPhone: paramObj.handPhone,
					contactName: paramObj.custName,
					isMainContactor: 1,
					sex: 1
				};
				ap.dbInsert("Phone_Co_Cust_Contact", contactObj, function(result) {
					toast("保存成功", 3000);
					hidePageLoading();
					backFromSave();
				});
			});
		}
	}
}

function getParameterDraft() {
	var paramstr = '';
	for (var i = 0; i < $(":input").length; i++) {
		if ($(":input").eq(i).attr("id")) {
			var id = $(":input").eq(i).attr("id");
			if (id == 'province' || id == 'city' || id == 'town') 
				continue;
			paramstr += id + '=';
			paramstr += $(":input").eq(i).val() == null ? '' : $(":input").eq(i).val();
			if (i < $(":input").length - 4) {
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

function validateCust() {
	dismissSavePop();
	var msg = '';
	var flag = true;
	var list = [
	    { component : "#industryType", wrapper : "#industryType-validate", emptyMsg : "行业类型不能为空" },
	    { component : "#buyerTypeId", wrapper : "#buyerType-validate", emptyMsg : "客户性质不能为空" }
	];
	$(":required").each(function() {
		if (!$(this).val() || (!!$(this).val() && $(this).val() == 0)) {
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
		if (!$(this.component).val() || (!!$(this.component).val() && $(this.component).val() == 0)) {
			$(this.wrapper).addClass("ui-check-error");
			msg += this.emptyMsg + '\n';
			flag = false;
		}
	});
	if (!flag)
		alertMsg(msg);
	return flag;
}

function setSelectText(sel, ipt) {
	var text = getSelectText(sel);
	$(ipt).val(text);
}

function getSelectText(id) {
	var index = document.getElementById(id).selectedIndex;
	return document.getElementById(id).options[index].text;
}
/***********  CUSTOMER ADD END  ***********/

/***********  CONTACT ADD START  ***********/
function loadContactCode() {
	showPageLoading();
	ap.dbFindAll('Phone_Comm_Code_Detail', function(data) {
		var html = '';
		for (var i = 0; i < data.rows.length; i++) {
			var item = data.rows.item(i);
			html += '<p class="ui-select-option" onclick="optionSelected(\'bussiness\', ' + i + ', \'' + item.codeString + '\');">' + item.codeName + "</p>";
		}
		html += '<p class="ui-select-option" onclick="optionSelected(\'bussiness\', ' + (data.rows.length + 1) + ', 0);">取消</p>';
		html = "<div>" + html + "</div>";
		$('#bussiness-list').empty().append(html);
		hidePageLoading();
	}, "codeString, codeName", "isUse=1 and typeNo='CD0045'");
}

function loadContactEditData() {
	showPageLoading();
	if (!!getStore("CURR_CUST_CONTACT_ID")) {
		$("#header_title").html("编辑联系人");
		ap.dbFindAll("Phone_Co_Cust_Contact", function(result) {
			var item = result.rows.item(0);
			stuffFormDatas(item);
			
			// 加载下拉列表
			$("#sex").val(item.sex);
			$("#sex-list-selected").html(item.sex == 1 ? '男' : '女');
			
			if (item.bussiness > 0) {
				$("#bussiness").val(item.bussiness);
				$("#bussinessName").val(item.bussinessName);
				$("#bussiness-list-selected").html(item.bussinessName);
			}
			
			// 主联系人不允许编辑该项
			if (item.isMainContactor == 1) {
				$("#isMainContactor").attr("checked", "checked").attr("disabled", "disabled");
			} else {
				$("#isMainContactor").attr("checked", false);
			}
			hidePageLoading();
		}, "*", "_id=" + getStore("CURR_CUST_CONTACT_ID"));
	} else {
		$("#header_title").html("新建联系人");
	}
}

function validateContact() {
	dismissSavePop();
	var msg = '';
	var flag = true;
	var list = [
	    { component : "#sex", wrapper : "#sex-validate", emptyMsg : "请选择性别" }
	];
	$(":required").each(function() {
		if (!$(this).val() || (!!$(this).val() && $(this).val() < 0)) {
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
		if (!$(this.component).val()) {
			$(this.wrapper).addClass("ui-check-error");
			msg += this.emptyMsg + '\n';
			flag = false;
		}
	});
	if (!flag)
		alertMsg(msg);
	return flag;
}
/***********  CONTACT ADD END  ***********/

/***********  MACHINE ADD START  ***********/
function loadBrand() {
	showPageLoading();
	ap.dbFindAll("Phone_Comm_Brand", function(result) {
		var list = '<p class="ui-select-option">--- 请选择 ---</p>';
		for (var i = 0; i < result.rows.length; i++) {
			var item = result.rows.item(i);
			list += '<p class="ui-select-option" onclick="optionSelected(\'brand\', ' + (i + 1) + ', ' + item.brandId + ', loadProduct);clearChildren(\'product\',\'model\')">' + item.brandName + '</p>';
		}
		list += '<p class="ui-select-option" onclick="optionSelected(\'brand\', -1, 0)">取消</p>';
		list = "<div>" + list + "</div>";
		$("#brand-list").empty().append(list);
		//applyScroll("#brand-list");
		hidePageLoading();
	}, "brandId, brandName", "isUse=1");
}

function clearChildren() {
	for (var i = 0; i < arguments.length; ++i) {
		var a = arguments[i];
		var showLnk = $("#" + a + "-show-link");
		if (i > 0)
			showLnk.addClass("ui-input-disabled");
		var textSel = $("#" + a + "-list-selected").html("--- 请选择 ---");
		var nm = $("#" + a + "Name").val("");
		var id = $("#" + a + "Id").val("");
	}
}

function loadProduct(callback) {
	if ($("#product-show-link").hasClass("ui-input-disabled")) {
		$("#product-show-link").removeClass("ui-input-disabled");
		$("#product-show-link").attr("onclick", "openSelectList('product')");
	}
	var brandId = $("#brandId").val();
	ap.dbFindAll("Phone_Comm_Product", function(result) {
		var list = '<p class="ui-select-option">--- 请选择 ---</p>';
		for (var i = 0; i < result.rows.length; i++) {
			var item = result.rows.item(i);
			list += '<p class="ui-select-option" onclick="optionSelected(\'product\', ' + (i + 1) + ', ' + item.productId + ', loadModel);clearChildren(\'model\')">' + item.productName + '</p>'
		}
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
	if ($("#model-show-link").hasClass("ui-input-disabled")) {
		$("#model-show-link").removeClass("ui-input-disabled");
		$("#model-show-link").attr("onclick", "openSelectList('model')");
	}
	var productId = $("#productId").val();
	ap.dbFindAll("Phone_Comm_Model", function(result) {
		var list = '<p class="ui-select-option">--- 请选择 ---</p>';
		for (var i = 0; i < result.rows.length; i++) {
			var item = result.rows.item(i);
			list += '<p class="ui-select-option" onclick="optionSelected(\'model\', ' + (i + 1) + ', ' + item.modelId + ');">' + item.modelName + '</p>';
		}
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

function loadMachineCode() {
	showPageLoading();
	ap.dbFindAll('Phone_Comm_Code_Detail', function(data) {
		var html = '';
		for (var i = 0; i < data.rows.length; i++) {
			var item = data.rows.item(i);
			html += '<p class="ui-select-option" onclick="optionSelected(\'industryType\', ' + i + ', \'' + item.codeString + '\');">' + item.codeName + "</p>";
		}
		html += '<p class="ui-select-option" onclick="optionSelected(\'industryType\', ' + (data.rows.length + 1) + ', 0);">取消</p>';
		html = "<div>" + html + "</div>";
		$('#industryType-list').empty().append(html);
		hidePageLoading();
	}, "codeString, codeName", "isUse=1 and typeNo='A100'");
}

function loadMachineEditData() {
	showPageLoading();
	if (getStore("CURR_CUST_MACHINE_ID")) {
		$("#header_title").html("编辑保有设备");
		ap.dbFindAll("Phone_Co_Cust_Mach", function(result) {
			var item = result.rows.item(0);
			stuffFormDatas(item);
			if (!!item.brandId) {
				$("#brand-list-selected").html(item.brandName);
				loadProduct();
			}
			if (!!item.productId) {
				$("#product-list-selected").html(item.productName);
				loadModel();
			}
			if (!!item.modelId)	{
				$("#model-list-selected").html(item.modelName);
			}
			if (!!item.industryType) {
				$("#industryType-list-selected").html(item.industryTypeDesc);
			}
			item.isSecondhand == 1 ? $("#isSecondhand").attr("checked", "checked") : $("#isSecondhand").attr("checked", false);
			item.isSold == 1 ? $("#isSold").attr("checked", "checked") : $("#isSold").attr("checked", false);
			
			hidePageLoading();
		}, "*", "_id=" + getStore("CURR_CUST_MACHINE_ID"));
	} else {
		$("#header_title").html("新建保有设备");
	}
}

function validateMachine() {
	dismissSavePop();
	var msg = '';
	var flag = true;
	var list = [
		{ component : "#brandName", wrapper : "#brand-validate", emptyMsg : "品牌不能为空" },
		{ component : "#productName", wrapper : "#product-validate", emptyMsg : "产品不能为空" },
		{ component : "#modelName", wrapper : "#model-validate", emptyMsg : "机型不能为空" }
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
		if (!$(this.component).val()) {
			$(this.wrapper).addClass("ui-check-error");
			msg += this.emptyMsg + '\n';
			flag = false;
		}
	});
	if (!flag)
		alertMsg(msg);
	return flag;
}
/***********  MACHINE ADD END  ***********/