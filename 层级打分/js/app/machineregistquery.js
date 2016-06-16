document.addEventListener('deviceready', onDeviceReady, false);
	
function onDeviceReady() {
	document.addEventListener('backbutton', back, false);
}
//加载基础代码下拉数据
function loadCodes() {
    //准备部件下拉数据
    ap.dbFindAll('Phone_Comm_Code_Detail',function(data){
                 var otherItem = data.rows;
                 var html = '';
                 if(!!otherItem && otherItem.length > 0)
                 for(var i = 0; i < otherItem.length; i++) {
                 html += '<p class="ui-select-option" onclick="queryOptionSelected(\'otherItem\','+i+',\''+otherItem.item(i).codeString+'\');">'+otherItem.item(i).codeName+"</p>";
                 }
                 html += '<p class="ui-select-option" onclick="queryOptionSelected(\'otherItem\','+(-1)+',0);">取消</p>';
                 html = "<div>" + html + "</div>";
                 $('#otherItem-list').append(html);
                 },"codeName,codeString",'isUse = 1 and typeNo = "CD060001"');
}
//加载机型下拉数据
function loadModels() {
 	var f = 'model-list';
 	var isInit = true ;
	//获取触发元素的父元素容器的ID;
	var srcId = !!f ? f : $(event.srcElement).closest('.ui-select-container').attr('id');
	var product = null;
	var container = null;
	var sel = null;
	switch(srcId){
	case 'model-list':
		productId = $('#modelId').val();
		container = $('#model-list');
		sel = 'model';
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
	}, "modelId, modelName", "isUse = 1 and productId = 5 " , [ 'modelName', 'asc' ]);
}
//从选择变为手动输入品牌、产品、机型
function manualInput(sel, doNotClearValue){
	dismiss();
	switch(sel){
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
	case 'model':
		$('#model-select').show();
		$('#model-input').hide();
		$("#modelId,#modelName").val("");
		$("#model-list-selected").html("---请选择---");
		break;
	default:break;
	}
}
function queryOptionSelected(sel, optionId, value, callback) {
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
function showQueryResult(msg) {
    if (validate()) {
        
        var modelnameTemp =$("#modelName").val();
        var machnoTemp = $("#machNo").val();
        var partnameTemp = $("#otherItemId").val();
        var serialNoTemp = $("#serialNo").val();
        
        getDataFromServer("used/eval/machCheckJson.action", {"en.modelName":modelnameTemp,"en.machNo":machnoTemp,"en.serialNo":serialNoTemp,"en.partName":partnameTemp}, function(data) {
                          data = eval("(" + data + ")");
                          recordList = convertToBeanList(data.actionErrors);
                          if(recordList.length >=1){
                            alertMsg("该系列号验证未通过！");
                          }else{
                            alertMsg("设备匹配验证通过！");
                          }
                          });
    }
}

function validate() {
    dismissSavePop();
    var msg = '';
    var flag = true;
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