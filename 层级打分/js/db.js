function app() {
	this.DB;
}

/**
 * 初始化数据库
 */
app.prototype.dbConnect = function(dbName, dbVersion, dbDesc, dbSize) {
	try {
		if (!window.openDatabase) {
			console.log('Databases are not supported in this browser.');
            return false;
		} else {
			dbName = dbName ? dbName : 'DOOUMS_PHONE_DB';
            dbVersion = dbVersion ? dbVersion : '1.0';
            dbDesc = dbDesc ? dbDesc : 'DOOUMS FOR MOBILE DATABASE';
            dbSize = dbSize ? dbSize : (2 * 1024 * 1024);
            
            this.DB = openDatabase(dbName, dbVersion, dbDesc, dbSize);
            return true;
		}
	} catch (e) {
		if (e == 2) {
            console.log("Invalid database version.");
        } else {
            console.log("Unknown error " + e + ".");
        }
        return false;
	}
}

/**
 * 创建表
 */
app.prototype.dbDefineTable = function(tableName, tableField) {
	if (!tableName || !tableField) {
		console.log('ERROR: function dbDefineTable tableName or tableField is NULL');
		return false;
	}
	
	var fileItem, fieldArr = [], i = 0;
	for (var field in tableField) {
		fieldArr[i] = field + ' ' + tableField[field];
		i++;
	}
	fieldItem = fieldArr.join(",").toString();
	
	var SQL = "CREATE TABLE IF NOT EXISTS " + tableName + ' ( ' + fieldItem + " ) ";
	console.log(SQL);
	
	this.DB.transaction(function(tx) {
		tx.executeSql(SQL, [], function(tx, result) {
			console.log("table create success");
		}, function(tx, error) {
			console.log(error.message);
			return false;
		});
	});
}

function _sqlVariablize(val) {
	if (typeof val == "string") {
		//val = val.replace(/"/g, "\"\"").replace(/\r/g, "\\r").replace(/\n/g, "\\n");
		return val.replace(/'/g, "''");
	} else {
		return val;
	}
}

/**
 * 插入数据
 */
app.prototype.dbInsert = function(tableName, tableField, funName) {
	if (!tableField) {
		console.log('ERROR: function dbInsert tableField is NULL');
		return false;
	}
	
	var fieldKeyArr = [], fieldValueArr = [];
	var fieldKey, fieldValue, i = 0;
	
	for (var field in tableField) {
		if (typeof(tableField[field]) != 'object') {
			fieldKeyArr[i] = field;
			fieldValueArr[i] = tableField[field];
			if (typeof(fieldValueArr[i]) != 'number') {
				fieldValueArr[i] = "'" + _sqlVariablize(fieldValueArr[i]) + "'";
			}
			i++;
		}
	}
	fieldKey = fieldKeyArr.join(",");
	fieldValue = fieldValueArr.join(",");
	
	var SQL = "INSERT INTO " + tableName + " ( ";
	SQL += fieldKey;
	SQL += ' ) VALUES ( ';
	SQL += fieldValue;
	SQL += ' ) ';
	console.log(SQL);
	
	this.DB.transaction(function(tx) {
		tx.executeSql(SQL, [], function(tx, result) {
			if (funName) {
				funName(result);
			} else {
				console.log("Insert Success");
			}
		}, function(tx, error) {
			console.log(error.message);
			return false;
		});
	});
}

/**
 * 查询所有结果
 */
app.prototype.dbFindAll = function(tableName, funName, tableField, dbParams, dbOrder) {
	tableField = tableField || '*';
	dbParams = dbParams || '';
	if (!tableName || !funName) {
		console.log("ERROR: function dbFindAll tableName or funName is NULL");
		return false;
	}
	
	var SQL = 'SELECT ' + tableField + ' FROM ' + tableName + ' WHERE ' + dbParams;
	if (dbOrder != null) {
		SQL += ' ORDER BY ' + dbOrder[0] + ' ' + dbOrder[1];
	}
	console.log(SQL);
	
	var errorCallback = null;
	if (typeof funName == "object") {
		errorCallback = funName.error;
		funName = funName.success;
	}
	
	this.DB.transaction(function(tx) {
		tx.executeSql(SQL, [], function(tx, result) {
			funName(result);
		}, function(tx, error) {
			console.log(error.message);
			if (errorCallback)
				errorCallback(error);
			return false;
		});
	});
}

/**
 * 删除数据
 */
app.prototype.dbDelete = function(tableName, dbParams, funName) {
	if (!tableName || !dbParams) {
		console.log("ERROR: function dbDelete tableName or dbParams is NULL");
		return false;
	}
	
	var paramStr, paramArr = [], i = 0;
	for (var p in dbParams) {
		if (typeof(dbParams[p]) != 'number') {
			dbParams[p] = '"' + dbParams[p] + '"';
		}
		paramArr[i] = p.toString() + '=' + dbParams[p];
		i++;
	}
	paramStr = paramArr.join(" AND ");
		
	var SQL = 'DELETE FROM ' + tableName + ' WHERE ' + paramStr;
	console.log(SQL);
	
	this.DB.transaction(function(tx) {
		tx.executeSql(SQL, [], function(tx, result) {
			if (funName)
				funName(result);
		}, function(tx, error) {
			console.log(error.message);
			return false;
		});
	});
}

/**
 * 更新数据表
 */
app.prototype.dbUpdate = function(tableName, dbParams, dbWhere, funName) {
	var SQL = 'UPDATE ' + tableName + ' SET ';
	var paramArr = [], whereArr = [];
	var paramStr, whereStr;
	var i = 0, n = 0;
	
	for (var p in dbParams) {
		if (typeof(dbParams[p]) != 'number') {
			dbParams[p] = '"' + dbParams[p] + '"';
		}
		paramArr[i] = p.toString() + '=' + dbParams[p];
		i++;
	}
	paramStr = paramArr.join(" , ");
	SQL += paramStr + ' WHERE ';
	
	for (var w in dbWhere) {
		if (typeof(dbWhere[w]) != 'number') {
			dbWhere[w] = '"' + dbWhere[w] + '"';
		}
		whereArr[n] = w.toString() + '=' + dbWhere[w];
		n++;
	}
	whereStr = whereArr.join(" AND ");
	SQL += whereStr;
	console.log(SQL);
	
	this.DB.transaction(function(tx) {
		tx.executeSql(SQL, [], function(tx, result) {
			funName(result);
		}, function(tx, error) {
			console.log(error.message);
			return false;
		});
	});
}

/**
 * 清空数据表
 */
app.prototype.dbTruncate = function(tableName, funName) {
	if (!tableName) {
		console.log("ERROR: function dbTruncate tableName is NULL");
		return false;
	}
	
	this.DB.transaction(function(tx) {
		tx.executeSql('DELETE FROM ' + tableName, [], function(tx, result) {
			console.log("table " + tableName + " truncate success");
			funName(result);
		}, function(tx, error) {
			console.log(error.message);
		});
	});
}

/**
 * 删除数据表
 */
app.prototype.dbDrop = function(tableName) {
	if (!tableName) {
		console.log("ERROR: function dbDrop tableName is NULL");
		return false;
	}
	
	this.DB.transaction(function(tx) {
		tx.executeSql('DROP TABLE ' + tableName, [], function(tx, result) {
			console.log("drop success");
			return true;
		}, function(tx, error) {
			console.log(error.message);
			return false;
		});
	});
}

/* 用户 */
function createTableNamedUser() {
	ap.dbDefineTable("Phone_Comm_User", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		userId: 'INTEGER',
		userNo: 'VARCHAR',
		userName: 'VARCHAR',
		password: 'VARCHAR',
		isUse: 'INTEGER',
		mainRoleId: 'INTEGER',
		mainRoleName: 'VARCHAR',
		dealerId: 'INTEGER',
		dealerName: 'VARCHAR',
		dealerDeptId: 'INTEGER',
		dealerDeptName: 'VARCHAR',
		email: 'VARCHAR',
		tel: 'VARCHAR',
		isMiSales: 'INTEGER'
	});
}

/* 用户角色 */
function createTableNamedRole() {
	ap.dbDefineTable("Phone_Comm_User_Role", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		roleUserId: 'INTEGER',
		userId: 'INTEGER',
		roleId: 'INTEGER',
		roleName: 'VARCHAR',
		isMain: 'INTEGER'
	});
}

/* 用户权限 */
function createTableNamedFunc() {
	ap.dbDefineTable("Phone_Comm_User_Func", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		userId: 'INTEGER',
		bussinessNo: 'VARCHAR',
		bussinessName: 'VARCHAR'
	});
}

/* 品牌 */
function createTableNamedBrand() {
	ap.dbDefineTable("Phone_Comm_Brand", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		brandId: 'INTEGER',
		brandName: 'VARCHAR',
		isSelf: 'INTEGER',
		isUse: 'INTEGER',
		dealerId: 'INTEGER'
	});
}

/* 产品 */
function createTableNamedProduct() {
	ap.dbDefineTable("Phone_Comm_Product", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		productId: 'INTEGER',
		productName: 'VARCHAR',
		brandId: 'INTEGER',
		brandName: 'VARCHAR',
		isSelf: 'INTEGER',
		isUse: 'INTEGER',
		machTypeId: 'INTEGER',
		machTypeName: 'VARCHAR',
		dealerId: 'INTEGER'
	});
}

/* 机型 */
function createTableNamedModel() {
	ap.dbDefineTable("Phone_Comm_Model", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		modelId: 'INTEGER',
		modelName: 'VARCHAR',
		modelNo: 'VARCHAR',
		productId: 'INTEGER',
		productName: 'VARCHAR',
		isUse: 'INTEGER',
		dealerId: 'INTEGER'
	});
}

/* 代码 */
function createTableNamedCode() {
	ap.dbDefineTable("Phone_Comm_Code_Detail", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		codeId: 'INTEGER',
		codeName: 'VARCHAR',
		codeString: 'VARCHAR',
		codeValue: 'REAL',
		isUse: 'INTEGER',
		typeNo: 'VARCHAR',
		orderNum: 'INTEGER'
	});
}

/* 区域 */
function createTableNamedArea() {
	ap.dbDefineTable("Phone_Comm_Area", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		userId: 'INTEGER',
		areaId: 'INTEGER',
		areaName: 'VARCHAR',
		areaCode: 'VARCHAR',
		showCode: 'INTEGER',
		nationId: 'INTEGER',
		regionType: 'INTEGER',
		areaLevel: 'INTEGER',
		parentAreaId: 'INTEGER',
		isCity: 'INTEGER',
		isUse: 'INTEGER'
	});
}

/* 数据同步记录 */
function createTableNamedSyncLog() {
	ap.dbDefineTable("Phone_Sync_Log", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		syncType: 'VARCHAR',
		syncCount: 'INTEGER',
		syncDate: 'VARCHAR'
	});
}

/* 评估模板 */
function createTableNamedTemplate() {
	ap.dbDefineTable("Phone_Eval_Template", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		evalTemplateId: 'INTEGER',
		evalTemplateName: 'VARCHAR',
		isUse: 'INTEGER',
		remark: 'VARCHAR'
	});
}

/* 评估旧模版详细 */
function createTableNamedTemplateDetail() {
	ap.dbDefineTable("Phone_Eval_Template_Detail", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		evalItemId: 'INTEGER',
		evalItemName: 'VARCHAR',
		evalTemplateId: 'INTEGER',
		parentItemId: 'INTEGER',
		levelId: 'INTEGER',
		newRate: 'REAL',
		maxValue: 'INTEGER',
		minValue: 'INTEGER',
		stepValue: 'REAL'
	});
}
/* 评估新模版详细 */
function createTableNamedTemplateDetail2() {
    ap.dbDefineTable("Phone_Eval_Template_Detail2", {
        _id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        evalItemId: 'INTEGER',
        evalItemName: 'VARCHAR',
        evalTemplateId: 'INTEGER',
        parentItemId: 'INTEGER',
        levelId: 'INTEGER',
        newRate: 'REAL',
        mark1 : 'VARCHAR',
        value1: 'REAL',
        mark2 : 'VARCHAR',
        value2: 'REAL',
        mark3 : 'VARCHAR',
        value3: 'REAL',
        mark4 : 'VARCHAR',
        value4: 'REAL',
        mark5 : 'VARCHAR',
        value5: 'REAL'
   });
}

/* 模板适用机种 */
function createTableNamedTemplateClass() {
	ap.dbDefineTable("Phone_Eval_Template_Class", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		evalTemplateId: 'INTEGER',
		classId: 'INTEGER'
	});
}

/* 模板照片部位 */
function createTableNamedTemplatePhoto() {
	ap.dbDefineTable("Phone_Eval_Template_Photo", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		evalTemplateId: 'INTEGER',
		photoPartId: 'INTEGER',
		photoPartName: 'VARCHAR'
	});
}

/* 评估等级 */
function createTableNamedTemplateLevel() {
	ap.dbDefineTable("Phone_Eval_Template_Level", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		evalLevelId: 'INTEGER',
		evalTemplateId: 'INTEGER',
		workYear: 'INTEGER',
		levelId: 'INTEGER',
		minSalvageRate: 'REAL',
		maxSalvageRate: 'REAL'
	});
}

/* 评估折旧率 */
function createTablenamedTemplateDeprec() {
	ap.dbDefineTable("Phone_Eval_Template_Deprec", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		evalDeprecId: 'INTEGER',
		evalTemplateId: 'INTEGER',
		leaveMonth: 'INTEGER',
		minWorkHour: 'INTEGER',
		maxWorkHour: 'INTEGER',
		deprecRate: 'REAL'
	});
}

//客户
function createTableNamedCustomer() {
	ap.dbDefineTable("Phone_Co_Cust", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		custId: 'INTEGER',
		custName: 'VARCHAR',
		buyerTypeId: 'INTEGER',
		buyerTypeDesc:'VARCHAR',
		industryType:'INTEGER',
		industryTypeDesc:'VARCHAR',
		areaId: 'INTEGER',
		custZone:'INTEGER',
		fullAreaName: 'VARCHAR',
		handPhone:'VARCHAR',
		createUserId: 'INTEGER',
		createUserName: 'VARCHAR',
		createDate: 'VARCHAR'
	});
}

//客户保有设备
function createTableNamedCustMachine() {
	ap.dbDefineTable("Phone_Co_Cust_Mach", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		custId: 'INTEGER',
		custMachId: 'INTEGER',
		brandId: 'INTEGER',
		brandName: 'VARCHAR',
		productId: 'INTEGER',
		productName: 'VARCHAR',
		modelId: 'INTEGER',
		modelName: 'VARCHAR',
		serialNo: 'VARCHAR',
		purQty: 'INTEGER',
		isSecondhand: 'INTEGER',
		purDate: 'VARCHAR',
		purAmount: 'REAL',
		isSold: 'INTEGER',
		industryType: 'VARCHAR',
		industryTypeDesc: 'VARCHAR'
	});
}

//客户联系人
function createTableNamedCustContact() {
	ap.dbDefineTable("Phone_Co_Cust_Contact", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		custContactId: 'INTEGER',
		custId: 'INTEGER',
		handPhone: 'VARCHAR',
		contactName: 'VARCHAR',
		bussiness: 'VARCHAR',
		bussinessName: 'VARCHAR',
		isMainContactor: 'INTEGER',
		sex: 'INTEGER',
		identityCard: 'VARCHAR',
		telNoBus: 'VARCHAR',
		postCode: 'VARCHAR',
		birthday: 'VARCHAR',
		postAddress: 'VARCHAR'
	});
}

//评估申请
function createTableNamedApply() {
	ap.dbDefineTable("Phone_Du_Eval_App", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		custId: 'INTEGER',
		custName:'VARCHAR',
		handPhone:'VARCHAR',
		areaName:'VARCHAR',
		appDate:'VARCHAR',
		brandId: 'VARCHAR',
		brandName:'VARCHAR',
		productId:'INTEGER',
		productName:'VARCHAR',
		modelId:'INTEGER',
		modelName:'VARCHAR',
		serialNo:'VARCHAR',
		salePrice:'REAL',
		leaveDate:'VARCHAR',
		workYear:'REAL',
		workHour:'REAL',
		machineAddress:'VARCHAR',
		hasCert:'INTEGER',
		hasContract:'INTEGER',
		hasInvoice:'INTEGER',
        isOrigpain:'INTEGER',
        isStandpart:'INTEGER',
		sourceTypeId:'INTEGER',
		sourceTypeName:'VARCHAR',
		faultDesc:'VARCHAR',
		expTradeDate:'VARCHAR',
		custExpPrice:'REAL',
		evalTemplateId:'INTEGER',
		evalTemplateName:'VARCHAR',
		machConditionId:'INTEGER',
		machConditionName:'VARCHAR',
		
		reProductId:'INTEGER',
		reProductName:'VARCHAR',
		reModelId:'INTEGER',
		reModelName:'VARCHAR',
		reMachinePrice:'REAL',
		
		compBrandId: 'VARCHAR',
		compBrandName:'VARCHAR',
		compProductId:'INTEGER',
		compProductName:'VARCHAR',
		compModelId:'INTEGER',
		compModelName:'VARCHAR',
		compPrice:'REAL',
		compNewPrice:'REAL',
		
		createUserId: 'INTEGER',
		createUserName: 'VARCHAR',
		createDate: 'VARCHAR'
	});
}

function createTableNamedEvalPhoto() {
	ap.dbDefineTable("Phone_Du_Eval_Photo", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		billId: 'INTEGER',
		billType: 'VARCHAR',
		partId: 'INTEGER',
		partName: 'VARCHAR',
		photoPath: 'VARCHAR',
		remark: 'VARCHAR'
	});
}

// 评估报告
function createTableNamedReport() {
	ap.dbDefineTable("Phone_Du_Eval_Report", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		reportId: 'INTEGER',
		appId: 'INTEGER',
		appNo: 'VARCHAR',
		custId: 'INTEGER',
		custName: 'VARCHAR',
        evalUserName: 'VARCHAR',
        evalUserId: 'INTEGER',
		handPhone: 'VARCHAR',
		areaId: 'INTEGER',
		areaName: 'VARCHAR',
		evalDate: 'VARCHAR',
		
		brandId: 'INTEGER',
		brandName: 'VARCHAR',
		productId: 'INTEGER',
		productName: 'VARCHAR',
		modelId: 'INTEGER',
		modelName: 'VARCHAR',
		machId: 'INTEGER',
		serialNo: 'VARCHAR',
		frameNo: 'VARCHAR',
		engineNo: 'VARCHAR',
		isEngineReman: 'INTEGER',
		leaveDate: 'VARCHAR',
		workHour: 'INTEGER',
		workYear: 'INTEGER',
		machineAddress: 'VARCHAR',
		machConditionId: 'INTEGER',
		machConditionName: 'VARCHAR',
		isCertNo: 'INTEGER',
		isContractNo: 'INTEGER',
		isInvoiceNo: 'INTEGER',
        isOrigpain: 'INTEGER',
        isStandpart: 'INTEGER',
		salePrice: 'REAL',
		sourceTypeId: 'INTEGER',
		sourceTypeName: 'VARCHAR',
		faultDesc: 'VARCHAR',
		
		expTradeDate: 'VARCHAR',
		reProductId: 'INTEGER',
		reProductName: 'VARCHAR',
		reModelId: 'INTEGER',
		reModelName: 'VARCHAR',
		reMachinePrice: 'REAL',
		compBrandId: 'INTEGER',
		compBrandName: 'VARCHAR',
		compProductId: 'INTEGER',
		compProductName: 'VARCHAR',
		compModelId: 'INTEGER',
		compModelName: 'VARCHAR',
		compPrice : 'REAL',
		compNewPrice : 'REAL',
		custExpPrice: 'REAL',
		
		evalTemplateId: 'INTEGER',
		evalTemplateName: 'VARCHAR',
		salvageRate: 'REAL',
		deprecRate: 'REAL',
		evalAffPrice: 'REAL',
		evalLevelId: 'INTEGER',
		evalLevelName: 'VARCHAR',
		sysEvalPrice: 'REAL',
		evalPrice: 'REAL',
		marketPrice: 'REAL',
		isOnScene: 'INTEGER',
		
		createUserId: 'INTEGER',
		createUserName: 'VARCHAR',
		createDate: 'VARCHAR',
		isEval: 'INTEGER',
		remark: 'VARCHAR'
	})
}

function createTableNamedReportDetail() {
	ap.dbDefineTable("Phone_Du_Eval_Report_Detail", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		seqId: 'INTEGER',
		reportId: 'INTEGER',
		evalItemId: 'INTEGER',
		evalItemName: 'VARCHAR',
		salvageRate: 'REAL'
	});
}


/* 设备登记/设备卡片 */
function createTableNamedMachReg() {
	ap.dbDefineTable("Phone_Used_Mach_Reg", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		machRegId: 'INTEGER',
		brandId: 'INTEGER',
		brandName: 'VARCHAR',
		productId: 'INTEGER',
		productName: 'VARCHAR',
		modelId: 'INTEGER',
		modelName: 'VARCHAR',
		machId: 'INTEGER',
		serialNo: 'VARCHAR',
		frameNo: 'VARCHAR',
		engineNo: 'VARCHAR',
		isEngineReman: 'INTEGER',
		leaveDate: 'VARCHAR',
		serviceEndDate: 'VARCHAR',
		remark: 'VARCHAR',
		createUserId: 'INTEGER',
		createUserName: 'VARCHAR',
		createDate: 'VARCHAR'
	});
}

function createTableNamedLocalStorage() {
	ap.dbDefineTable("Phone_Local_Storage", {
		_id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
		fileName: 'VARCHAR',
		filePath: 'VARCHAR',
		fileType: 'VARCHAR',
		fileSize: 'VARCHAR',
		modelName: 'VARCHAR',
		status: 'INTEGER',
		createData: 'VARCHAR'
	});
}

var ap = new app();
var DBCONNECT = ap.dbConnect("DOOUMS_PHONE_DB", "1.0", "DOOUMS FOR MOBILE DATABASE", 2 * 1024 * 1024);