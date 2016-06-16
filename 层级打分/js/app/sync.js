var f;//定义标识

document.addEventListener("deviceready", function() {
	$(function() {
		getSyncData();
	});
}, false);

function getSyncData() {
	showPageLoading();
	var p = {};
	if (getStore("SAMEUSERDEALER") == 0) {
		$.extend(p, {
			brandsync : 0,
			productsync : 0,
			modelsync : 0,
			codesync : 0,
			areasync : getStore("SYNC_area") || 0,
			tempsync : 0
		});
	} else {
		$.extend(p, {
			brandsync : getStore("SYNC_brand") || 0,
			productsync : getStore("SYNC_product") || 0,
			modelsync : getStore("SYNC_model") || 0,
			codesync : getStore("SYNC_code") || 0,
			areasync : getStore("SYNC_area") || 0,
			tempsync : getStore("SYNC_template") || 0
		});
	}
	getDataFromServer("basedata/syncData4P.action", p, function(json) {
		hidePageLoading();
		json = eval("(" + json + ")");
		if (getStore("FIRSTLOGIN") == 1) {//首次登录，同步全部
			setTimeout(onSyncCode(json), 300);
		} else if (getStore("SAMELOGINUSER") == 0) {// 切换用户，区分是否是同一个代理商，同步区域(区域品牌、产品、机型)
			f = 2;// 标识，当f = 2时不会再同步模版了，直接进入首页
			if (getStore("SAMEUSERDEALER") == 0) {
				setTimeout(onSyncBrand(json), 300);
			} else {
				setTimeout(onSyncArea(json), 300);
			}
		} else if (getStore("CANSYNC") == 1) {//发现同步内容，同步最新数据
			f = 3;// 标识，当f = 3时表示同步更新项，不会清空原表数据
			setTimeout(onSyncCode(json), 300);
		}
	});
}

function onSyncCode(json) {
	if (json.map.syncCode && json.map.syncCode.length > 0) {
		if (f == 3) {
			insertDB(json.map.syncCode, 0, "Phone_Comm_Code_Detail", "code", "通用代码", function() {
				setTimeout(onSyncBrand(json), 300);
			});
		} else {
			ap.dbTruncate("Phone_Comm_Code_Detail", function() {
				setTimeout(insertDB(json.map.syncCode, 0, "Phone_Comm_Code_Detail", "code", "通用代码", function() {
					setTimeout(onSyncBrand(json), 300);
				}), 300);
			});
		}
	} else {
		setTimeout(onSyncBrand(json), 300);
	}
}

function onSyncBrand(json) {
	if (json.map.syncBrand && json.map.syncBrand.length > 0) {
		if (f == 3) {
			insertDB(json.map.syncBrand, 0, "Phone_Comm_Brand", "brand", "品牌", function() {
				setTimeout(onSyncProduct(json), 300);
			});
		} else {
			ap.dbTruncate("Phone_Comm_Brand", function() {
				setTimeout(insertDB(json.map.syncBrand, 0, "Phone_Comm_Brand", "brand", "品牌", function() {
					setTimeout(onSyncProduct(json), 300);
				}), 300);
			});
		}
	} else {
		setTimeout(onSyncProduct(json), 300);
	}
}

function onSyncProduct(json) {
	if (json.map.syncProduct && json.map.syncProduct.length > 0) {
		if (f == 3) {
			insertDB(json.map.syncProduct, 0, "Phone_Comm_Product", "product", "产品", function() {
				setTimeout(onSyncModel(json), 300);
			});
		} else {
			ap.dbTruncate("Phone_Comm_Product", function() {
				setTimeout(insertDB(json.map.syncProduct, 0, "Phone_Comm_Product", "product", "产品", function() {
					setTimeout(onSyncModel(json), 300);
				}), 300);
			});
		}
	} else {
		setTimeout(onSyncModel(json), 300);
	}
}

function onSyncModel(json) {
	if (json.map.syncModel && json.map.syncModel.length > 0) {
		if (f == 3) {
			insertDB(json.map.syncModel, 0, "Phone_Comm_Model", "model", "机型", function() {
				setTimeout(onSyncTemplate(json), 300);
			});
		} else {
			ap.dbTruncate("Phone_Comm_Model", function() {
				setTimeout(insertDB(json.map.syncModel, 0, "Phone_Comm_Model", "model", "机型", function() {
					setTimeout(onSyncArea(json), 300);
				}), 300);
			});
		}
	} else {
		setTimeout(onSyncArea(json), 300);
	}
}

function onSyncArea(json) {
	if (json.map.syncArea && json.map.syncArea.length > 0) {
		if (f == 2) {
			ap.dbTruncate("Phone_Comm_Area", function() {
				setTimeout(insertDB(json.map.syncArea, 0, "Phone_Comm_Area", "area", "区域", function() {
					window.location.replace("home.html");
				}), 300);
			});
		} else {
			ap.dbTruncate("Phone_Comm_Area", function() {
				setTimeout(insertDB(json.map.syncArea, 0, "Phone_Comm_Area", "area", "区域", function() {
					setTimeout(onSyncTemplate(json), 300);
				}), 300);
			});
		}
	} else {
		if (getStore("SYNC_area") == 1) {
			ap.dbTruncate("Phone_Comm_Area", function() {
				ap.dbDelete("Phone_Sync_Log", { syncType : "area" }, function(result) {
					ap.dbInsert("Phone_Sync_Log", { syncType : "area", syncCount : 0, syncDate : getStore("USERLOGINTIME") }, function(result) {
						setTimeout(onSyncTemplate(json), 300);
					});
				});
			});
		} else {
			setTimeout(onSyncTemplate(json), 300);
		}
	}
}

function onSyncTemplate(json) {
	if (json.map.syncTemplate && json.map.syncTemplate.length > 0) {
		$("#current_progress_number").html("正在同步 [评估模板] 数据: 0%");
		$("#current_progress_bar").css("width", "0%");
		
		if (f == 3) {
			setTimeout(insertTemplateDetail(json.map.syncTemplate, 0), 300);
		} else {
			ap.dbTruncate("Phone_Eval_Template", function() {
				ap.dbTruncate("Phone_Eval_Template_Detail", function() {
                 ap.dbTruncate("Phone_Eval_Template_Detail2", function() {
					ap.dbTruncate("Phone_Eval_Template_Class", function() {
						ap.dbTruncate("Phone_Eval_Template_Level", function() {
							ap.dbTruncate("Phone_Eval_Template_Deprec", function() {
								ap.dbTruncate("Phone_Eval_Template_Photo", function() {
									setTimeout(insertTemplateDetail(json.map.syncTemplate, 0), 300);
								});
							});
						});
					});
				});
			});
         });
		}
	} else {
		window.location.replace("home.html");
	}
}

function insertTemplateDetail(list, index) {
	if (index < list.length) {
		insertDB2(list[index].detail, 0, "Phone_Eval_Template_Detail", function() {
			setTimeout(insertTemplateDetail2(list, index), 300);
		});
	} else {
		ap.dbDelete("Phone_Sync_Log", { syncType : "template" }, function(result) {
			ap.dbInsert("Phone_Sync_Log", { syncType : "template", syncCount : list.length, syncDate : getStore("USERLOGINTIME") }, function(result) {
				window.location.replace("home.html");
			});
		});
	}
}
function insertTemplateDetail2(list, index) {
    if (index < list.length) {
        insertDB2(list[index].detail2, 0, "Phone_Eval_Template_Detail2", function() {
                  setTimeout(insertTemplateClass(list, index), 300);
                  });
    }
}
function insertTemplateClass(list, index) {
	if (index < list.length) {
		insertDB2(list[index].mclass, 0, "Phone_Eval_Template_Class", function() {
			setTimeout(insertTemplateDeprec(list, index), 300);
		});
	}
}

function insertTemplateDeprec(list, index) {
	if (index < list.length) {
		insertDB2(list[index].deprec, 0, "Phone_Eval_Template_Deprec", function() {
			setTimeout(insertTemplateLevel(list, index), 300);
		});
	}
}

function insertTemplateLevel(list, index) {
	if (index < list.length) {
		insertDB2(list[index].level, 0, "Phone_Eval_Template_Level", function() {
			setTimeout(insertTemplatePhoto(list, index), 300);
		});
	}
}

function insertTemplatePhoto(list, index) {
	if (index < list.length) {
		insertDB2(list[index].photo, 0, "Phone_Eval_Template_Photo", function() {
			setTimeout(insertTemplate(list, index), 300);
		});
	}
}

function insertTemplate(list, index) {
	if (index < list.length) {
		ap.dbInsert("Phone_Eval_Template", list[index], function(result) {
			var percent = ((index + 1) / list.length * 100).toFixed(0);
			$("#current_progress_number").html("正在同步 [评估模板] 数据: " + percent + "%");
			$("#current_progress_bar").css("width", percent + "%");
			setTimeout(insertTemplateDetail(list, ++index), 300);
		});
	}
}

function insertDB(list, index, tableName, typeCode, typeName, callback) {
	if (index < list.length) {
		ap.dbInsert(tableName, list[index], function(result) {
			if (typeName) {
				var percent = ((index + 1) / list.length * 100).toFixed(0);
				$("#current_progress_number").html("正在同步 [" + typeName + "] 数据: " + percent + "%");
				$("#current_progress_bar").css("width", percent + "%");
			}
			setTimeout(insertDB(list, ++index, tableName, typeCode, typeName, callback));
		});
	} else {
		if (typeCode) {
			ap.dbDelete("Phone_Sync_Log", { syncType : typeCode }, function(result) {
				ap.dbInsert("Phone_Sync_Log", { syncType : typeCode, syncCount : list.length, syncDate : getStore("USERLOGINTIME") }, function(result) {
					callback();
				});
			});
		}
	}
}

function insertDB2(list, index, tableName, callback) {
	if (index < list.length) {
		ap.dbInsert(tableName, list[index], function(result) {
			setTimeout(insertDB2(list, ++index, tableName, callback), 300);
		});
	} else {
		callback();
	}
}