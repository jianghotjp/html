			if (!Array.prototype.each) {
				/**
				 * 遍历数组执行方法
				 * @param {Object} func
				 */
				Array.prototype.each = function(func) {
					for (var i = 0, j = this.length; i < j; ++i)
						func.call(this[i], this, i);
					return this;
				}
			}
	function extractNode(source, filter) {

		var __NODE_MAP = {};

		function findParentNode(node) {
			return __NODE_MAP[node.__parentid];
		}
		function findNextNode(node) {
			return __NODE_MAP[node.__nextid];
		}
		function findPrevNode(node) {
			return __NODE_MAP[node.__previd];
		}
		function createTreeNode(outlineNode) {
				var child = {};
				switch (outlineNode.type) {
					case "tag":
						child.name = outlineNode.name;
						child.data = outlineNode.raw;
						break;
					case "comment":
						child.name = "#comment";
						child.data = outlineNode.data;
						break;
					case "cdata":
						child.name = "#cdata";
						child.data = outlineNode.data;
						break;
					case "jsp":
						child.name = "jsp";
						child.data = outlineNode.data;
						break;
					case "include":
						child.name = "include";
						child.data = outlineNode.data;
						break;
					case "text":
						child.name = "#text";
						child.data = outlineNode.data.trim();
						// 隐藏空节点
						if (!child.data.replace(/[\s]/g, "").length)
							child.isHidden = true;
						break;
					case "doctype":
						child.name = "#doctype";
						child.data = outlineNode.data;
						break;
					default:
						trace("!! INVALID OUTLINE NODE ->", outlineNode);
						break;
				}
				return child;
			}
			// 恢复大纲的显示状态的辅助方法
		var _childPrevStatMap = {},
			_prevStatId = 0;

		function matchNode(children, nodeStats) {
			var child = children.shift(),
				nodeStat = nodeStats.shift(),
				n = 0;
			while (child && nodeStat) {
				while (child && child.indexNode.outlineNode.type != "tag")
					child = children.shift();
				while (nodeStat && nodeStat.node.type != "tag")
					nodeStat = nodeStats.shift();
				if (child && nodeStat) {
					if (child.indexNode.outlineNode.name == nodeStat.node.name) {
						child.open = nodeStat.open; // match and continue
						++_prevStatId;
						child.prevStatId = _prevStatId;
						_childPrevStatMap[_prevStatId] = nodeStat;
						child = children.shift();
						nodeStat = nodeStats.shift();
					} else {
						trace("fail");
						return; // match failed
					}
				}
			}
		}
		// 遍历代码大纲
		function traverse(nodes, dataParent, pos, depth, prevNodeStats) {
			if (!nodes || !nodes.length)
				return;
			dataParent.children = [];
			for (var i = 0; i < nodes.length; ++i) {
				var node = nodes[i],
					next = nodes[i + 1],
					child = createTreeNode(node);
				child.depth = depth;
				dataParent.children.push(child);
				var line = pos.lines[node.location.line - 1],
					index = line ? line.pos + node.location.col - 1 : -1,
					nextLine = next ? pos.lines[next.location.line - 1] : null,
					nextIndex = nextLine ? nextLine.pos + next.location.col : -1,
					nextLocation = next ? next.location : null;
				// 如果当前节点是最后一个，则向上找到第一个可以定位的节点，并减去所有父节点的结束标签长度
				if (!next) {
					var parents = [],
						parent = node,
						parentNext = null;
					while (!parentNext && (parent = findParentNode(parent))) {
						parents.push(parent);
						parentNext = findNextNode(parent);
					}
					if (parentNext) {
						nextLine = pos.lines[parentNext.location.line - 1];
						nextIndex = nextLine ? nextLine.pos + parentNext.location.col : -1;
					}
					if (nextIndex == -1)
						nextIndex = source.length + 1;
					for (var j = 0; j < parents.length; ++j) {
						var p = parents[j];
						switch (p.type) {
							case "tag":
								// TODO 计算结束标签中的多余字符
								nextIndex -= p.name.length + 3;
								break;
							default:
								trace("INVALID PARENT ->", p);
								break;
						}
					}
					if (!nextLine)
						nextLine = pos.lines[pos.lines.length - 1];
					for (var j = nextLine.lineIndex; j >= 0; --j) {
						var line = pos.lines[j];
						if (line.pos <= nextIndex) {
							nextLocation = {
								line: line.lineIndex + 1,
								col: nextIndex - line.pos
							};
							break;
						}
					}
				}
				child.indexNode = {
					outlineNode: node, // outline节点 
					index: index, // 当前节点索引
					nextIndex: nextIndex, // 下一个节点索引
					location: node.location, // 当前节点位置
					nextLocation: nextLocation // 下一个节点的位置
				};
			}
			if (prevNodeStats) {
				// 正向匹配标签，更新节点展开状态
				// 正向匹配失败后开始逆向匹配
				// 再次失败后结束
				var children = [].concat(dataParent.children),
					nodeStats = [].concat(prevNodeStats);
				matchNode(children, nodeStats);
				matchNode(children.reverse(), nodeStats.reverse());
			}
			for (var i = 0; i < dataParent.children.length; ++i) {
				var child = dataParent.children[i];
				if (child.indexNode.outlineNode.children) {
					var prevStat = _childPrevStatMap[child.prevStatId];
					traverse(child.indexNode.outlineNode.children, child, pos, depth + 1, prevStat ? prevStat.children : null);
				}
			}
		}
	
		
		var handler = new Tautologistics.NodeHtmlParser.HtmlBuilder(
				function(error, dom) {
					if (error) {
						trace(error);
						alert("无法解析文档 : " + error);
					}
				}, {
					includeLocation: true,
					enforceEmptyTags: false // 如果不设置enforceEmptyTags=false，会在解析标签时将空标签的属性加到上层标签 
				}),
		parser = new Tautologistics.NodeHtmlParser.Parser(handler);
		parser.parseComplete(source);

		var _idcounter = 0;
		function makeId(nodes, parent) {
			if (!nodes || !nodes.length)
				return;
			// 为每个节点记录id
			if (parent && !parent.__id) {
				parent.__id = ++_idcounter;
				__NODE_MAP[parent.__id] = parent;
			}
			for (var i = 0; i < nodes.length; ++i) {
				var node = nodes[i];
				// 为每个节点记录id、父id和兄弟id
				if (!node.__id) {
					node.__id = ++_idcounter;
					__NODE_MAP[node.__id] = node;
				}
				if (parent)
					node.__parentid = parent.__id;
				if (i > 0) {
					var prev = nodes[i - 1];
					node.__previd = prev.__id;
					prev.__nextid = node.__id;
				}
				if (node.children)
					makeId(node.children, node);
			}
		}
		makeId(handler.dom);
		
		var lines = source.split("\n"),
			chars = 0;
		lines.each(function(arr, index) {
			arr[index] = {
				text: this,
				length: this.length,
				pos: chars,
				lineIndex: index
			};
			chars += this.length + 1;
		});
		var root = {};
		traverse(handler.dom, root, {lines: lines,line: 0,col: 0,pos: 0}, 0, []);
		
		function t(obj, filter) {
			if (!obj) 
			return null;
			if (filter(obj))
				return obj;
			if (obj.children) {
				for (var i = 0, j = obj.children; i < j.length; ++i) {
					var r = t(j[i], filter);
					if (r){
						return r;
					}
				}
			}
			return null;
		}
		var node = t(root, filter);
		return node;
	}
	
	
//	var node = extractNode(
//		"<!doctype><html><head><meta/></head><body><h1></h1>test...</body></html>",
//		function(i) {
//			if (i.data == 'h1') {
//				return i;
//			}
//		});
//										
//	console.info(node);

	function cutCode(source,r){
		var firstCut=r.indexNode.index;
		var secondCut=r.indexNode.nextIndex;
		var topCode=source.substring(0, firstCut);
		var editCode=source.substring(firstCut, secondCut);
		var bottomCode=source.substring(secondCut,source.length);
		//console.log(topCode,editCode,bottomCode);
		return { head : topCode, body : editCode, tail : bottomCode };
	}
			
			//console.info(cutCode(node));	
	/**
	 * 
	 * @param {Object} source
	 * @param {Object} nodeFilter
	 * @return 
	 */
	function extractTemplateContent(source, nodeFilter) {
		if (!nodeFilter) {
			nodeFilter = function(i) {
				if (i.data == 'div class="help-body"') {
					return i;
				}
			};
		}
		
		var node = extractNode(source, nodeFilter);
		return cutCode(source,node);
	}
	
	