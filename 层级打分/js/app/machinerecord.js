document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
	document.addEventListener('backbutton', back, false);
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
/***********  DETAIL START  ***********/
var recordList;
//var modelNameTemp;
//var serialNoTemp;
function GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}
function getMachineRecordDetail() {
	showPageLoading();
    var modelNameTemp = GetQueryString("modelname");
    var serialNoTemp  = GetQueryString("serialno");
    
    getDataFromServer("basedata/saleResumeQueryJson.action", { "page" : 1, "rows" : 10, "sort" : "dealer_id", "order" : "desc" ,"filter.model_name":modelNameTemp,"filter.serial_no":serialNoTemp}, function(data) {
        data = eval("(" + data + ")");
        recordList = convertToBeanList(data.rows);
                      if(recordList.length >=1){
                      stuffDetailDatas(recordList[0]);
                      hidePageLoading();
                      }else{
                      alertMsg("没有查询到该设备");
                      back();
                      }
                      });
}

function recordQuery() {
//    prepareForm();
    if (validate()) {
      var  modelNameTemp =$("#modelName").val();
       var serialNoTemp = $("#serialNo").val();
    window.location.href='machinerecordquerydetail.html?modelname='+modelNameTemp+'&serialno='+serialNoTemp;
        
    }
}
function validate() {
    dismissSavePop();
    var msg = '';
    var flag = true;
//    var list = [
//                { component : "#modelName", emptyMsg : "机型不能为空" },
//                { component : "#serialNo", emptyMsg : "机号不能为空" }
//                ];
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
//    $(list).each(function() {
//                 if (!$(this.component + "Name").val()) {
//                 $(this.component + "Name").parent().addClass("ui-check-error");
//                 $(this.component + "Id").parent().addClass("ui-check-error");
//                 msg += this.emptyMsg + '\n';
//                 flag = false;
//                 }
//                 });
    if (!flag)
        alertMsg(msg);
    return flag;
}
/***********  DETAIL END  ***********/