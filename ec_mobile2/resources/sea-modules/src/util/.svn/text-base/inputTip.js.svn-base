define(function(require, exports, module) {
	var $ = require('$');

	/**
	 * 输入下拉-点击选择后给输入框赋值
	 */
	function setInputPromptValue(obj) {
		var curValue = $(obj).data("key");
		var promptObj = $(obj).parents("div.input_prompt");
		promptObj.prev().find("input").val(curValue);
		promptObj.find("ul").html("");
	}

	/**
	 * 
	 * 输入下拉-收起下拉框
	 */
	function cancelInputPromptValue(obj) {
		var curValue = $(obj).data("key");
		var promptObj = $(obj).parents("div.input_prompt");
		promptObj.find("ul").html("");

	}

	/**
	 * 
	 * 输入下拉-增加下拉选项
	 */
	function addInputPromptItems(obj, arr) {
		var parentObj = obj.parent();
		var promptObj = parentObj.next("div.input_prompt");

		if (promptObj.length == 0) {
			var sHtml = "<div class='input_prompt'>";
			sHtml += "<ul></ul>";
			sHtml += "</div>";
			parentObj.after(sHtml);
		} else {
			promptObj.find("ul").html("");
		}
		promptObj = $("div.input_prompt");

		var sHtml = "";
		$.each(arr, function(index, obj) {
			if (index > 5) {
				return false;
			}
			var key = obj["key"];
			var value = obj["value"] || key;
			sHtml += "<li data-key='" + key
					+ "' onclick='setInputPromptValue(this);'>" + value + "</li>";
		});
		if (sHtml != "") {
			sHtml += "<li class='cancel_input_prompt' onclick='cancelInputPromptValue(this);'>收起</li>";
		}

		promptObj.find("ul").html(sHtml);
	}

});