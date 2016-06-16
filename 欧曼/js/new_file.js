$(function() {
	var views = {
		china: $(".china"),
		province: $(".province"),
		shangjialist: $(".shangjialist"),
		provincelist: $(".provincelist"),
		provinceTab: $(".province_tab"),
		cityTab: $(".city_tab"),
		city: $(".nowcity"),
		citylist: $(".citylist")
	};
	var datasrc = {},
		mapYisheData = {},
		shopdata = [],
		shopUrl = "/ajax/audishangjia.do?city=";
	var events = {
		_provincejson2arr: function(json) {
			var arr = [];
			for (var i in json) {
				arr.push({
					name: i,
					value: json[i]
				})
			}
			return arr
		},
		_createProvinceDom: function() {
			var leftHtml = "",
				rightHtml = "",
				provinceArr = events._provincejson2arr(datasrc.provinceData);
			for (var i = 0, len = provinceArr.length; i < len; i++) {
				var item = provinceArr[i];
				var baseStr = "<div class='province_tab'><a href='javascript:;'' code='" + item.name + "'>" + item.value + "</a></div>";
				if (i < 16) {
					leftHtml += baseStr
				} else {
					rightHtml += baseStr
				}
			}
			$(".provincelist .left_part").html(leftHtml);
			$(".provincelist .right_part").html(rightHtml)
		},
		initProvinceData: function() {
			var url = "/ajax/citylist.do";
			$.get(url, function(data) {
				if (!data) {
					return
				}
				var data = eval("(" + data + ")");
				datasrc.provinceData = data[0];
				datasrc.cityData = data[1];
				events._createProvinceDom()
			})
		},
		chinaEvent: function() {
			views.china.live("click", function() {
				$(".province").hide();
				views.shangjialist.hide();
				$(".nowcity").hide();
				views.citylist.hide();
				events._createChina();
				views.provincelist.show()
			})
		},
		_createChina: function() {
			var map = new BMap.Map("shopmap");
			var point = new BMap.Point(108.953098, 34.2778);
			map.centerAndZoom(point, 5)
		},
		_getByProvince: function() {
			var obj = $(this).find("a"),
				code = $(obj).attr("code"),
				html = $(obj).html();
			if ($(".province").length == 0) {
				var str = '<div class="paddress province"><a href="javascript:void(0)" code="' + code + '">' + html + "</a></div>";
				views.china.after(str)
			} else {
				$(".province a").html(html).attr("code", code);
				$(".province").show()
			}
			views.provincelist.hide();
			$(".nowcity").hide();
			views.shangjialist.hide();
			events._createCityDom($(obj));
			views.citylist.show()
		},
		clickProvince: function() {
			views.provinceTab.live("click", events._getByProvince);
			views.province.live("click", events._getByProvince)
		},
		_createCityDom: function(oProvince) {
			views.citylist.html("");
			views.shangjialist.html("");
			var cityHtml = "",
				cityArr = events._cityjson2arr($(oProvince));
			for (var i = 0, len = cityArr.length; i < len; i++) {
				var item = cityArr[i];
				cityHtml += "<div class='city_tab'><a href='javascript:;' code='" + item.name + "'>" + item.value + "</a></div>"
			}
			views.citylist.html(cityHtml)
		},
		_cityjson2arr: function($oprovince) {
			var code = $oprovince.attr("code");
			var json = datasrc.cityData[code];
			return events._provincejson2arr(json)
		},
		_getBycity: function() {
			var obj = $(this).find("a"),
				code = $(obj).attr("code"),
				html = $(obj).html();
			if ($(".nowcity").length == 0) {
				var str = '<div class="paddress nowcity"><a href="javascript:void(0)" code="' + code + '">' + html + "</a></div>";
				$(".province").after(str)
			} else {
				$(".nowcity a").html(html).attr("code", code);
				$(".nowcity").show()
			}
			views.citylist.hide();
			views.shangjialist.show();
			events._createShangjiaDom($(this).find("a"))
		},
		clickCity: function() {
			views.cityTab.live("click", events._getBycity);
			views.city.live("click", events._getBycity)
		},
		_createShangjiaDom: function($ocity) {
			views.shangjialist.html("");
			var ocity = $ocity.attr("code"),
				url = shopUrl + ocity;
			$.get(url, function(data) {
				if (!data) {
					return
				}
				var data = eval("(" + data + ")");
				var shangjiaHtml = "",
					arrDetailData = [];
				for (var i = 0, len = data.length; i < len; i++) {
					var item = data[i];
					var obj = {
						shopId: item.shopId || Math.random(),
						onsellCount: item.onsellCount,
						address: item.address,
						dealerName: item.dealerName,
						alias: item.dealerName,
						phone: item.phone,
						location: new BMap.Point(item.jingdu, item.weidu)
					};
					arrDetailData.push(obj);
					shangjiaHtml += "<li title='" + obj.dealerName + "' _shopid='" + obj.shopId + "' _onsell=" + obj.onsellCount + " _tel=" + obj.phone + ">" + obj.dealerName + "</li>"
				}
				views.shangjialist.html(shangjiaHtml);
				events._createMap(arrDetailData)
			})
		},
		_createMap: function(arrDetailData) {
			var map = new BMap.Map("shopmap");
			var content = "",
				height = 140;
			map.centerAndZoom(arrDetailData[0].location, 12);
			for (var i = 0, len = arrDetailData.length; i < len; i++) {
				var item = arrDetailData[i];
				var marker = new BMap.Marker(item.location);
				map.addOverlay(marker);
				var phone = item.phone ? '<span class="bubcontent">电话：' + item.phone + "</span><br/>" : "",
					onsell = item.onsellCount ? '<span class="bubcontent">在售车源：' + item.onsellCount + "辆</span><br/>" : "";
				var dhtml = '<div class="shopline"></div>' + phone + onsell + '<span class="bubcontent address">地址：<em>' + item.address + "</em></span>";
				if ($.browser.msie && $.browser.version == "6.0") {
					height = 150
				}
				var shopId = item.shopId > 1 ? '<div class="enterShop"><a href="http://shop.58.com/' + item.shopId + '" target="_blank">进入店铺&gt;</a></div>' : "";
				var infoWindow = new BMap.InfoWindow(dhtml, {
					width: 320,
					height: height,
					title: '<div id="shopTitleDiv"><span class="shoptitle" title="' + item.dealerName + '">' + item.dealerName + "</span>" + shopId + "</div>"
				});
				(function(maker, infoWindow) {
					marker.addEventListener("click", function() {
						this.openInfoWindow(infoWindow)
					})
				})(marker, infoWindow);
				mapYisheData[item.shopId] = marker
			}
			map.enableScrollWheelZoom();
			map.enableContinuousZoom();
			var navigationControl = new BMap.NavigationControl;
			navigationControl.setType(BMAP_NAVIGATION_CONTROL_ZOOM);
			map.addControl(navigationControl)
		},
		showShangjiaInfo: function() {
			$(".shangjialist li").live("click", function() {
				var shopid = $(this).attr("_shopid");
				var shop = mapYisheData[shopid];
				$(shop.domElement).trigger("click")
			})
		},
		_appendStr: function(province, provinceCode, city, cityCode) {
			var province = province || "北京",
				provinceCode = provinceCode || "beijing",
				city = city || "北京",
				cityCode = cityCode || "bj",
				str = '<div class="paddress province"><a href="javascript:void(0)" code="' + provinceCode + '">' + province + "</a></div>" + '<div class="paddress nowcity"><a href="javascript:void(0)" code="' + cityCode + '">' + city + "</a></div>";
			return str
		},
		initCity: function() {
			var url = shopUrl + "bj";
			$.get(url, function(data) {
				if (!data) {
					views.china.trigger("click");
					return false
				} else {
					var str = events._appendStr();
					views.china.after(str);
					$(".nowcity").trigger("click")
				}
			})
		}
	};

	function init() {
		events.initProvinceData();
		events.chinaEvent();
		events.clickProvince();
		events.clickCity();
		events.showShangjiaInfo();
		if ($(".shangjialist").height() > 433) {
			$(this).css("overflow-y", "scroll")
		} else {
			$(this).css("overflow-y", "auto")
		}
	}
	init();
	events.initCity()
});