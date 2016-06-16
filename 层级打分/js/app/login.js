document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
	document.addEventListener("backbutton", onBackKeyDown, false);
	createTables();
}
function  showImg(){
    document.getElementById("wxImg").style.display='block';
}
function hideImg(){
    document.getElementById("wxImg").style.display='none';
}

function login() {
	var userno = $("#userno").val();
	var pwd = $("#password").val();
	var msg = checkLogin(userno, pwd);
	if (!!msg && msg != '') {
		alertMsg(msg);
		return;
	}
	var netWorkStatus = checkConnection();
	if (netWorkStatus > 0) {// online
		showPageLoading();
		var params = { "userNo" : $("#userno").val(), "pwd" : $("#password").val(), "versionName" : VERSION };
		getDataFromServer('pLogin.action', params, function(json) {
			if (!!json.loginErrMsg) {
				alertMsg(json.loginErrMsg);
				hidePageLoading();
				return;
			}
			if (json.version.versionName == VERSION) {
				// 版本号验证
				insertStore("USERLOGINMODE", 1);
				insertStore("USERNAME", json.user.userName);
				insertStore("USERID", json.user.userId);
				insertStore("USERROLEID", json.user.mainRoleId);
				insertStore("USERROLENAME", json.user.mainRoleName);
				insertStore("USERMISALES", json.user.miSales ? 1 : 0);
				insertStore("USERID", json.user.userId);
				insertStore("USERDEALERID", json.user.dealerId);
				insertStore("USERLOGINTIME", json.loginTime);
				
				checkLoginUser(json, params.pwd);
			} else {
				updateSoft(json.version);// 正式
			}
		}, function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("远程计算机无法响应:" + textStatus);
			console.log("error logging in...");
			console.log(XMLHttpRequest.responseText);
			console.log(errorThrown);
			hidePageLoading();
        });
	} else {// offline
		ap.dbFindAll("Phone_Comm_User", function(data) {
			if (data.rows.length > 0) {
				var user = data.rows.item(0);
				if (user.password == $("#password").val()) {
					toast("您现在正在使用离线登录模式");
					setTimeout(function() {
						insertStore("USERLOGINMODE", 0);
						insertStore("USERNAME", user.userName);
						insertStore("USERID", user.userId);
						insertStore("USERROLEID", user.mainRoleId);
						insertStore("USERROLENAME", user.mainRoleName);
						insertStore("USERMISALES", user.isMiSales);
						insertStore("USERDEALERID", user.dealerId);
						
						hidePageLoading();
						window.location.href = "home.html";
					}, 4000);
				} else {
					hidePageLoading();
					alertMsg("用户名或密码错误");
				}
			} else {
				hidePageLoading();
				alertMsg("用户名无效");
			}
		}, "*", "userNo='" + $("#userno").val() + "'");
	}
}

/**
 * 判断用户名和密码是否为空，给出提示
 * @param userno
 * @param pwd
 * @returns {String}
 */
function checkLogin(userno, pwd) {
	var msg = '';
	if (userno == null || userno.trim() == '') {
		$("#userno").addClass("ui-check-error");
		msg += $("#userno").attr("placeholder") + '\n';
	}
	if (pwd == null || pwd.trim() == '') {
		$("#password").addClass("ui-check-error");
		msg += $("#password").attr("placeholder");
	}
	return msg;
}

/**
 * 检查登录用户
 * @param data
 * @param pwd
 */
function checkLoginUser(data, pwd) {
	ap.dbFindAll("Phone_Comm_User", function (res1) {
		if (res1.rows.length == 0) {// 第一次登录
			insertStore("FIRSTLOGIN", 1);
		} else {// 是否相同用户
			insertStore("FIRSTLOGIN", 0);
			insertStore("SAMELOGINUSER", res1.rows.item(0).userId == data.user.userId ? 1 : 0);
			insertStore("SAMEUSERDEALER", res1.rows.item(0).dealerId == data.user.dealerId ? 1 : 0);
		}
		ap.dbFindAll("Phone_Sync_Log", function(res2) {
			if (res2.rows.length > 0) {
				for (var i = 0; i < res2.rows.length; i++) {
					var log = res2.rows.item(i);
					if (log.syncType == 'area') {
						insertStore("SYNC_" + log.syncType, log.syncCount);
					} else {
						insertStore("SYNC_" + log.syncType, log.syncDate);
					}
				}
			}
			checkSync(data, pwd);
		}, "*", "1=1");
	}, "*", "1=1");
}

/**
 * 下载更新(正式)
 */
function updateSoft(version) {
    navigator.notification.confirm("是否更新?", function(index){
        if (index == 1) {
            //andriod  window.location.href = 'http://testdoosim.doosaninfracore.cn:7002/dooums/phone/phoneDownload.jsp';
            window.location.href = 'http://testdoosim.doosaninfracore.cn:7002/dooums/phone/iosDownload.jsp';
        }
    }, "发现新版本", [ '确定', '取消' ]);
}

function checkSync(data, pwd) {
	var param = {
		brandsync : getStore("SYNC_brand") || 0,
		productsync : getStore("SYNC_product") || 0,
		modelsync : getStore("SYNC_model") || 0,
		codesync : getStore("SYNC_code") || 0,
		areasync : getStore("SYNC_area") || 0,
		tempsync : getStore("SYNC_template") || 0
	};
	getDataFromServer('basedata/checkSyncDate.action', param, function(json) {
		json = eval("(" + json + ")");
		ap.dbTruncate("Phone_Comm_User", function(result) {
			ap.dbTruncate("Phone_Comm_User_Role", function(result) {
				ap.dbTruncate("Phone_Comm_User_Func", function(result) {
					ap.dbInsert("Phone_Comm_User", getPhoneUserObject(data.user, pwd), function(result) {
						insertDB("Phone_Comm_User_Role", data.roleList, 0, function() {
							insertDB("Phone_Comm_User_Func", data.funcList, 0, function() {
								hidePageLoading();
								
								insertStore("CANSYNC", json.isSync);
								insertStore("SYNC_area", json.isAreaSync);// 判断是否需要同步区域数据
								
								console.log("首次登录：" + getStore("FIRSTLOGIN"));
								console.log("相同用户：" + getStore("SAMELOGINUSER"));
								console.log("是否同步：" + getStore("CANSYNC"));
								console.log("区域同步：" + getStore("SYNC_area"));
								
								// 首次登录、不同用户登录、发现同步内容
								if (getStore("FIRSTLOGIN") == 1 || getStore("SAMELOGINUSER") == 0 || getStore("CANSYNC") == 1) {
									window.location.href = "sync.html";
								} else {
									window.location.href = "home.html";
								}
							});
						});
					});
				});
			});
		});
	});
}

function getPhoneUserObject(user, pwd) {
	var data = {
			userId: user.userId,
			userNo: user.userNo,
			userName: user.userName,
			password: pwd,
			isUse: user.use ? 1 : 0,
			dealerId: user.dealerId,
			dealerName: user.dealerName,
			dealerDeptId: user.dealerDeptId,
			dealerDeptName: user.dealerDeptName
	};
	return data;
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

$(function() {
	ap.dbFindAll("Phone_Comm_User", function(data) {
		if (data.rows.length > 0) {
			$("#userno").val(data.rows.item(0).userNo);
		}
	}, "userNo", "1=1");
	
	$("#userno, #password").on("change", function() {
		if (!!$(this).val()) {
			if ($(this).hasClass("ui-check-error"))
				$(this).removeClass("ui-check-error");
		}
	});
});