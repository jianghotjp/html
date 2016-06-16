/**
 * 照片上传
 */		
function uploadFile(finishCallback) {
	var imgs = [], uploadCount = 0;
	$("#photoinfo img").each(function() {
		var imageURI = $(this).attr("src");
		// 没有attachment表示既非从申请带来，也不是刚刚上传到服务器的
		if (imageURI && imageURI.indexOf("part_") == -1 && 
				imageURI.indexOf("bg_icon_add") == -1) {
			if (!/^http[s]?:\/\/.*/.test(imageURI))
				imgs.push(this);
			else
				console.log("照片地址:" + imageURI + "，但是缺少attachment");
		}
	});
	if (!imgs.length)
		return finishCallback(_loadPhotos());
	
	var attachments = [], partIds = [], extAtts = [];
	$(imgs).each(function() {
		var img = $(this), imageURI = img.attr("src"), partId = img.attr("partId");
		var options = new FileUploadOptions();
		options.fileKey = "upload";
		options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
		options.mimeType = "image/jpeg";
		options.headers = { userid : getStore("USERID"), phone : 1 };
		options.trustAllHosts = true;
		options.chunkedMode = false;
		options.params = { uploadFolder : "phone" };
		if (options.fileName.lastIndexOf("?") != -1)
			options.fileName = options.fileName.substring(0, options.fileName.lastIndexOf("?"));
		
		function showProgress(msg) {
			toast(msg || ("照片上传进度:" + uploadCount + "/" + imgs.length), 2000);
		}
		
		var ft = new FileTransfer();
		ft.upload(imageURI, SERVERURL + 'common/fileUploadAction.action', function(attach) {
			++uploadCount;
			console.log("success " + uploadCount + "/" + imgs.length);
			var att = null;
			try {
				att = $.parseJSON(attach.response).attachmentInfo;
			} catch (e) {
				console.log("error : " + e.message + ", response : " + attach.response);
				console.log(e);
				showProgress("照片'" + img.siblings(".pic-desc-name").html() + "'上传失败:" + (fileTransferErrorMessage[e.message] || "未知错误"));
				return;
			}
			img.data("attachment", att);
			showProgress();
			if (uploadCount == imgs.length) {
				showProgress("照片上传完成");
				if (finishCallback)
					finishCallback(_loadPhotos());
			}
		}, function(error) {
			console.log("Code = " + error.code + ", Source = " + error.source + ", Target = " + error.target + ", HttpStatus = " + error.http_status);
			showProgress("照片'" + img.siblings(".pic-desc-name").html() + "'上传失败:" + error.code);
		}, options);
	});

}

// 读取图片上的附件信息
function _loadPhotos() {
	var attachments = [], partIds = [], extAtts = [];
	$("#photoinfo img").each(function() {
		var img = $(this), imageURI = img.attr("src"), partId = parseInt(img.attr("partId"), 10) || 0;
		var att = img.data("attachment");
		if (att) {
			if (partId > 0) {
				attachments.push(att);
				partIds.push(partId);
			} else {
				extAtts.push(att);
			}
		}
	});
	return { attachments : attachments, partIds : partIds, extAtts : extAtts }
}

/**
 * 拍照
 * @param obj
 * @param partId
 */
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

//加载基础代码下拉数据
function loadCodes() {
	//准备设备来源下拉数据
	ap.dbFindAll('Phone_Comm_Code_Detail',function(data){
		var source = data.rows;
		var html = '';
		if(!!source && source.length > 0)
			for(var i = 0; i < source.length; i++) {
				html += '<p class="ui-select-option" onclick="optionSelected(\'sourceType\','+i+','+source.item(i).codeId+',chengeSourceType('+source.item(i).codeId+'));">'+source.item(i).codeName+"</p>";
			}
		html += '<p class="ui-select-option" onclick="optionSelected(\'sourceType\','+(-1)+',0);">取消</p>';
		html = "<div>" + html + "</div>";
		$('#sourceType-list').append(html);
	},"codeId,codeName",'isUse = 1 and typeNo = "CD010002"');
	//准备工况下拉数据
	ap.dbFindAll('Phone_Comm_Code_Detail',function(data){
		var details = data.rows;
		var html = '';
		if(!!details && details.length > 0)
			for(var i = 0; i < details.length; i++) {
				html += '<p class="ui-select-option" onclick="optionSelected(\'machCondition\','+i+','+details.item(i).codeId+');">'+details.item(i).codeName+"</p>";
			}
		html += '<p class="ui-select-option" onclick="optionSelected(\'machCondition\','+(-1)+',0);">取消</p>';
		html = "<div>" + html + "</div>";
		$('#machCondition-list').append(html);
	},"codeId,codeName",'isUse = 1 and typeNo = "CD010011"');
}

function loadTemplate() {
	ap.dbFindAll('Phone_Eval_Template',function(data){
		var list = data.rows;
		var html = '';
		if(!!list && list.length > 0)
			for(var i = 0; i < list.length; i++) {
				html += '<p class="ui-select-option" onclick="optionSelected(\'evalTemplate\','+i+','+list.item(i).evalTemplateId+',applyTemplate)">'+list.item(i).evalTemplateName+"</p>";
			}
		html += '<p class="ui-select-option" onclick="optionSelected(\'evalTemplate\','+(-1)+',0);">取消</p>';
		html = "<div>" + html + "</div>";
		$('#evalTemplate-list').append(html);
	},"evalTemplateId,evalTemplateName",'isUse = 1');
}

//加载品牌下拉数据
function loadBrands() {
	ap.dbFindAll('Phone_Comm_Brand',function(data){
		var brand = data.rows;
		var html = '', html2 = ''
		if(!!brand && brand.length > 0) {
			var list = [];
			for(var i = 0; i < brand.length; i++){
				if(brand.item(i).brandName.indexOf('斗山') == -1) {
					list.push(brand.item(i));
				}
				html += '<p class="ui-select-option" onclick="optionSelected(\'brand\','+i+','+brand.item(i).brandId+',loadProducts);">'+brand.item(i).brandName+"</p>";
			}
			for(var j = 0; j < list.length; j ++){
				//竞对品牌，应该没有斗山
				if(list[j].brandName.indexOf('斗山') == -1) {
					html2 += '<p class="ui-select-option" onclick="optionSelected(\'compBrand\','+j+','+list[j].brandId+',loadProducts);">'+list[j].brandName+"</p>";
				}
			}
		}
		html += '<p class="ui-select-option" onclick="manualInput(\'brand\');">手动输入</p>';
		html += '<p class="ui-select-option" onclick="optionSelected(\'brand\','+(-1)+',0);">取消</p>';
		html2 += '<p class="ui-select-option" onclick="optionSelected(\'compBrand\','+(-1)+',0);">取消</p>';
		html = "<div>" + html + "</div>";
		html2 = "<div>" + html2 + "</div>";
		$('#brand-list').append(html);
		$('#compBrand-list').append(html2);
	},'brandId,brandName','isUse = 1 and dealerId = '+getStore("USERDEALERID"));
}

//加载产品下拉数据
//param f:是否页面初始化时准备置换机型数据
function loadProducts(f, isInit) {
	//获取触发元素的父元素容器的ID;
	var srcId = !!f ? f : $(event.srcElement).closest('.ui-select-container').attr('id');
	var brandId = null;
	var container = null;
	var sel = null;
	var child = null;
	switch(srcId){
	case 'brand-list':
		brandId = $('#brandId').val();
		container = $('#product-list');
		sel = 'product';
		child = 'model';
		break;
	case 'compBrand-list':
		brandId = $('#compBrandId').val();
		container = $('#compProduct-list');
		sel = 'compProduct';
		child = "compModel";
		break;
	case 'initReProduct':
		brandId = 1;//斗山
		container = $('#reProduct-list');
		sel = 'reProduct';
		break;
	default:
		alertMsg("无效的父选项id:" + srcId);
		break;
	}
	//加载之后取消禁用点击弹出
	var ss = $("#" + sel + "-select").find('a').removeClass('ui-input-disabled');
	if (!ss.attr("clkReged"))
		$(ss).click(function() {
			if (!$(this).hasClass("ui-input-disabled"))
				openSelectList(sel);
		}).attr("clkReged", 1);
	//非初始化时,当点击品牌加载产品时，同时清空之前填写的产品、机型信息
	if (!isInit){
		$('#'+sel+'Id').val(null);
		$('#'+sel+'Name').val(null);
		$('#'+sel+'-list-selected').html('---请选择---');
		if (child) {
			$('#'+child+'Id').val(null);
			$('#'+child+'Name').val(null);
			$('#'+child+'-list-selected').html('---请选择---');
			$("#" + child + "-select").find("a").addClass("ui-input-disabled");
		}
	}
	if (sel == 'product') {
		var pid = $("#productId").val(), pname = $("#productName").val(), mid = $("#modelId").val(), mname = $("#modelName").val();
		returnToSelect('product');
		returnToSelect('model');
		$("#productId").val(pid);
		$("#productName").val(pname);
		$("#modelId").val(mid);
		$("#modelName").val(mname);
	}
	ap.dbFindAll('Phone_Comm_Product', function(data){
		var product = data.rows;
		var html = '';
		if (product && product.length) {
			for(var i = 0; i < product.length; i++) {
				html += '<p class="ui-select-option" onclick="optionSelected(\''+sel+'\','+i+','+product.item(i).productId+',loadModels);">'+product.item(i).productName+"</p>";
			}
		}
		if (sel == 'product') {
			html += '<p class="ui-select-option" onclick="manualInput(\'product\');">手动输入</p>';
		}
		html += '<p class="ui-select-option" onclick="optionSelected(\''+sel+'\','+(-1)+',0)">取消</p>';
		// 使用iscroll时需要一个固定的子元素，避免在刷新时失去滚动效果
		container = !container.children().length ? $("<div></div>").appendTo(container) : container.children(":eq(0)");
		$(container).empty().append(html);
	},"productId,productName",'brandId = '+brandId);
};

//加载机型下拉数据
function loadModels(f, isInit){
	//获取触发元素的父元素容器的ID;
	var srcId = !!f ? f : $(event.srcElement).closest('.ui-select-container').attr('id');
	var productId = null;
	var container = null;
	var sel = null;
	switch(srcId){
	case 'product-list':
		productId = $('#productId').val();
		container = $('#model-list');
		sel = 'model';
		break;
	case 'compProduct-list':
		productId = $('#compProductId').val();
		container = $('#compModel-list');
		sel = 'compModel';
		break;
	case 'reProduct-list':
		productId = $('#reProductId').val();
		container = $('#reModel-list');
		sel = 'reModel';
		break;
	default:
		break;
	}
	//加载之后取消禁用弹出
	var ss = $('#' + sel + '-select').find('a').removeClass('ui-input-disabled');
	if (!ss.attr("clkReged"))
		ss.click(function() {
			if (!$(this).hasClass("ui-input-disabled"))
				openSelectList(sel);
		}).attr("clkReged", 1);
	//非初始化时,当点击产品加载机型时，同时清空之前填写机型信息
	if(!isInit){
		$('#'+sel+'Id').val(null);
		$('#'+sel+'Name').val(null);
		$('#'+sel+'-list-selected').html('---请选择---');
	}
	if (sel == 'model') {
		var mid = $("#modelId").val(), mname = $("#modelName").val();
		returnToSelect('model');
		$("#modelId").val(mid);
		$("#modelName").val(mname);
	}
	ap.dbFindAll('Phone_Comm_Model',function(data){
		var model= data.rows;
		var html = '';
		if (model && model.length) {
			for(var i = 0; i < model.length; i++) {
				html += '<p class="ui-select-option" onclick="optionSelected(\''+sel+'\','+i+','+model.item(i).modelId+');">'+model.item(i).modelName+"</p>";
			}
		}
		if (sel == 'model') {
			html += '<p class="ui-select-option" onclick="manualInput(\'model\');">手动输入</p>';
		}
		html += '<p class="ui-select-option" onclick="optionSelected(\''+sel+'\','+(-1)+',0);">取消</p>';
		// 使用iscroll时需要一个固定的子元素，避免在刷新时失去滚动效果
		container = !container.children().length ? $("<div></div>").appendTo(container) : container.children(":eq(0)");
		$(container).empty().append(html);
	}, "modelId, modelName", "isUse = 1 and productId = " + productId, [ 'modelName', 'asc' ]);
}

function applyTemplate() {
	var tid = $("#evalTemplateId").val();
	ap.dbFindAll("Phone_Eval_Template_Photo", function(result) {
		var ul = '<ul class="ui-ul-photo">';
		for (var i = 0; i < result.rows.length; i++) {
			var part = result.rows.item(i);
			var image = getPartImg(part.photoPartId);
			ul += '<li class="ui-li-photo">';
			ul += '<img src="../../img/' + image + '" partId="' + part.photoPartId + '" alt="' + part.photoPartName + '" class="small-pic" onclick="capturePicture(this, ' + part.photoPartId + ');">';
			ul += '<p class="pic-desc-name">' + part.photoPartName + '</p></li>';
		}
		ul += '<li class="ui-li-photo">';
		ul += '<img src="../../img/bg_icon_add.jpg" class="small-pic" addPic=1 onclick="addPicture(this);">';
		ul += '<p class="pic-desc-name">添加</p></li></ul>';
		$("#photoinfo").empty().append(ul);
		//refreshScroll("#content", false, true);
	}, "*", "evalTemplateId=" + tid);
}

function preparePhoto(keyId, tid) {
	ap.dbFindAll("Phone_Eval_Template_Photo", function(result) {
		var html = '';
		for (var p = 0; p < result.rows.length; p++) {
			var part = result.rows.item(p);
			var tp = '<li class="ui-li-photo">';
			tp += '<img id="' + part.photoPartId + '" src="../../img/' + 
				getPartImg(part.photoPartId) + '" partId="' + part.photoPartId + '" alt="' + part.photoPartName + 
				'" class="small-pic" onclick="capturePicture(this, ' + part.photoPartId + ');">';
			tp += '<p class="pic-desc-name">' + part.photoPartName + '</p></li>';
			html += tp;
		}
		
		$("#photoinfo").empty().append('<ul class="ui-ul-photo">' + html + '</ul>');
		
		ap.dbFindAll("Phone_Du_Eval_Photo", function(data) {
			var other = '';
			for (var i = 0; i < data.rows.length; i++) {
				var item = data.rows.item(i);
				console.log("loaded eval photo -> " + JSON.stringify(item));
				if (item.partId > 0) {
					$("#" + item.partId).attr("src", item.photoPath);
				} else {
					var p = '<li class="ui-li-photo">';
					p += '<img id="_local_' + item._id + '" src="' + item.photoPath + '" oth="' + item.remark + '" class="small-pic" onclick="capturePicture(this);">';
					var remark = item.remark;
					if (remark) {
						var nsep = remark.indexOf("\n");
						if (nsep != -1)
							remark = remark.substring(0, nsep);
					}
					p += '<p class="pic-desc-name">' + remark + '</p></li>';
					other += p;
				}
			}
			other += '<li class="ui-li-photo">';
			other += '<img src="../../img/bg_icon_add.jpg" class="small-pic" addPic=1 onclick="addPicture(this);">';
			other += '<p class="pic-desc-name">添加</p></li>';
			$("#photoinfo ul").append(other);
			refreshScroll("#content", false, true);
			
			for (var i = 0; i < data.rows.length; i++) {
				var item = data.rows.item(i);
				var remark = item.remark || "", nsep = remark.indexOf("\n");
				console.log("remark = " + remark);
				// 已保存的附件信息
				if (nsep != -1) {
					item.remark = remark.substring(0, nsep);
					var attachStr = remark.substring(nsep + 1), attach = null;
					console.log("已保存的本地附件信息" + attachStr);
					try {
						attach = $.parseJSON(attachStr);
					} catch (ex) {
						console.log("无法解析保存的附件信息为json");
					}
					if (item.partId > 0) {
						$("#" + item.partId).data("attachment", attach);
						console.log("partId -> " + item.partId + " : " + $("#" + item.partId).length);
					} else {
						$("#_local_" + item._id).data("attachment", attach);
						console.log("_id -> " + item._id + " : " + $("#_local_" + item._id).length);
					}
				}
			}
		}, "*", "billId=" + keyId + " and billType='APP'");
	}, "*", "evalTemplateId=" + tid);
}

function setSelectText(sel) {
	var text = getSelectText(sel);
	if (sel.indexOf('Id') != -1) {
		sel = sel.substring(0, sel.indexOf('Id'));
	}
	$('#' + sel + 'Desc').val(text);
}

function getSelectText(id) {
	var index = document.getElementById(id).selectedIndex;
	return document.getElementById(id).options[index].text;
}

//init产品、机型等 下拉框
function initDropdown(){
	loadProducts('brand-list',true);
	loadProducts('compBrand-list',true);
	loadModels('product-list',true);
	loadModels('compProduct-list',true);
	loadModels('reProduct-list',true);
}

//处理下拉与复选框数据,编辑时将数据对应的在页面显示出来
function dealComboNCheckboxValue(en){
	//combobox
	$('#brand-list-selected').html(en.brandName);
	$('#product-list-selected').html(en.productName);
	$('#model-list-selected').html(en.modelName);
	$('#reProduct-list-selected').html(en.RProductName || en.reProductName || '---请选择---');
	$('#reModel-list-selected').html(en.RModelName || en.reModelName || '---请选择---');
	$('#compBrand-list-selected').html(en.CBrandName || en.compBrandName || '---请选择---');
	$('#compProduct-list-selected').html(en.CProductName || en.compProductName || '---请选择---');
	$('#compModel-list-selected').html(en.CModelName || en.compModelName || '---请选择---');
	$('#evalTemplate-list-selected').html(en.evalTemplateName);
	$('#sourceType-list-selected').html(en.sourceTypeName);
	$('#machCondition-list-selected').html(en.machConditionName || '---请选择---');
	$('#reProductName').val(en.RProductName || en.reProductName);
	$('#reModelName').val(en.RModelName || en.reModelName);
	$('#compBrandName').val(en.CBrandName || en.compBrandName);
	$('#compProductName').val(en.CProductName || en.compProductName);
	$('#compModelName').val(en.CModelName || en.compModelName);
	$('#evalTemplateName').val(en.evalTemplateName);
	$('#sourceTypeName').val(en.sourceTypeName);
    $('#machConditionName').val(en.machConditionName);
	//checkbox
	!!en.hasCert && en.hasCert == 1 ? $('#hasCert').attr('checked',true).val(true) : $('#hasCert').attr('checked',false).val(false);
	!!en.hasInvoice && en.hasInvoice == 1 ? $('#hasInvoice').attr('checked',true).val(true) : $('#hasInvoice').attr('checked',false).val(false);
	!!en.hasContract && en.hasContract == 1 ? $('#hasContract').attr('checked',true).val(true) : $('#hasContract').attr('checked',false).val(false);
    !!en.isOrigpain && en.isOrigpain == 1 ? $('#isOrigpain').attr('checked',true).val(true) : $('#isOrigpain').attr('checked',false).val(false);
    !!en.isStandpart && en.isStandpart == 1 ? $('#isStandpart').attr('checked',true).val(true) : $('#isStandpart').attr('checked',false).val(false);
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

var custList;
window._cpage = 1, window._cstop = false;
//查询客户列表
function getCustList(_page) {
	if (!loginMode()) {
		toast("您现在处于离线状态，无法选择客户", 3000);
		return;
	}
	
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
		var html = '';
		var idx = 0;
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
		$("#data_list").empty().append(html);
		$("#dataListPop").find("p").html("选择客户");
		centerPop($("#dataListPop"));
		$("#dataListPop, #dataListShadow").removeClass("ui-hidden");
		applyScroll($('#data_list').parent(), false);
		document.removeEventListener('backbutton', back, false);
		document.addEventListener('backbutton', closePop, false);
		hidePageLoading();
	});
};

//关闭客户弹出
function closePop() {
	$("#dataListShadow, #dataListPop").addClass("ui-hidden");
	document.removeEventListener('backbutton', closePop, false);
	document.addEventListener('backbutton', back, false);
}

//点击选择客户
function onCustItemClick(index) {
	closePop();
	stuffFormDatas(custList[index]);
	$("#areaName").val(custList[index].fullAreaName);
}

//查询设备
window._dpage = 1, window._dstop = false;
function queryDevice(_page) {
	if (!loginMode()) {
		alertMsg("您现在处于离线状态，无法查询设备");
		return;
	}
	
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
	
	showPageLoading();
	window.deviceList = [];
	var custId = $('#custId').val();
	var url = 'used/stock/unsoldMachStockInListJson.action';
	if (!!custId) {
		url = 'basedata/coMachEvalListJson.action';
	}
	var params = { "page" : window._dpage, "rows" : rows, "sort" : "mach_id", "order" : "desc", "custId" : custId };
	if (!!$("#device_keyword").val())
		$.extend(params, { "keyword" : $("#device_keyword").val() });
	
	getDataFromServer(url, params, function(data) {
		data = eval("(" + data + ")");
		var idx = 0;
		var html = '';
		deviceList = convertToBeanList(data.rows);
		
		// 到达最后一页时标记(不能=，如果=就只能显示一页)
		deviceList.length < rows ? window._dstop = true : window._dstop = false;
		$(deviceList).each(function() {
			html += '<li class="ui-pop-li" onclick="onDeviceItemClick(' + idx + ');">';
			html += this.brandName + ', ' + this.productName + ',' + this.modelName;
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
		document.addEventListener('backbutton', closeDevicePop, false);
		hidePageLoading();
	});
}

//关闭设备弹出层
function closeDevicePop(){
	$("#deviceListShadow, #deviceListPop").addClass("ui-hidden");
	document.removeEventListener('backbutton', closeDevicePop, false);
	document.addEventListener('backbutton', back, false);
}

//点击选择设备触发事件
function onDeviceItemClick(index){
	closeDevicePop();
	var en = window.deviceList[index];
	var base = {
			brandId:en.brandId,
			brandName:en.brandName,
			productId:en.productId,
			productName:en.productName,
			modelId:en.modelId,
			modelName:en.modelName,
			serialNo:en.serialNo,
            salePrice:en.salePrice,
            wSalePrice:en.salePrice/10000
	};
	if(!!en.brandId && (en.brandId == 1 || en.brandName.indexOf('斗山') != -1)){//品牌为斗山
		$.extend(base,{
			frameNo:en.frameNo,
			engineNo:en.engineNo,
			leaveDate:en.leaveDate,
			workYear:en.workYear
		});
	}else{//非斗山
		$('#frameNo').val(null);
		$('#engineNo').val(null);
		$('#leaveDate').val(null);
		$('#workYear').val(null);
	}
	stuffFormDatas(base);
	calcLeaveDate();
	// 查询设备，带出出厂日期
	updateMachInfo();
	
	//$("#iwYear").val((en.workYear / 12).toFixed(0));
	//$("#iwMonth").val(en.workYear % 12);

	//根据选中的车，更改产品、机型下拉项的内容
	loadProducts('brand-list',true);
	loadModels('product-list',true);
	
	$('#brand-list-selected').html(base.brandName);
	$('#product-list-selected').html(base.productName);
	$('#model-list-selected').html(base.modelName);
}

function validate(){
	//valInput:需要验证非空的input表单ID,wrapInput:验证不通过时包裹红色边框的表单ID
	var list = [{valInput:'#custName',wrapInput:['#custName-validate'],msg:'请填写客户名称'},
                {valInput:'#brandId',wrapInput:['#brand-validate','#brandName'],msg:'请选择品牌'},
	            {valInput:'#productId',wrapInput:['#product-validate','#productName'],msg:'请选择产品'},
	            {valInput:'#modelId',wrapInput:['#model-validate','#modelName'],msg:'请选择机型'},
	            {valInput:'#sourceTypeId',wrapInput:['#sourceType-validate'],msg:'请选择设备来源'},
	            {valInput:'#evalTemplateId',wrapInput:['#evalTemplate-validate'],msg:'请选择评估模板'}
	           ];
	var deal = [
	    { component : '#reProductId', wrapper : '#reProduct-select', msg : '请选择置换新机产品' },
	    { component : '#reModelId', wrapper : '#reModel-select', msg : '请选择置换新机机型' }
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
						$(this).removeClass('ui-check-error');
					});
					prompt += $(this).attr('placeholder')+'\n';
					pass = false;
				}
			} else {
				$(this).parents('.ui-body').addClass('ui-check-error');
				$(this).parents('ui-body').on('change',function(){
					$(this).removeClass('ui-check-error');
				});
				prompt += $(this).attr('placeholder')+'\n';
				pass = false;
			}
		}
	});
	//验证下拉项
	$(list).each(function(){
		var val = $(this.valInput).val();
		if(!val){
			$.each(this.wrapInput,function(index,element){
				$(this).parent('.ui-select').addClass('ui-check-error');
				$(this).parent('ui-select').on('change',function(){
					$(this).parent('.ui-select').removeClass('ui-check-error');
				});
			});
			prompt += this.msg + '\n';
			pass = false;
		}
	});
	
	if ($("#sourceTypeId").val() == 1000201) {// 设备来源：置换
		$(deal).each(function() {
			if (!$(this.component).val() || (!!$(this.component).val() && $(this.component).val() == 0)) {
				$(this.wrapper).addClass("ui-check-error");
				prompt += this.msg + '\n';
				pass = false;
			}
		});
	}
	var curDate = new Date();
	var appDate = $('#appDate').val();
	if(diffDays > 0){//申请日期在当前日期之前
		var diffDays = parseInt((curDate - appDate)/1000/60/60/24);
		if(diffDays > 3){
			alertMsg('申请日期不允许为三天之前,请检查');
			$('#appDate').parent('.ui-body').css('border','solid 1px red');
			$('#appDate').parent('ui-body').bind('change focus',function(){
				$('#appDate').parent('.ui-body').css('border','none');
			});
			return;
		}
	}
	if(!pass){
		dismissSavePop();
		alertMsg(prompt);
	}
	return pass;
}
function validateDraft(){
    //valInput:需要验证非空的input表单ID,wrapInput:验证不通过时包裹红色边框的表单ID
    var list = [{valInput:'#brandId',wrapInput:['#brand-validate','#brandName'],msg:'请选择品牌'},
                {valInput:'#productId',wrapInput:['#product-validate','#productName'],msg:'请选择产品'},
                {valInput:'#modelId',wrapInput:['#model-validate','#modelName'],msg:'请选择机型'},
                {valInput:'#sourceTypeId',wrapInput:['#sourceType-validate'],msg:'请选择设备来源'},
                {valInput:'#evalTemplateId',wrapInput:['#evalTemplate-validate'],msg:'请选择评估模板'}
                ];
    var deal = [
                { component : '#reProductId', wrapper : '#reProduct-select', msg : '请选择置换新机产品' },
                { component : '#reModelId', wrapper : '#reModel-select', msg : '请选择置换新机机型' }
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
                                                      $(this).removeClass('ui-check-error');
                                                      });
                        prompt += $(this).attr('placeholder')+'\n';
                        pass = false;
                        }
                        } else {
                        $(this).parents('.ui-body').addClass('ui-check-error');
                        $(this).parents('ui-body').on('change',function(){
                                                      $(this).removeClass('ui-check-error');
                                                      });
                        prompt += $(this).attr('placeholder')+'\n';
                        pass = false;
                        }
                        }
                        });
    //验证下拉项
    $(list).each(function(){
                 var val = $(this.valInput).val();
                 if(!val){
                 $.each(this.wrapInput,function(index,element){
                        $(this).parent('.ui-select').addClass('ui-check-error');
                        $(this).parent('ui-select').on('change',function(){
                                                       $(this).parent('.ui-select').removeClass('ui-check-error');
                                                       });
                        });
                 prompt += this.msg + '\n';
                 pass = false;
                 }
                 });
    
    if ($("#sourceTypeId").val() == 1000201) {// 设备来源：置换
        $(deal).each(function() {
                     if (!$(this.component).val() || (!!$(this.component).val() && $(this.component).val() == 0)) {
                     $(this.wrapper).addClass("ui-check-error");
                     prompt += this.msg + '\n';
                     pass = false;
                     }
                     });
    }
    var curDate = new Date();
    var appDate = $('#appDate').val();
    if(diffDays > 0){//申请日期在当前日期之前
        var diffDays = parseInt((curDate - appDate)/1000/60/60/24);
        if(diffDays > 3){
            alertMsg('申请日期不允许为三天之前,请检查');
            $('#appDate').parent('.ui-body').css('border','solid 1px red');
            $('#appDate').parent('ui-body').bind('change focus',function(){
                                                 $('#appDate').parent('.ui-body').css('border','none');
                                                 });
            return;
        }
    }
    if(!pass){
        dismissSavePop();
        alertMsg(prompt);
    }
    return pass;
}
//提交到服务器
function submitServer(){
	prepareForm();
	if(validate()){
		showPageLoading();
		
		var params = form2Obj();
		delete params["en.wSalePrice"];
		delete params["en.wReMachinePrice"];
		delete params["en.wCustExpPrice"];
		delete params["en.WCompPrice"];
		delete params["en.WCompNewPrice"];
		delete params["cust_keyword"];
		delete params["device_keyword"];
		
		toast("正在提交数据，请稍候", 4000);

		// 先校验
		params["validateOnly"] = 1;
		blockedPostData('used/eval/saveUsedEvalApp.action', params, function(json) {
			// 提交数据
			uploadFile(function(obj) {
				// 去掉验证标识，准备保存
				delete params["validateOnly"];
				var attachments=obj?obj.attachments:[];
				var partIds=obj?obj.partIds:[];
				var extAtts=obj?obj.extAtts:[];
	
				if (attachments) {
//					if (attachments.length < 16) {
//						alertMsg("评估申请必须添加16照片，请检查");
//						dismissSavePop();
//						return;
//					}
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
						params["extAttDetails[" + k + "].createDate"]=extAtts[k].createDate;
						params["extAttDetails[" + k + "].fileName"]=extAtts[k].fileName;
						params["extAttDetails[" + k + "].fileSize"]=extAtts[k].fileSize;
						params["extAttDetails[" + k + "].fileType"]=extAtts[k].fileType;
						params["extAttDetails[" + k + "].originalName"]=extAtts[k].originalName;
						params["extAttDetails[" + k + "].pathName"]=extAtts[k].pathName;
						var remark = extAtts[k].originalName.indexOf("_") == -1 ? extAtts[k].originalName : extAtts[k].originalName.substring(0, extAtts[k].originalName.indexOf("_"));
						params["extAttDetails[" + k + "].remark"]=extAtts[k].remark != null ? extAtts[k].remark : remark;
					}
				}
				
				blockedPostData('used/eval/saveUsedEvalApp.action', params, function(json) {
					var draftAppId = getStore("CURR_APPLY_ID");
					if (draftAppId) {
						ap.dbDelete("Phone_Du_Eval_Photo", { billId : draftAppId, billType : "APP" }, function() {
							ap.dbDelete("Phone_Du_Eval_App", { _id : draftAppId }, function() {
								toast("保存成功", 5000);
								hidePageLoading();
								backFromSave();
							});
						});
					} else {
						toast("保存成功", 5000);
						hidePageLoading();
						backFromSave();
					}
				}, function(data, errorMessages) {
					if (errorMessages && errorMessages.length)
						alert(errorMessages.join("\n"));
					else
						alert("保存申请失败");

					hidePageLoading();
				});
			});
		}, function(data, errorMessages) {
			if (errorMessages && errorMessages.length)
				alert(errorMessages.join("\n"));
			else
				alert("无法提交数据至服务器");

			hidePageLoading();
		});
	}
};

function form2Obj() {
	var params = {};
	$("INPUT[name][id],TEXTAREA[name][id]").each(function() {
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

function form2Draft() {
	var params = {};
	$("INPUT[id],TEXTAREA[id]").each(function() {
		var t = $(this);
		var n = t.attr("id");
		if (t.attr("type") != "checkbox" || this.checked) {
			params[n] = t.val() == null ? '' : t.val();
		}
	});
	params["createUserId"] = getStore("USERID");
	params["createUserName"] = getStore("USERNAME");
	params["createDate"] = getCurrTime();
	return params;
}

function prepareForm() {
	var wSalePrice = parseFloat($("#wSalePrice").val());
	var wReMachinePrice = parseFloat($("#wReMachinePrice").val());
	var wCustExpPrice = parseFloat($("#wCustExpPrice").val());
	var wCompPrice = parseFloat($("#WCompPrice").val());
	var wCompNewPrice = parseFloat($("#WCompNewPrice").val());
	if (!isNaN(wSalePrice))
		$("#salePrice").val(wSalePrice * 10000);
	if (!isNaN(wReMachinePrice))
		$("#reMachinePrice").val(wReMachinePrice * 10000);
	if (!isNaN(wCustExpPrice))
		$("#custExpPrice").val(wCustExpPrice * 10000);
	if (!isNaN(wCompPrice))
		$("#compPrice").val(wCompPrice * 10000);
	if (!isNaN(wCompNewPrice))
		$("#compNewPrice").val(wCompNewPrice * 10000);
	
	var workYear = $.trim($("#workYear").val());
	if (workYear == "")
		calculatTotalMonth();
	
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

//保存草稿
function saveDraft(){
	prepareForm();
	if(validateDraft()){
		showPageLoading();
		
		checkboxHandler2();
		var obj = form2Draft();
		
		delete obj.areaId;
		delete obj.wSalePrice;
		delete obj.iwYear;
		delete obj.iwMonth;
		delete obj.wCustExpPrice;
		delete obj.wReMachinePrice;
		delete obj.WCompPrice;
		delete obj.WCompNewPrice;
		delete obj.cust_keyword;
		delete obj.device_keyword;
		toast("正在保存草稿，请稍候", 2000);
		
		if (!!getStore("CURR_APPLY_ID")) {
			ap.dbUpdate("Phone_Du_Eval_App", obj, { _id : getStore("CURR_APPLY_ID") }, function(result) {
				ap.dbDelete("Phone_Du_Eval_Photo", { billId : getStore("CURR_APPLY_ID"), billType : 'APP' }, function(rs) {
					saveParts(getStore("CURR_APPLY_ID"));
				});
			});
		} else {
			ap.dbInsert("Phone_Du_Eval_App", obj, function(result) {
				saveParts(result.insertId);
			});
		}
	}
}

function saveParts(_id) {
	var imgs = [], data = [];
	$("#photoinfo img").each(function() {
		var imageURI = $(this).attr("src");
		if (imageURI && imageURI.indexOf("part_") == -1 && 
				imageURI.indexOf("bg_icon_add") == -1)
			imgs.push(this);
	});
	if (!imgs.length) {
		toast("保存成功", 3000);
		hidePageLoading();
		backFromSave();
		return;
	}
	
	for (var i = 0; i < imgs.length; i++) {
		var item = {
			billId : _id,
			billType : 'APP',
			partId : !!$(imgs[i]).attr("partId") ? $(imgs[i]).attr("partId") : 0,
			partName : !!$(imgs[i]).attr("alt") ? $(imgs[i]).attr('alt') : '',
			photoPath : $(imgs[i]).attr("src"),
			remark : !!$(imgs[i]).attr("oth") ? $(imgs[i]).attr("oth") : ''
		};
		// 保存草稿时，如果有附件，则是已经上传的文件，如果没有附件，则是本地文件
		var attach = $(imgs[i]).data("attachment");
		if (attach) {
			// 附件信息序列化之后保存在remark之后，以\n分隔
			item.remark += "\n" + JSON.stringify(attach);
		}
		data.push(item);
	}
	
	var insertCount = data.length;
	function tryBack() {
		if (insertCount == 0) {
			toast("保存成功", 3000);
			hidePageLoading();
			backFromSave();
		}
	}
	tryBack();
	$(data).each(function() {
		ap.dbInsert("Phone_Du_Eval_Photo", this, function(result) {
			--insertCount;
			tryBack();
		});
	});
}

function insertDB(tableName, data, index, callback) {
	if (index < data.length) {
		ap.dbInsert(tableName, data[index], function(result) {
			setTimeout(insertDB(tableName, data, ++index, callback), 300);
		});
	} else {
		callback();
	}
}

function calculatTotalMonth() {
	var workYear = $("#iwYear").val() || 0;
	var workMonth = $("#iwMonth").val() || 0;
	$("#workYear").val(parseInt(workYear, 10) * 12 + parseInt(workMonth, 10));
}

function calcLeaveDate() {
	var ld = $("#leaveDate").val();
	var ad = $("#appDate").val();
	var md = getMonthDiff(ld, ad, true);  // 出厂日期不能晚于申请日期 
	var y = Math.floor(md / 12), m = md % 12;
	$("#workYear").val(md);
	$("#iwYear").val(y);
	$("#iwMonth").val(m);
}

//设备来源更改时控制交易tab
function chengeSourceType(val){
	if(val==1000201){
		$('#adeal').show();
		$('#divReProduct').show();
		$('#divReModel').show();
		$('#divNewPrice').show();
		$('#divCompBrand').show();
		$('#divCompProduct').show();
		$('#divCompModel').show();
		$('#divCompEvalPrice').show();
		$('#divCompNewPrice').show();
		$('#abase').removeClass("ui-navbar-item-c").addClass("ui-navbar-item-d");
		$('#aused').removeClass("ui-navbar-item-c").addClass("ui-navbar-item-d");
		$('#aphoto').removeClass("ui-navbar-item-c").addClass("ui-navbar-item-d");
	}
	else if (val==1000202){
		$('#adeal').show();
		$('#divReProduct').hide();
		$('#divReModel').hide();
		$('#divNewPrice').hide();
		$('#divCompBrand').hide();
		$('#divCompProduct').hide();
		$('#divCompModel').hide();
		$('#divCompEvalPrice').hide();
		$('#divCompNewPrice').hide();
		$('#abase').removeClass("ui-navbar-item-c").addClass("ui-navbar-item-d");
		$('#aused').removeClass("ui-navbar-item-c").addClass("ui-navbar-item-d");
		$('#aphoto').removeClass("ui-navbar-item-c").addClass("ui-navbar-item-d");
	}
	else{
		$('#adeal').hide();
		$('#abase').removeClass("ui-navbar-item-d").addClass("ui-navbar-item-c");
		$('#aused').removeClass("ui-navbar-item-d").addClass("ui-navbar-item-c");
		$('#aphoto').removeClass("ui-navbar-item-d").addClass("ui-navbar-item-c");
	}
}

function updateMachInfo() {
	var brandId = $("#brandId").val(), productId = $("#productId").val(), modelId = $("#modelId").val(), serialNo = $("#serialNo").val(), salePrice = $("#salePrice").val();
	if (brandId!=null && productId!=null && modelId!=null && serialNo!=null && salePrice !=null) {
        var param = { brandId: brandId, productId: productId, modelId: modelId, serialNo: serialNo ,salePrice :salePrice};
		getDataFromServer("basedata/findMachInfoJson.action", param, function(json) {
			try {
				json = $.parseJSON(json);
				if (json.machInfo && json.machInfo.leaveDate) {
					var leaveDate = parseDate(json.machInfo.leaveDate);
					if (leaveDate) {
						$("#leaveDate").val(getTimeString(leaveDate, true));
						calcLeaveDate();
					}
				}
			} catch (e) {
				console.log(e.message);
			}
		});
	}
}