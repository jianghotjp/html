(function($) {
	$.fn.jqzoom = function(G) {
		var H = {
			zoomType: 'standard',
			zoomWidth: 200,
			zoomHeight: 200,
			xOffset: 10,
			yOffset: 0,
			position: "right",
			lens: true,
			lensReset: false,
			imageOpacity: 0.3,
			title: true,
			alwaysOn: false,
			showEffect: 'show',
			hideEffect: 'hide',
			fadeinSpeed: 'fast',
			fadeoutSpeed: 'slow',
			preloadImages: false,
			showPreload: true,
			preloadText: 'Loading zoom',
			preloadPosition: 'center'
		};
		G = G || {};
		$.extend(H, G);
		return this.each(function() {
			var a = $(this);
			var d = a.attr('title');
			$(a).removeAttr('title');
			$(a).css('outline-style', 'none');
			$(a).css('text-decoration', 'none');
			var f = $(a).attr('rel');
			var g = $("img", this);
			var j = g.attr('title');
			g.removeAttr('title');
			var k = new Smallimage(g);
			var l = {};
			var m = 0;
			var n = 0;
			var p = null;
			p = new Loader();
			var q = (trim(d).length > 0) ? d : (trim(j).length > 0) ? j : null;
			var r = new zoomTitle();
			var s = new Largeimage(a[0].href);
			var t = new Lens();
			var u = {};
			var v = false;
			var y = {};
			var z = null;
			var A = false;
			var B = {};
			var C = 0;
			var D = false;
			var E = false;
			var F = false;
			k.loadimage();
			$(this).click(function() {
				return false
			});
			$(this).hover(function(e) {
				B.x = e.pageX;
				B.y = e.pageY;
				k.setpos();
				activate()
			}, function() {
				k.setpos();
				deactivate()
			});
			if (H.alwaysOn) {
				setTimeout(function() {
					activate()
				}, 150)
			}

			function activate() {
				if (!A) {
					k.findborder();
					A = true;
					j = g.attr('title');
					g.removeAttr('title');
					d = a.attr('title');
					$(a).removeAttr('title');
					s = new Largeimage(a[0].href);
					if (!v || $.browser.safari) {
						s.loadimage()
					} else {
						if (H.zoomType != 'innerzoom') {
							z = new Stage();
							z.activate()
						}
						t = new Lens;
						t.activate()
					}
					a[0].blur();
					return false
				}
			};

			function deactivate() {
				if (H.zoomType == 'reverse' && !H.alwaysOn) {
					g.css({
						'opacity': 1
					})
				}
				if (!H.alwaysOn) {
					A = false;
					v = false;
					$(t.node).unbind('mousemove');
					t.remove();
					if ($('div.jqZoomWindow').length > 0) {
						z.remove()
					}
					if ($('div.jqZoomTitle').length > 0) {
						r.remove()
					}
					g.attr('title', j);
					a.attr('title', d);
					$().unbind();
					a.unbind('mousemove');
					C = 0;
					if (jQuery('.zoom_ieframe').length > 0) {
						jQuery('.zoom_ieframe').remove()
					}
				} else {
					if (H.lensReset) {
						switch (H.zoomType) {
							case 'innerzoom':
								s.setcenter();
								break;
							default:
								t.center();
								break
						}
					}
				} if (H.alwaysOn) {
					activate()
				}
			};

			function Smallimage(c) {
				this.node = c[0];
				this.loadimage = function() {
					this.node.src = c[0].src
				};
				this.findborder = function() {
					var a = '';
					a = $(g).css('border-top-width');
					m = '';
					var b = '';
					b = $(g).css('border-left-width');
					n = '';
					if (a) {
						for (i = 0; i < 3; i++) {
							var x = [];
							x = a.substr(i, 1);
							if (isNaN(x) == false) {
								m = m + '' + a.substr(i, 1)
							} else {
								break
							}
						}
					}
					if (b) {
						for (i = 0; i < 3; i++) {
							if (!isNaN(b.substr(i, 1))) {
								n = n + b.substr(i, 1)
							} else {
								break
							}
						}
					}
					m = (m.length > 0) ? eval(m) : 0;
					n = (n.length > 0) ? eval(n) : 0
				};
				this.node.onload = function() {
					a.css({
						'cursor': 'crosshair',
						'display': 'block'
					});
					if (a.css('position') != 'absolute' && a.parent().css('position')) {
						a.css({
							'cursor': 'crosshair',
							'position': 'relative',
							'display': 'block'
						})
					}
					if (a.parent().css('position') != 'absolute') {
						a.parent().css('position', 'relative')
					} else {} if ($.browser.safari || $.browser.opera) {
						$(g).css({
							position: 'absolute',
							top: '0px',
							left: '0px'
						})
					}
					l.w = $(this).width();
					l.h = $(this).height();
					l.pos = $(this).offset();
					l.pos.l = $(this).offset().left;
					l.pos.t = $(this).offset().top;
					l.pos.r = l.w + l.pos.l;
					l.pos.b = l.h + l.pos.t;
					a.height(l.h);
					a.width(l.w);
					if (H.preloadImages) {
						k.setpos();
						s.loadimage()
					}
				};
				return this
			};
			Smallimage.prototype.setpos = function() {
				l.pos = $(g).offset();
				l.pos.l = $(g).offset().left;
				l.pos.t = $(g).offset().top;
				l.pos.r = l.w + l.pos.l;
				l.pos.b = l.h + l.pos.t
			};

			function Lens() {
				this.node = document.createElement("div");
				$(this.node).addClass('jqZoomPup');
				this.node.onerror = function() {
					$(t.node).remove();
					t = new Lens();
					t.activate()
				};
				this.loadlens = function() {
					switch (H.zoomType) {
						case 'reverse':
							this.image = new Image();
							this.image.src = k.node.src;
							this.node.appendChild(this.image);
							$(this.node).css({
								'opacity': 1
							});
							break;
						case 'innerzoom':
							this.image = new Image();
							this.image.src = s.node.src;
							this.node.appendChild(this.image);
							$(this.node).css({
								'opacity': 1
							});
							break;
						default:
							break
					}
					switch (H.zoomType) {
						case 'innerzoom':
							u.w = l.w;
							u.h = l.h;
							break;
						default:
							u.w = (H.zoomWidth) / y.x;
							u.h = (H.zoomHeight) / y.y;
							break
					}
					$(this.node).css({
						width: u.w + 'px',
						height: u.h + 'px',
						position: 'absolute',
						display: 'none',
						borderWidth: 1 + 'px'
					});
					a.append(this.node)
				};
				return this
			};
			Lens.prototype.activate = function() {
				this.loadlens();
				switch (H.zoomType) {
					case 'reverse':
						g.css({
							'opacity': H.imageOpacity
						});
						(H.alwaysOn) ? t.center(): t.setposition(null);
						a.bind('mousemove', function(e) {
							B.x = e.pageX;
							B.y = e.pageY;
							t.setposition(e)
						});
						break;
					case 'innerzoom':
						$(this.node).css({
							top: 0,
							left: 0
						});
						if (H.title) {
							r.loadtitle()
						}
						s.setcenter();
						a.bind('mousemove', function(e) {
							B.x = e.pageX;
							B.y = e.pageY;
							s.setinner(e)
						});
						break;
					default:
						(H.alwaysOn) ? t.center(): t.setposition(null);
						$(a).bind('mousemove', function(e) {
							B.x = e.pageX;
							B.y = e.pageY;
							t.setposition(e)
						});
						break
				}
				return this
			};
			Lens.prototype.setposition = function(e) {
				if (e) {
					B.x = e.pageX;
					B.y = e.pageY
				}
				if (C == 0) {
					var b = (l.w) / 2 - (u.w) / 2;
					var c = (l.h) / 2 - (u.h) / 2;
					$('div.jqZoomPup').show();
					if (H.lens) {
						this.node.style.visibility = 'visible'
					} else {
						this.node.style.visibility = 'hidden';
						$('div.jqZoomPup').hide()
					}
					C = 1
				} else {
					var b = B.x - l.pos.l - (u.w) / 2;
					var c = B.y - l.pos.t - (u.h) / 2
				} if (overleft()) {
					b = 0 + n
				} else if (overright()) {
					if ($.browser.msie && $.browser.version < 7) {
						b = l.w - u.w + n - 1
					} else {
						b = l.w - u.w + n - 1
					}
				}
				if (overtop()) {
					c = 0 + m
				} else if (overbottom()) {
					if ($.browser.msie && $.browser.version < 7) {
						c = l.h - u.h + m - 1
					} else {
						c = l.h - u.h - 1 + m
					}
				}
				b = parseInt(b);
				c = parseInt(c);
				$('div.jqZoomPup', a).css({
					top: c,
					left: b
				});
				if (H.zoomType == 'reverse') {
					$('div.jqZoomPup img', a).css({
						'position': 'absolute',
						'top': -(c - m + 1),
						'left': -(b - n + 1)
					})
				}
				this.node.style.left = b + 'px';
				this.node.style.top = c + 'px';
				s.setposition();

				function overleft() {
					return B.x - (u.w + 2 * 1) / 2 - n < l.pos.l
				}

				function overright() {
					return B.x + (u.w + 2 * 1) / 2 > l.pos.r + n
				}

				function overtop() {
					return B.y - (u.h + 2 * 1) / 2 - m < l.pos.t
				}

				function overbottom() {
					return B.y + (u.h + 2 * 1) / 2 > l.pos.b + m
				}
				return this
			};
			Lens.prototype.center = function() {
				$('div.jqZoomPup', a).css('display', 'none');
				var b = (l.w) / 2 - (u.w) / 2;
				var c = (l.h) / 2 - (u.h) / 2;
				this.node.style.left = b + 'px';
				this.node.style.top = c + 'px';
				$('div.jqZoomPup', a).css({
					top: c,
					left: b
				});
				if (H.zoomType == 'reverse') {
					$('div.jqZoomPup img', a).css({
						'position': 'absolute',
						'top': -(c - m + 1),
						'left': -(b - n + 1)
					})
				}
				s.setposition();
				if ($.browser.msie) {
					$('div.jqZoomPup', a).show()
				} else {
					setTimeout(function() {
						$('div.jqZoomPup').fadeIn('fast')
					}, 10)
				}
			};
			Lens.prototype.getoffset = function() {
				var o = {};
				o.left = parseInt(this.node.style.left);
				o.top = parseInt(this.node.style.top);
				return o
			};
			Lens.prototype.remove = function() {
				if (H.zoomType == 'innerzoom') {
					$('div.jqZoomPup', a).fadeOut('fast', function() {
						$(this).remove()
					})
				} else {
					$('div.jqZoomPup', a).remove()
				}
			};
			Lens.prototype.findborder = function() {
				var a = '';
				a = $('div.jqZoomPup').css('borderTop');
				lensbtop = '';
				var b = '';
				b = $('div.jqZoomPup').css('borderLeft');
				lensbleft = '';
				if ($.browser.msie) {
					var c = a.split(' ');
					a = c[1];
					var c = b.split(' ');
					b = c[1]
				}
				if (a) {
					for (i = 0; i < 3; i++) {
						var x = [];
						x = a.substr(i, 1);
						if (isNaN(x) == false) {
							lensbtop = lensbtop + '' + a.substr(i, 1)
						} else {
							break
						}
					}
				}
				if (b) {
					for (i = 0; i < 3; i++) {
						if (!isNaN(b.substr(i, 1))) {
							lensbleft = lensbleft + b.substr(i, 1)
						} else {
							break
						}
					}
				}
				lensbtop = (lensbtop.length > 0) ? eval(lensbtop) : 0;
				lensbleft = (lensbleft.length > 0) ? eval(lensbleft) : 0
			};

			function Largeimage(a) {
				this.url = a;
				this.node = new Image();
				this.loadimage = function() {
					if (!this.node) this.node = new Image();
					this.node.style.position = 'absolute';
					this.node.style.display = 'none';
					this.node.style.left = '-5000px';
					this.node.style.top = '10px';
					p = new Loader();
					if (H.showPreload && !D) {
						p.show();
						D = true
					}
					document.body.appendChild(this.node);
					this.node.src = this.url
				};
				this.node.onload = function() {
					this.style.display = 'block';
					var w = Math.round($(this).width());
					var h = Math.round($(this).height());
					this.style.display = 'none';
					y.x = (w / l.w);
					y.y = (h / l.h);
					if ($('div.preload').length > 0) {
						$('div.preload').remove()
					}
					v = true;
					if (H.zoomType != 'innerzoom' && A) {
						z = new Stage();
						z.activate()
					}
					if (A) {
						t = new Lens();
						t.activate()
					}
					if ($('div.preload').length > 0) {
						$('div.preload').remove()
					}
				};
				return this
			};
			Largeimage.prototype.setposition = function() {
				this.node.style.left = Math.ceil(-y.x * parseInt(t.getoffset().left) + n) + 'px';
				this.node.style.top = Math.ceil(-y.y * parseInt(t.getoffset().top) + m) + 'px'
			};
			Largeimage.prototype.setinner = function(e) {
				this.node.style.left = Math.ceil(-y.x * Math.abs(e.pageX - l.pos.l)) + 'px';
				this.node.style.top = Math.ceil(-y.y * Math.abs(e.pageY - l.pos.t)) + 'px';
				$('div.jqZoomPup img', a).css({
					'position': 'absolute',
					'top': this.node.style.top,
					'left': this.node.style.left
				})
			};
			Largeimage.prototype.setcenter = function() {
				this.node.style.left = Math.ceil(-y.x * Math.abs((l.w) / 2)) + 'px';
				this.node.style.top = Math.ceil(-y.y * Math.abs((l.h) / 2)) + 'px';
				$('div.jqZoomPup img', a).css({
					'position': 'absolute',
					'top': this.node.style.top,
					'left': this.node.style.left
				})
			};

			function Stage() {
				var a = jQuery(g).offset().left;
				var b = jQuery(g).offset().top;
				this.node = document.createElement("div");
				$(this.node).addClass('jqZoomWindow');
				$(this.node).css({
					position: 'absolute',
					width: Math.round(H.zoomWidth) + 'px',
					height: Math.round(H.zoomHeight) + 'px',
					display: 'none',
					zIndex: 10000,
					overflow: 'hidden'
				});
				switch (H.position) {
					case "right":
						a = (a + $(g).width() + Math.abs(H.xOffset) + H.zoomWidth < $(document).width()) ? (a + $(g).width() + Math.abs(H.xOffset)) : (a - H.zoomWidth - 10);
						topwindow = b + H.yOffset + H.zoomHeight;
						b = (topwindow < $(document).height() && topwindow > 0) ? b + H.yOffset : b;
						break;
					case "left":
						a = (l.pos.l - Math.abs(H.xOffset) - H.zoomWidth > 0) ? (l.pos.l - Math.abs(H.xOffset) - H.zoomWidth) : (l.pos.l + l.w + 10);
						topwindow = l.pos.t + H.yOffset + H.zoomHeight;
						b = (topwindow < $(document).height() && topwindow > 0) ? l.pos.t + H.yOffset : l.pos.t;
						break;
					case "top":
						b = (l.pos.t - Math.abs(H.yOffset) - H.zoomHeight > 0) ? (l.pos.t - Math.abs(H.yOffset) - H.zoomHeight) : (l.pos.t + l.h + 10);
						leftwindow = l.pos.l + H.xOffset + H.zoomWidth;
						a = (leftwindow < $(document).width() && leftwindow > 0) ? l.pos.l + H.xOffset : l.pos.l;
						break;
					case "bottom":
						b = (l.pos.b + Math.abs(H.yOffset) + H.zoomHeight < $(document).height()) ? (l.pos.b + Math.abs(H.yOffset)) : (l.pos.t - H.zoomHeight - 10);
						leftwindow = l.pos.l + H.xOffset + H.zoomWidth;
						a = (leftwindow < $(document).width() && leftwindow > 0) ? l.pos.l + H.xOffset : l.pos.l;
						break;
					default:
						a = (l.pos.l + l.w + H.xOffset + H.zoomWidth < $(document).width()) ? (l.pos.l + l.w + Math.abs(H.xOffset)) : (l.pos.l - H.zoomWidth - Math.abs(H.xOffset));
						b = (l.pos.b + Math.abs(H.yOffset) + H.zoomHeight < $(document).height()) ? (l.pos.b + Math.abs(H.yOffset)) : (l.pos.t - H.zoomHeight - Math.abs(H.yOffset));
						break
				}
				this.node.style.left = a + 'px';
				this.node.style.top = b + 'px';
				return this
			};
			Stage.prototype.activate = function() {
				if (!this.node.firstChild) this.node.appendChild(s.node);
				if (H.title) {
					r.loadtitle()
				}
				document.body.appendChild(this.node);
				switch (H.showEffect) {
					case 'show':
						$(this.node).show();
						break;
					case 'fadein':
						$(this.node).fadeIn(H.fadeinSpeed);
						break;
					default:
						$(this.node).show();
						break
				}
				$(this.node).show();
				if ($.browser.msie && $.browser.version < 7) {
					this.ieframe = $('<iframe class="zoom_ieframe" name="content" frameborder="0"  src="#"  style="background-color: transparent" bgcolor="transparent"></iframe>').css({
						position: "absolute",
						left: this.node.style.left,
						top: this.node.style.top,
						zIndex: 99,
						width: (H.zoomWidth + 2),
						height: (H.zoomHeight)
					}).insertBefore(this.node)
				};
				s.node.style.display = 'block'
			};
			Stage.prototype.remove = function() {
				switch (H.hideEffect) {
					case 'hide':
						$('.jqZoomWindow').remove();
						break;
					case 'fadeout':
						$('.jqZoomWindow').fadeOut(H.fadeoutSpeed);
						break;
					default:
						$('.jqZoomWindow').remove();
						break
				}
			};

			function zoomTitle() {
				this.node = jQuery('<div />').addClass('jqZoomTitle').html('' + q + '');
				this.loadtitle = function() {
					if (H.zoomType == 'innerzoom') {
						$(this.node).css({
							position: 'absolute',
							top: l.pos.b + 3,
							left: (l.pos.l + 1),
							width: l.w
						}).appendTo('body')
					} else {
						$(this.node).appendTo(z.node)
					}
				}
			};
			zoomTitle.prototype.remove = function() {
				$('.jqZoomTitle').remove()
			};

			function Loader() {
				this.node = document.createElement("div");
				$(this.node).addClass('preload');
				$(this.node).html(H.preloadText);
				$(this.node).appendTo(a).css('visibility', 'hidden');
				this.show = function() {
					switch (H.preloadPosition) {
						case 'center':
							loadertop = (l.h - $(this.node).height()) / 2;
							loaderleft = (l.w - $(this.node).width()) / 2;
							$(this.node).css({
								top: loadertop,
								left: loaderleft
							});
							break;
						default:
							var a = this.getoffset();
							break
					}
					$(this.node).css({
						position: 'absolute',
						visibility: 'visible'
					})
				};
				return this
			};
			Loader.prototype.getoffset = function() {
				var o = null;
				o = $('div.preload').offset();
				return o
			}
		})
	}
})(jQuery);

function trim(a) {
	while (a.substring(0, 1) == ' ') {
		a = a.substring(1, a.length)
	}
	while (a.substring(a.length - 1, a.length) == ' ') {
		a = a.substring(0, a.length - 1)
	}
	return a
};