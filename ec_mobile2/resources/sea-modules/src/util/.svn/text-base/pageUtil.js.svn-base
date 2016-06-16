define(function(require, exports, module) {
	var $ = require('$');

	var ROWS = 10;// 分页时每页显示的条数;
	exports.ROWS = ROWS;

	/*
	 * 得到分页参数
	 */
	exports.getInitPageParams = function() {
		var postData = {};
		var page = 1;
		if ($("#pageHidDiv").length > 0) {
			$("#pageHidDiv").remove();
		}
		var pageHtml = "";
		pageHtml += "<div id='pageHidDiv' style='display:none;'>";
		pageHtml += "<input type='hidden' id='page' name='page' value='" + page
				+ "' />";
		pageHtml += "</div>";
		$("body").append(pageHtml);
		postData.page = page;
		postData.rows = ROWS;
		return postData;
	}

	/*
	 * 点击更多触发
	 */
	exports.getNextPageParams = function() {
		var postData = {};
		var page = 1;
		if ($("#pageHidDiv").length == 0) {
			getInitPageParams();
		}
		page = parseInt($("#page").val()) + 1;
		$("#page").val(page);
		postData.page = page;
		postData.rows = ROWS;
		return postData;
	}

	/*
	 * 设置“更多”按钮
	 */
	exports.setPagination = function(total, rows) {
		var page = $("#page").val() || 1;
		page = parseInt(page);
		var rows = rows || ROWS;
		var total = total || 0;
		var sHtml = "";
		if (page * rows >= total) {
			sHtml = "<span class='norecord_tip'>无更多内容显示</span>";
		} else {
			sHtml = "<a href='javascript:;' id='showMore'><div class='morerecord_tip'>显示更多</div></a>";
		}
		$("#pagination").html(sHtml);
	}

});