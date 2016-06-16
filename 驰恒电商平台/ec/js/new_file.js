function toNewPage(href) {
    if (href == "#" || href == "" || href == "javascript:void(0)" || href == "javascript:void(0);" || href == "javascript:;") {
    } else {
        location.href = href;
    }
}

$(function () {
	mui('点击链接有问题的父层，多个用逗号隔开。和jquery选择器写法一样').on('tap', 'a', function (e) {//mui冲突链接
        href = $(this).attr("href");
       s
    });
})
