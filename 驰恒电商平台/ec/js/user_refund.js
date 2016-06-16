mui.init({
	pullRefresh: {
		container: '#pullrefresh',
		up: {
			contentdown: '上拉显示更多',
			contentover: '释放立即刷新',
			contentrefresh: '正在刷新...',
			callback: pullupRefresh
		}
	}
});

/**
 * 上拉加载具体业务实现
 */
var count = 0;
function pullupRefresh() {
	setTimeout(function() {
		mui('#pullrefresh').pullRefresh().endPullupToRefresh((++count > 2)); //参数为true代表没有更多数据了。
		var table = document.body.querySelector('.mui-table-view');
		var cells = document.body.querySelectorAll('.mui-table-view li');
		for (var i = cells.length, len = i + 20; i < len; i++) {
			var li = document.createElement('li');
			li.className = '';
			li.innerHTML = '<a class="mui-navigate-right">Item ' + (i + 1) + '</a>';
			table.appendChild(li);
		}
	}, 1500);
}
if (mui.os.plus) {
	mui.plusReady(function() {
		setTimeout(function() {
			mui('#pullrefresh').pullRefresh().pullupLoading();
		}, 1000);
	});
} else {
	mui.ready(function() {
		mui('#pullrefresh').pullRefresh().pullupLoading();
		mui('#pullrefresh').on('tap', 'a', function(e) {
			if ($(this).attr("href")=="#"||$(this).attr("href")==""||$(this).attr("href")==undefined) {
			}else{
				location.href=$(this).attr("href");
			}
		});
	});
}