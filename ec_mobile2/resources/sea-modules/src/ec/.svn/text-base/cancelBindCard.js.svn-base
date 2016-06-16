define(function(require, exports, module) {
	var $ = require('$');
	var mui = require('mui').model;

	function bindEvent() {
		$("#cancelBindCardBtn").bind("click", function() {
			mui.confirm("确认取消绑定？", "", [], function(e) {
				if (e.index == 0) {
					alert("点击了确认");
					console.info("点击了确认");
				}
			});
		});

	}


	(function() {
		mui.init();
		bindEvent();
	})();

});