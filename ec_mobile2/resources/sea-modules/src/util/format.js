define(function(require, exports, module) {
	var $ = require('$');

	/**
	 * html代码转义
	 * 
	 * @param str
	 * @returns {String}
	 */
	exports.htmlJsEncode = function(str) {
		var s = "";
		if (str == null || str.length == 0) {
			return "";
		}
		s = str.replace(/&/g, "&amp;");
		s = s.replace(/</g, "&lt;");
		s = s.replace(/>/g, "&gt;");
		s = s.replace(/ /g, "&nbsp;");
		s = s.replace(/\'/g, "&#39;");
		s = s.replace(/\"/g, "&quot;");
		s = s.replace(/\n/g, "<br/>");
		s = s.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
		return s;
	}

	exports.htmlJsDecode = function(str) {
		var s = "";
		if (str == null || str.length == 0) {
			return "";
		}
		s = str.replace(/&gt;/g, "&");
		s = s.replace(/&lt;/g, "<");
		s = s.replace(/&gt;/g, ">");
		s = s.replace(/&nbsp;/g, " ");
		s = s.replace(/&#39;/g, "\'");
		s = s.replace(/&quot;/g, "\"");
		s = s.replace(/<br>/g, "\n");
		return s;
	}

	/**
	 * 格式化货币
	 */
	exports.formatCurrency = function(value) {
		value = value + "";
		if (/[^0-9\.]/.test(value)) {
			return "0";
		}
		value = value.replace(/^(\d*)$/, "$1.");
		value = (value + "00").replace(/(\d*\.\d\d)\d*/, "$1");
		value = value.replace(".", ",");
		var re = /(\d)(\d{3},)/;
		while (re.test(value)) {
			value = value.replace(re, "$1,$2");
		}
		value = value.replace(/,(\d\d)$/, ".$1");
		return "￥" + value.replace(/^\./, "0.");
	}

});