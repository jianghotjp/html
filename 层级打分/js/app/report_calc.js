function getTemplateId() {
	return parseInt($("#evalTemplateId").val(), 10) || 0;
}

function getLastTemplateId() {
	return parseInt($("#lastEvalTemplateId").val(), 10) || 0;
}

function trace(msg) {
	console.log(msg);
}

function dbList2Array(list) {
	if (!list)
		return [];
	var arr = new Array(list.length);
	for (var i = 0, j = list.length; i < j; ++i)
		arr[i] = list.item(i);
	return arr;
}

var __currentTemplate = null;
var _changeToUselessTemplate = null;
function saveCurrentTemplate(template, registerOnly) {
	if (registerOnly && __currentTemplate == template)
		return;
	__currentTemplate = template;
	var ts = JSON.stringify(template);
	if (template)
		insertStore("EVAL_REPORT_TEMPLATE", ts);
	else
		removeStore("EVAL_REPORT_TEMPLATE");
}
function getCurrentTemplate() {
	if (__currentTemplate && !_changeToUselessTemplate)
    {
        return __currentTemplate;
        _changeToUselessTemplate = null;
    }
		
	var ts = getStore("EVAL_REPORT_TEMPLATE");
	console.log("restoring template from local -> " + ts);
	var template = ts ? eval("(" + ts + ")") : null;
	__currentTemplate = template;
	return template;
}


/**
 * 处理模板切换
 */
function onTemplateChange(callback) {
	var ltid = getLastTemplateId();
	var ctid = getTemplateId();
	
	trace("changing template : " + ltid + " -> " + ctid);
	if (ltid == ctid && ctid > 0)
		return; // 跳过计算
	
	trace("loading template " + ctid);
	showPageLoading();
	
	_loadTemplateData(ctid, function(template) {
    if(template.details.length >0){
         toast("旧模板已不再使用",1000);
        removeStore("EVAL_REPORT_TEMPLATE");
        _changeToUselessTemplate = "yes";
         return;
    }else{
          onLoadTemplate(template);
    }
		if (typeof callback == "function")
			callback();
	});
}

/**
 * 读取本地模板
 * @param ctid
 */
function _loadTemplateData(ctid, callback) {
	// 如果模板更换，则重新计算新机率，折旧率，等级
	// 1. 加载模板
	var template = { evalTemplateId : ctid, evalTemplateName : evalTemplateMap[ctid] }, parts = 5, loadErrMsgs = [];
	var onLoadTemplatePart = function(part, rows, errMsg) {
		--parts;
		template[part] = rows;
		if (errMsg)
			loadErrMsgs.push("读取" + errMsg + "失败");
		if (parts == 0) {
			hidePageLoading();
			if (loadErrMsgs.length) {
				toast(loadErrMsgs.join("\n") + "\n请重新选择模板", 5000);
			} else {
				callback(template);
			}
		}
	};
	
	ap.dbFindAll("Phone_Eval_Template_Detail", {
			success : function(data) {
				onLoadTemplatePart("details", dbList2Array(data.rows));
			}, 
			error : function() {
				onLoadTemplatePart("details", null, "评估等级");
			}
		}, "evalItemId, evalItemName, parentItemId, levelId, newRate, minValue, maxValue, stepValue", "evalTemplateId = " + ctid);
    ap.dbFindAll("Phone_Eval_Template_Detail2", {
                 success : function(data) {
                 onLoadTemplatePart("details2", dbList2Array(data.rows));
                 },
                 error : function() {
                 onLoadTemplatePart("details2", null, "评估等级");
                 }
                 }, "evalItemId, evalItemName, parentItemId, levelId, newRate, value1, value2, value3,value4,value5,mark1,mark2,mark3,mark4,mark5", "evalTemplateId = " + ctid);
	ap.dbFindAll("Phone_Eval_Template_Photo", {
		success : function(data) {
			onLoadTemplatePart("photos", dbList2Array(data.rows));
		}, 
		error : function() {
			onLoadTemplatePart("photos", null, "评估等级");
		}
	}, "photoPartId, photoPartName", "evalTemplateId = " + ctid);
	ap.dbFindAll("Phone_Eval_Template_Level", {
			success : function(data) {
				onLoadTemplatePart("levels", dbList2Array(data.rows));
			}, 
			error : function() {
				onLoadTemplatePart("levels", null, "评估等级");
			}
		}, "evalLevelId, workYear, levelId, minSalvageRate, maxSalvageRate", "evalTemplateId = " + ctid);
	ap.dbFindAll("Phone_Eval_Template_Deprec", {
			success : function(data) {
				onLoadTemplatePart("deprecs", dbList2Array(data.rows));
			}, 
			error : function() {
				onLoadTemplatePart("deprecs", null, "折旧率表");
			}
		}, "evalDeprecId, leaveMonth, minWorkHour, maxWorkHour, deprecRate", "evalTemplateId = " + ctid);
}

/**
 * 加载
 * @param template
 * @param workConditionCodeMap
 * @returns
 */
function onLoadTemplate(template, workConditionCodeMap) {
	trace("details -> " + template.details.length);
    trace("details2 -> " + template.details2.length);
	trace("photos -> " + template.photos.length);
	trace("levels -> " + template.levels.length);
	trace("deprecs -> " + template.deprecs.length);
	
	// 2. 生成初始数据（新机率*0.5）
	_prepareTemplate(template);
	calcEvalFormValues(template);
	
	// 记录上次选择的模板
	$("#lastEvalTemplateId").val(template.evalTemplateId);
	saveCurrentTemplate(template);
	
	applyTemplate();
}

// 切换模版部位照片
function applyTemplate(callback) {
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
		refreshScroll("#content", false, true);
		if (callback)
			callback($("#photoinfo"));
	}, "*", "evalTemplateId=" + tid);
}

function calcEvalFormValues(template) {
	if (!template)
		template = getCurrentTemplate();

	// 按比例计算价格
	prepareForm();
	
	// 3. 根据detail.level1计算总剩余率
	var salvageRateSum = _sumLevel1SalvageRate(template);
	// 4. 根据deprec表计算折旧率
	var workHour = parseInt($("#workHour").val(), 10) || 0;
	var workYear = parseInt($("#workYear").val(), 10) || 0;
	var workConditionId = parseInt($("#machConditionId").val(), 10) || 0;
	var extraWorkYear = (workConditionCodeMap[workConditionId] ? workConditionCodeMap[workConditionId].codeValue : ( $("#moreMonth").val() ? parseFloat($("#moreMonth").val(), 0) : 0) ) || 0;
	var deprec = _calcDeprec(template, workHour, workYear, extraWorkYear);
	// 5. 根据level表计算等级
	var level = _calcLevel(template, workHour, workYear, extraWorkYear, salvageRateSum);
	var levelId = level.levelId;
	var cprice = level.cprice;
	
	var salePrice = parseFloat($("#salePrice").val()) || 0;
	var sysprice = cprice == 0 ? 0 : (salePrice * salvageRateSum * (100 - deprec) * (salvageRateSum / cprice));
	
	trace("workHour = " + workHour + ", workYear = " + workYear + ", workConditionId = " + workConditionId + 
			", extraWorkYear = " + extraWorkYear + ", deprec = " + deprec + ", levelId = " + levelId + 
			", cprice = " + cprice + ", salePrice = " + salePrice + ", sysprice = " + sysprice + ", salvageRate = " + salvageRateSum);
	
	var evalLevel = evalLevelCodeMap[levelId];
	trace("level = " + JSON.stringify(evalLevel));
	trace("levelMap = " + JSON.stringify(evalLevelCodeMap));
	if (evalLevel) {
		$("#evalLevelName").val(evalLevel.codeName);
		$("#evalLevelId").val(evalLevel.codeId);
	}
	$("#salvageRate").val(Math.round(salvageRateSum * 100) / 100);
	$("#deprecRate").val(Math.round(deprec * 100) / 100);
	$("#sysEvalPrice").val(Math.round(sysprice * 100) / 100);
	$("#wSysEvalPrice").val(Math.round(sysprice / 100) / 100);
}

/**
 * 计算评估等级
 * @param template
 * @param workHour 工作小时
 * @param workYear 工作月数
 * @param extraWorkYear 浮动工作年限
 * @param salvageRate 剩余率
 */
function _calcLevel(template, workHour, workYear, extraWorkYear, salvageRate) {
	if (!template)
		return { levelId : null, cprice : 0 };
		
	var wyears = Math.floor(workYear / 12 + extraWorkYear);
	var tLevel = template.levels;
	var levelId = null;
//	var levelId = null;
//	var levelTable = [], levelYearMap = {};
//	$(template.levels).each(function() {
//		var lvl = levelMap[this.workYear];
//		if (!lvl) {
//			lvl = { workYear : }
//		}
//	});
	
	salvageRate = Math.round(salvageRate);
	
	var cprice = 84;
	for(var i=0;i<tLevel.length;i++){
		if(wyears==0 && 1== tLevel[i].workYear){
			if(tLevel[i].levelId == '16001003'){
				cprice = (tLevel[i].minSalvageRate + tLevel[i].maxSalvageRate)/2;
			}
			if( Math.round(salvageRate) >= tLevel[i].minSalvageRate && Math.round(salvageRate) <= tLevel[i].maxSalvageRate){
				levelId = tLevel[i].levelId;
				break;
			}
		}
		if(wyears == tLevel[i].workYear){
			if(tLevel[i].levelId == '16001003'){
				cprice = (tLevel[i].minSalvageRate + tLevel[i].maxSalvageRate)/2;
			}
			if( Math.round(salvageRate) >= tLevel[i].minSalvageRate && Math.round(salvageRate) <= tLevel[i].maxSalvageRate){
				levelId = tLevel[i].levelId;
				break;
			}
		}
		levelId = tLevel[i].levelId;
	}
	return { levelId : levelId, cprice : cprice };
}

/**
 * 计算折旧率
 * @param template
 * @param workHour 工作小时
 * @param workYear 工作月数
 * @param extraWorkYear 浮动工作年限
 */
function _calcDeprec(template, workHour, workYear, extraWorkYear) {
	if (!template)
		return 0;
	
	var deprec = 0, hourdeprec = 0, monthdeprec = 0;
	var deprecByWh = [].concat(template.deprecs).sort(function(a, b) { return a.minWorkHour - b.minWorkHour; }), 
		deprecByWm = [].concat(template.deprecs).sort(function(a, b) { return a.leaveMonth - b.leaveMonth; });  // 按最小工作小时和最小工作年限排序表
	var workMonth = workYear + extraWorkYear * 12;
	
	if (workHour > 0) {
		// 如果工作小时落在两个区间当中，则以工作小时较大的区间为准
		for (var i = 0, d; i < deprecByWh.length; ++i) {
			d = deprecByWh[i];
			if ((d.minWorkHour <= workHour && workHour <= d.maxWorkHour) ||
					(i > 0 && d.minWorkHour > workHour && workHour > deprecByWh[i - 1].maxWorkHour)) {
				hourdeprec = d.deprecRate;
				break;
			}
			hourdeprec = d.deprecRate;
		}
	} 
	if (workMonth > 0) {
		for (var i = 0, d; i < deprecByWm.length; ++i) {
			d = deprecByWm[i];
			if (workMonth <= d.leaveMonth) {
				monthdeprec = d.deprecRate;
				break;
			}
			monthdeprec = d.deprecRate;
		}
	}
	
	deprec = hourdeprec > monthdeprec ? hourdeprec : monthdeprec;
	return deprec;
}

/**
 * 获取评估表的level1新机率合计
 * @param template
 * @returns
 */
function _sumLevel1SalvageRate(template) {
	if (!template)
		return 0;
	
	var salvageRate = 0;
	for (i = 0, j = template.details2; i < j.length; ++i) {
		var d = template.details2[i];
		if (d.levelId == 1)
			salvageRate += d.salvageRate;
	}
	return salvageRate;
}

/**
 * 将模板转换成可以使用的评估表，整理数据<br>
 * salvageValue : 剩余打分值<br>
 * salvageRate : 剩余率
 * @param template
 * @returns
 */
function _prepareTemplate(template, doNotInitValue) {
	var detailMap = {};
	$(template.details2).each(function() {
		detailMap[this.evalItemId] = this;
		this.children = null;
	});
	$(template.details2).each(function() {
		var parent = detailMap[this.parentItemId];
		if (parent) {
			if (!parent.children)
				parent.children = [];
			parent.children.push(this);
		}
		if (this.levelId <= 2 && !doNotInitValue) {
			if (this.newRate === null)
				this.newRate = 0;
			this.salvageValue = 0.5;
			this.salvageRate = this.newRate * this.salvageValue; 
		}
	});
	console.log("_prepareTemplate : " + template.details2.length);
	for (var k in detailMap) {
		if (detailMap.hasOwnProperty(k)) {
			var d = detailMap[k];
			if (d.levelId == 1) {
				// 重新合计level1新机率和剩余率
				var newRate = 0, salvageRate = 0;
				for (var a = 0, b = d.children || [], c = b.length; a < c; ++a) {
					newRate += b[a].newRate || 0;
					salvageRate += b[a].salvageRate || 0;
				}
				d.newRate = newRate;
				d.salvageRate = salvageRate;
			}
		}
	}
}

function loadTemplateDetail(callback) {
	var ts = {};
	var rid = getStore("CURR_REPORT_ID");
	var tid = getStore("CURR_REPT_TEMPID");
	var mode = getStore("CURR_IN_MODE");
	console.log("load template id --> " + tid + " , in mode --> " + mode);
	ts.evalTemplateId = tid;
	
	var onLoadReportDetail = function(tds, rds) {
		var detailsMap = [];
		$(rds).each(function() {
			console.log(this.evalItemName + ":"	+ this.salvageValue);
		});
		$(tds).each(function() {
			this.salvageValue = 0;
			var td = this;
			if (rds) {
				$(rds).each(function() {
					if (this.evalItemId == td.evalItemId) {
						td.salvageValue = this.salvageValue;
					}
				});
			}
			detailsMap[this.evalItemId] = td;
			this.salvageValue = td.salvageValue;
			this.children = null;
		});
		$(tds).each(function() {
			var parent = detailsMap[this.parentItemId];
			if (parent) {
				if (!parent.children)
					parent.children = [];
				parent.children.push(this);
			}
			if (this.levelId <= 2) {
				if (this.newRate === null)
					this.newRate = 0;
				if (this.salvageValue === null)
					this.salvageValue = 0;
				this.salvageRate = this.salvageValue * this.newRate;
			}
		});
		for (var k in detailsMap) {
			if (detailsMap.hasOwnProperty(k)) {
				var d = detailsMap[k];
				if (d.levelId == 1) {
					// 重新合计level1新机率和剩余率
					var newRate = 0, salvageRate = 0;
					for (var a = 0, b = d.children || [], c = b.length; a < c; ++a) {
						newRate += b[a].newRate || 0;
						salvageRate += b[a].salvageRate || 0;
					}
					d.newRate = newRate;
					d.salvageRate = salvageRate;
				}
			}
		}
		ts.details = tds;
		console.log("onLoadReportDetail --> " + ts.details2.length);
		console.log(JSON.stringify(ts.details2));
		saveCurrentTemplate(ts);
		
		if (callback && typeof callback == 'function')
			callback();
	};
	
	ap.dbFindAll("Phone_Eval_Template_Detail2", function(res1) {
		var details = dbList2Array(res1.rows);
		var rds = getStore("CURR_REPT_EVAL_DETAIL");
		
		rds = rds ? eval("(" + rds + ")") : null;
		onLoadReportDetail(details2, rds);
	}, "evalItemId, evalItemName, parentItemId, levelId, newRate", "evalTemplateId=" + tid);
}
