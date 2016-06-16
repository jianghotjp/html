var ref = new Wilddog("https://wild-horse-80543.wilddogio.com/"),
	record = ref.child("c_record"),
	user = [],
	vars = {
		root:"/dogtest"
	};
ref.on("value", function(data) {
	var _siteDate = data.child("site").val(),
		_article = data.child("article").val()[0],
		_user = data.child("user").val();
	$("meta[name=author]").attr("content", _siteDate.author);
	document.title = _article.title + "--" + _siteDate.name;
	$("meta[name=keywords]").attr("content", _article.keyWords);
	$("meta[name=description]").attr("content", _article.description);
	//$("body").html(_article.content);
	user = _user;
	dataReady();
});