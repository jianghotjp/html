define(function(require, exports, module) {
	var jQuery = require('$');
	require('validateJs');
	jQuery.extend(jQuery.validator.messages, {
		  required: "必填字段",
		  remote: "请修正该字段",
		  email: "请输入正确格式的电子邮件",
		  url: "请输入合法的网址",
		  date: "请输入合法的日期",
		  dateISO: "请输入合法的日期 (ISO).",
		  number: "请输入合法的数字",
		  digits: "只能输入整数",
		  creditcard: "请输入合法的信用卡号",
		  equalTo: "请再次输入相同的值",
		  accept: "请输入拥有合法后缀名的字符串",
		  maxlength: jQuery.validator.format("长度最多为{0}位"),
		  minlength: jQuery.validator.format("长度最少为{0}位"),
		  rangelength: jQuery.validator.format("长度介于{0}位和{1}位之间"),
		  range: jQuery.validator.format("请输入一个介于{0}和{1}之间的值"),
		  max: jQuery.validator.format("请输入一个最大为{0}的值"),
		  min: jQuery.validator.format("请输入一个最小为{0}的值")
		});
	// 电子邮件验证    
	jQuery.validator.addMethod("isEmail", function(value, element) {    
		var re = /^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/; 
		var objExp=new RegExp(re); 
	  return this.optional(element) || objExp.test(value);    
	}, "电子邮件格式不符");		
	// 手机号码验证    
	jQuery.validator.addMethod("isMobile", function(value, element) {    
	  var length = value.length;    
	  return this.optional(element) || (length == 11 && /^1\d{10}$/.test(value));    
	}, "手机号码格式不符");
	// 判断中文字符 
    jQuery.validator.addMethod("isChinese", function(value, element) {       
         return this.optional(element) || /^[\u0391-\uFFE5]+$/.test(value);       
    }, "只能包含中文字符"); 
    // 判断用户名
    jQuery.validator.addMethod("isName", function(value, element) {       
         return this.optional(element) || /^[a-zA-Z\u0391-\uFFE5]+$/.test(value);       
    }, "只能包含中文、英文字符");   
	// 判断帐号
	 jQuery.validator.addMethod("isAccount", function(value, element) {       
         return this.optional(element) || /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(value);       
    }, "只能包含中英文、数字、下划线"); 
    // 判断密码
	 jQuery.validator.addMethod("isPassword", function(value, element) {       
         return this.optional(element) || /^[a-zA-Z0-9]+$/.test(value);       
    }, "只能包含数字和字母");
    // 联系电话(手机/电话皆可)验证   
    jQuery.validator.addMethod("isTel", function(value,element) {   
        var length = value.length;   
        var mobile = /^1\d{10}$/;
        var tel = /^(\d{3,4}-?)?\d{7,9}$/g;       
        return this.optional(element) || tel.test(value) || (length==11 && mobile.test(value));   
    }, "电话号码格式不符"); 
    // 身份证号码验证
    jQuery.validator.addMethod("isIdCardNo", function(value, element) { 
      //var idCard = /^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})(\w)$/;   
      return this.optional(element) || isIdCardNo(value);    
    }, "身份证号码格式不符"); 
    
    //身份证号码的验证规则
    function isIdCardNo(num){ 
        //if (isNaN(num)) {alert("输入的不是数字！"); return false;} 
       var len = num.length, re; 
       if (len == 15) 
       re = new RegExp(/^(\d{6})()?(\d{2})(\d{2})(\d{2})(\d{2})(\w)$/); 
       else if (len == 18) 
       re = new RegExp(/^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})(\w)$/); 
       else {
            //alert("输入的数字位数不对。"); 
            return false;
        } 
       var a = num.match(re); 
       if (a != null) 
       { 
       if (len==15) 
       { 
       var D = new Date("19"+a[3]+"/"+a[4]+"/"+a[5]); 
       var B = D.getYear()==a[3]&&(D.getMonth()+1)==a[4]&&D.getDate()==a[5]; 
       } 
       else 
       { 
       var D = new Date(a[3]+"/"+a[4]+"/"+a[5]); 
       var B = D.getFullYear()==a[3]&&(D.getMonth()+1)==a[4]&&D.getDate()==a[5]; 
       } 
       if (!B) {
            //alert("输入的身份证号 "+ a[0] +" 里出生日期不对。"); 
            return false;
        } 
       } 
       if(!re.test(num)){
            //alert("身份证最后一位只能是数字和字母。");
            return false;
        }
       return true; 
    } 
	    
	    jQuery.validator.setDefaults({
	    	wrapper: "div"
	    });
	
	

});