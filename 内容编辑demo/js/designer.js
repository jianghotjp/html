/**
 * ui设计器
 * 事件: change : 手动编辑产生改变
 *      redesign : 通过编辑器修改产生改变
 */
var designer = {
    _container : null,
    /*
     * 初始化编辑器
     * @param {DOM Object} designerContainer 
     */
    initUI : function(designerContainer) {
        this._container = designerContainer;
        this._text = $("<textarea class='editor-text' readonly='readonly'>no file opened</textarea>").appendTo(this._container);
    },
    
    /**
     * { webroot : "", plugins : [ "", ... ] }
     * plugin脚本应该主动调用designer.plugin.register方法来注册自身
     */
    _config : null,
    /**
     * 初始化环境，加载插件
     */
    init : function(config, success, failed) {
        trace("designer.init ->", config);
        this._config = config || {};
        
        // codemirror默认选项
        this._config.codeMirrorOptions = $.extend({
            lineNumbers : true,
            styleActiveLine : true,
            matchBrackets : true,
            theme : "vibrant-ink",//"base16-dark"
            extraKeys : {
                "Ctrl-S" : function(cm) {
                    designer.save();
                }
            }
        }, this._config.codeMirrorOptions);
        
        // 加载插件
        var plugins = config.plugins || [],
            failedPlugins = [];
        function loadNextPlugin() {
            var plugin = plugins.shift();
            if (plugin) {
                // load
                dom.addScript(
                        document, 
                        config.root + plugin, 
                        null, 
                        function() {
                            loadNextPlugin();
                        },
                        function(src) {
                            failedPlugins.push(src);
                            loadNextPlugin();
                        });
            } else {
                if (failedPlugins.length) {
                    if (failed)
                        failed(failedPlugins);
                    else
                        alert(["无法加载插件:"].concat(failedPlugins).join("\n"));
                } else if (success) {
                    success();
                }
            }
        }
        loadNextPlugin();
    },
    
    getCodeMirrorOptions : function() {
        return this._config.codeMirrorOptions;
    },
    
    /**
     * 加载文件
     */
    loadFile : function(file, success) {
        trace("load file -> " + file);
        $.ajax({
            url : designer._config.root + "designer/$/src/" + file,
            type : "GET",
            dataType : "text",
            success : function(text) {
                designer.setSource(file, text);
                designer.outline.build();
                if (success)
                    success(text);
            },
            error : function() {
                alert("cannot load source file : " + file);
            }
        });
    },

    _getFileMode : function(file) {
        var pslash = file.lastIndexOf('/'),
            pdot = file.lastIndexOf('.');
        if (pdot != -1 && pdot > pslash) {
            var mode = MODE_COLOR_EXT_MAP[file.substring(pdot + 1).toLowerCase()];
            return mode ? mode.mode : "htmlmixed";
        }
        return "htmlmixed";
    },
    
    _source : "",
    _editor : null,
    _text : null,
    setSource : function(file, source) {
        this._source = source;
        this._text.hide().val(source);
        
        if (this._editor)
            $(this._editor.getWrapperElement()).remove();
        
        // code mirror
        var opts = $.extend({
                                mode : this._getFileMode(file),
                                _file : file
                            }, this.getCodeMirrorOptions());
        this._editor = CodeMirror.fromTextArea(this._text[0], opts);
        this._editor.on("change", function(codeMirror, obj) {
                                        // TODO 内容改变时重新解析大纲
                                        if (!codeMirror._changed && (codeMirror._changed = 1)) {
                                            trace("code changed");
                                            $(designer).trigger("change");
                                        }
                                    });
        $(this._editor.getWrapperElement()).show();
    },

    /**
     * 生成源码大纲
     */
    getSourceOutline : function() {
        if (!this._editor)
            return null;
        var source = this.getSourceText(),
            handler = new Tautologistics.NodeHtmlParser.HtmlBuilder(
                function(error, dom) {
                    if (error) {
                        trace(error);
                        alert("无法解析文档 : " + error);
                    }
                }, 
                { 
                    includeLocation : true, 
                    enforceEmptyTags : false  // 如果不设置enforceEmptyTags=false，会在解析标签时将空标签的属性加到上层标签 
                }),   
            parser = new Tautologistics.NodeHtmlParser.Parser(handler);
        parser.parseComplete(source);
        //trace(JSON.stringify(handler.dom, null, 2));
        return handler.dom;
    },
    /**
     * 获取源码
     */
    getSourceText : function() {
        return this._editor.getValue();
    },
    setSourceText : function(text) {
        if (this._editor)
            this._editor.setValue(text);
    },
    getEditor : function() {
        return this._editor;
    },
    
    // global commands
    save : function() {
        
    },
    preview : function() {
        
    },
    run : function() {
        
    },
    fireRedesign : function() {
        $(designer).trigger("redesign");
    }
};



/**
 * 设计器插件管理
 * 必须实现的方法：
 *   getName() : 提供一个插件名称
 * 可选实现方法：
 *   getResources() : 提供插件所需样式表和脚本的路径列表
 *   accepts(outlineNode) : 检查指定节点是否可以被当前插件编辑
 *   getNodeMenuItems(outlineNode) : 返回指定节点可用的菜单项列表 [ { text : "", callback : function(outlineNode) {} }, ... ]
 */
designer.plugin = {
    _plugins : [],
    _pluginMap : {},  // name -> plugin
    /**
     * 注册插件，插件需要自己调用此方法
     */
    register : function(plugin) {
        var pname = plugin.getName();
        trace("designer.plugin.register -> " + pname, plugin);
        if (this._pluginMap[pname])
            trace("plugin already registered, overwriting the old plugin");
        this._plugins.push(plugin);
        this._pluginMap[pname] = plugin;
        return plugin;
    },
    /**
     * 获取插件列表
     */
    getPlugins : function() {
        return this._plugins;
    },
    getPlugin : function(name) {
        return this._plugins.first(function() { return this.getName() == name; });
    },
    
    /**
     * 通过代码大纲的节点定义获取匹配的插件列表
     */
    getNodeMatchingPlugins : function(node) {
        trace("plugin.getNodeMatchingPlugins ->", node);
        
        var matches = [];
        this._plugins.each(function() {
            if (this.accepts(node))
                matches.push(this);
        });
        return matches;
    }
};


/* code outline */
designer.outline = {
    _OUTLINE_TREE : null,
    _OUTLINE_TREE_MENU : null, 
    _OUTLINE_TREE_MENU_CURRENT_NODE : null,
    _OUTLINE_TREE_SETTING : {
        view : {
            showLine : false
        },
        data : {
            simpleData : {
                enable : true
            }
        },
        callback : {
            onNodeCreated : function(event, treeId, treeNode) {
                if (!treeNode.indexNode || !treeNode.indexNode.outlineNode)
                    throw new Error("Invalid node hierarchy, a treenode should contain a indexNode with a outlineNode inside");
                treeNode.indexNode.outlineNode.treeNodeId = treeNode.tId;
            },
            onClick : function(event, treeId, treeNode) {
                if (!isGlobalClick())
                    return;
                
                var nodeInfo = treeNode.indexNode;
                if (nodeInfo.index != -1) {
                    // 选定内容
                    var pos0 = { line : nodeInfo.location.line - 1, ch : nodeInfo.location.col - 1 },
                        pos1;
                    if (nodeInfo.nextLocation) {
                        pos1 = { line : nodeInfo.nextLocation.line - 1, ch : nodeInfo.nextLocation.col - 1 };
                    } else {
                        var lines = _OUTLINE_TREE.setting.treeObj.data("lines");
                        pos1 = lines.length ? { line : lines.length - 1, ch : lines[lines.length - 1].length - 1 } : pos0;
                    }
                    var editor = designer.getEditor();
                    editor.setCursor(pos0);
                    editor.setSelection(pos1, pos0);
                    editor.focus();
                } else {
                    trace("invalid location");
                }
            },
            onDblClick : function(event, treeId, treeNode) {
                if (!treeNode.indexNode)
                    return;
                // 编辑节点
                var mps = designer.plugin.getNodeMatchingPlugins(treeNode.indexNode.outlineNode);
                trace(mps);
            },
            onRightClick : function(event, treeId, treeNode) {
                if (!treeNode || !isGlobalClick())
                    return;
                
                designer.outline._OUTLINE_TREE_MENU_CURRENT_NODE = treeNode;
                if (!designer.outline._OUTLINE_TREE_MENU) {
                    var menuHtml = [];
                    menuHtml.push("<div id='root-menu' class='easyui-menu'>");
                    // 添加各插件的子菜单
                    var plugins = designer.plugin.getPlugins();
                    plugins.each(function() {
                        menuHtml.push("<div _plugin='" + this.getName() + "'>" + this.getName() + "</div>");
                    });
                    if (plugins.length)
                        menuHtml.push("<div class='menu-sep'></div>");
                    menuHtml.push("<div>" + 
                                    "<span>Insert from clipboard</span>" + 
                                    "<div style='width:150px;'>" + 
                                        "<div _cmd='InsertFirstChild'>First child</div>" +
                                        "<div _cmd='InsertLastChild'>Last child</div>" + 
                                        "<div _cmd='InsertSiblingBefore'>Sibling before</div>" +
                                        "<div _cmd='InsertSiblingAfter'>Sibling after</div>" +
                                    "</div>" + 
                                  "</div>");
                    menuHtml.push("<div _cmd='CopyHTML'>Copy as HTML</div>");
                    menuHtml.push("<div _cmd='Delete'>Delete</div>");
                    menuHtml.push("<div _cmd='Properties'>Properties</div>");
                    menuHtml.push("</div>");
                    designer.outline._OUTLINE_TREE_MENU = $(menuHtml.join(""))
                                            .appendTo($("#top"))
                                            .menu({
                                                onClick : function(item) {
                                                    if (designer.outline._OUTLINE_TREE_MENU_CURRENT_NODE) {
                                                        var cmd = item.target.getAttribute("_cmd"),
                                                            plugin = item.target.getAttribute("_plugin");
                                                        if (cmd) {
                                                            var treeNode = designer.outline._OUTLINE_TREE_MENU_CURRENT_NODE,
                                                                indexNode = treeNode.indexNode;
                                                            // 执行通用命令
                                                            if (designer.editor["exec" + cmd]) {
                                                                trace("exec '" + cmd + "':", treeNode);
                                                                designer.editor["exec" + cmd].call(designer.editor, indexNode.outlineNode);
                                                            } else {
                                                                alert("未知的命令" + cmd);
                                                            }
                                                        } else if (plugin) {
                                                            // 执行插件命令
                                                            trace("exec plugin command");
                                                            var pl = designer.plugin.getPlugin(plugin);
                                                            trace(pl);
                                                        }
                                                    }
                                                }
                                            });
                    $.parser.parse("#top");
                }
                
                // 构造插件子菜单
                var plugins = designer.plugin.getPlugins();
                plugins.each(function() {
                    var plugin = this,
                        parentMenuEl = designer.outline._OUTLINE_TREE_MENU.children("[_plugin='" + this.getName() + "']")[0],
                        parentMenuItem = designer.outline._OUTLINE_TREE_MENU.menu("getItem", parentMenuEl);
                    
                    // 映射已有菜单项
                    var oldMenuItemMap = {};
                    if (parentMenuItem.target.submenu) {
                        $(parentMenuItem.target.submenu).children(".menu-item").hide().each(function() {
                            var text = $(this).children(".menu-text").text();
                            oldMenuItemMap[text] = this;
                        });
                    }
                    
                    // 添加新增的菜单项
                    var menuItems = this.getNodeMenuItems(designer.outline._OUTLINE_TREE_MENU_CURRENT_NODE.indexNode.outlineNode);
                    function appendMenuItems(menuItems, parentMenuItem) {
                        if (!menuItems || !parentMenuItem)
                            return;
                        for (var i = 0; i < menuItems.length; ++i) {
                            var mi = menuItems[i],
                                oldMenuItem = oldMenuItemMap[mi.text];
                            if (oldMenuItem) {
                                $(oldMenuItem).show();
                            } else {
                                designer.outline._OUTLINE_TREE_MENU.menu("appendItem", {
                                    parent : parentMenuItem.target,
                                    text : mi.text,
                                    onclick : function() {
                                        mi.onClick.call(parentMenuItem, designer.outline._OUTLINE_TREE_MENU_CURRENT_NODE.indexNode.outlineNode, plugin);
                                    }
                                });
                            }
                            //appendMenuItems(mi.children, mi);
                        }
                    }
                    appendMenuItems(menuItems, parentMenuItem);
                });
                
                // 去掉每组最上面菜单项的分割线
                designer.outline._OUTLINE_TREE_MENU
                    .children(".menu-item").removeClass("menu-no-top").end()
                    .children(".menu-item:eq(0)").addClass("menu-no-top").end()
                    .children(".menu-sep").next(".menu-item").addClass("menu-no-top");
    
                designer.outline._OUTLINE_TREE_MENU.menu("show", {
                    left: event.pageX,
                    top: event.pageY
                });
            }
        }
    },
    
    // 节点映射  id -> { __id : <N>, __parentid : <N1>, __nextid : <N2>, __previd : <N3>, ... }
    __NODE_MAP : {},
    findParentNode : function(node) {
        return this.__NODE_MAP[node.__parentid];
    },
    findNextNode : function(node) {
        return this.__NODE_MAP[node.__nextid];
    },
    findPrevNode : function(node) {
        return this.__NODE_MAP[node.__previd];
    },
    
    /**
     * 生成大纲
     */
    build : function() {
        // 获取大纲目前显示状态
        function extractNodes(nodes, stats) {
            if (!nodes || !nodes.length)
                return;
            for (var i = 0; i < nodes.length; ++i) {
                var node = nodes[i];
                if (node.isHidden)
                    continue;
                var stat = { node : node.indexNode.outlineNode, depth : node.depth, open : node.open, tid : node.tid };
                stats.push(stat);
                if (node.children) {
                    stat.children = [];
                    extractNodes(node.children, stat.children);
                }
            }
        }
        // 上一次大纲的显示状态，根据上一次的状态展开原先已展开的节点
        var treeStats = [];
        if (this._OUTLINE_TREE)
            extractNodes(this._OUTLINE_TREE.getNodes(), treeStats);
        
        var outline = designer.getSourceOutline(),   // outline
            sourceText = designer.getSourceText();   // source text
        trace("outline ->", outline);
        
        // 为每个节点生成id、父id和兄弟id，并映射到map，便于查找
        var _idcounter = 0;
        this.__NODE_MAP = {};
        function makeId(nodes, parent) {
            if (!nodes || !nodes.length)
                return;
            // 为每个节点记录id
            if (parent && !parent.__id) {
                parent.__id = ++_idcounter;
                designer.outline.__NODE_MAP[parent.__id] = parent;
            }
            for (var i = 0; i < nodes.length; ++i) {
                var node = nodes[i];
                // 为每个节点记录id、父id和兄弟id
                if (!node.__id) {
                    node.__id = ++_idcounter;
                    designer.outline.__NODE_MAP[node.__id] = node;
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
        makeId(outline);
        
        
        // 恢复大纲的显示状态的辅助方法
        var _childPrevStatMap = {}, _prevStatId = 0;
        function matchNode(children, nodeStats) {
            var child = children.shift(), nodeStat = nodeStats.shift(), n = 0;
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
                    var parents = [], parent = node, parentNext = null;
                    while (!parentNext && (parent = designer.outline.findParentNode(parent))) {
                        parents.push(parent);
                        parentNext = designer.outline.findNextNode(parent);
                    }
                    if (parentNext) {
                        nextLine = pos.lines[parentNext.location.line - 1];
                        nextIndex = nextLine ? nextLine.pos + parentNext.location.col : -1;
                    }
                    
                    if (nextIndex == -1)
                        nextIndex = sourceText.length + 1;
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
                            nextLocation = { line : line.lineIndex + 1, col : nextIndex - line.pos };
                            break;
                        }
                    }
                }
                
                child.indexNode = { 
                        outlineNode : node,                                // outline节点 
                        index : index,                              // 当前节点索引
                        nextIndex : nextIndex,                      // 下一个节点索引
                        location : node.location,                   // 当前节点位置
                        nextLocation : nextLocation                 // 下一个节点的位置
                    };
            }
            
            if (prevNodeStats) {
                // 正向匹配标签，更新节点展开状态
                // 正向匹配失败后开始逆向匹配
                // 再次失败后结束
                var children = [].concat(dataParent.children), nodeStats = [].concat(prevNodeStats);
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
    
        var lines = sourceText.split("\n"), chars = 0;
        lines.each(function(arr, index) {
            arr[index] = { text : this, length : this.length, pos : chars, lineIndex : index };
            chars += this.length + 1;
        });
        
        var root = {};
        traverse(outline, root, { lines : lines, line : 0, col : 0, pos : 0 }, 0, treeStats);
        
        var tree = $("#s_outline").addClass("ztree").data("lines", lines);
        if (this._OUTLINE_TREE)
            this._OUTLINE_TREE.destroy();
        this._OUTLINE_TREE = $.fn.zTree.init(tree.empty(), this._OUTLINE_TREE_SETTING, root.children);
    },
    
    /**
     * 销毁大纲ztree
     */
    destroy : function() {
        if (this._OUTLINE_TREE_MENU) {
            this._OUTLINE_TREE_MENU.menu("destroy");
            this._OUTLINE_TREE_MENU = null;
        }
    },
    
    _expandStatus : false,
    /**
     * 切换大纲展开/收缩 
     */
    toggleExpand : function() {
        if (!this._OUTLINE_TREE)
            return;
        this._expandStatus = !this._expandStatus;
        this._OUTLINE_TREE.expandAll(this._expandStatus);
    },
    
    /**
     * 在代码大纲中选定光标当前所在节点
     */
    findInOutline : function() {
        var editor = designer.getEditor(),
            pos = editor.getCursor(),
            index = editor.indexFromPos(pos),
            nodes = this._OUTLINE_TREE.getNodesByFilter(function(node) {
                return node.indexNode.index <= index && (node.indexNode.nextIndex >= index || node.indexNode.nextIndex == -1);
            });
        
        if (nodes.length) {
            var node = nodes[nodes.length - 1];
            this._OUTLINE_TREE.selectNode(node, false);
            if (!node.isHidden) {
                var iscroll = $("#props").data("iscroll");
                if (iscroll) {
                    trace("scrolling to node ->", node);
                    setTimeout(function() {
                        // make sure iscroll relocates the scrollbars
                        iscroll.refresh();
                        iscroll.scrollToElement(document.getElementById(node.tId), 100);
                    }, 0);
                }
            }
        }
    },
    getIndexNode : function(outlineNode) {
        var tid = outlineNode.treeNodeId;
        if (!tid)
            throw new Error("no treeNodeId found in outlineNode");
        var treeNode = designer.outline._OUTLINE_TREE.getNodeByTId(tid);
        if (!treeNode)
            throw new Error("cannot find treeNode for tid '" + tid + "'");
        return treeNode.indexNode;
    }
};


/* common menu */
designer.editor = {
    
    execCopyHTML : function(outlineNode) {
        var indexNode = designer.outline.getIndexNode(outlineNode);
        trace(node);
    },
    execDelete : function(outlineNode) {
        var indexNode = designer.outline.getIndexNode(outlineNode),
            editor = designer.getEditor();
        editor.replaceRange(
                "",
                designer.util.getPosition(indexNode.location), 
                designer.util.getPosition(indexNode.nextLocation));
        designer.outline.build();
        designer.fireRedesign();
    },
    execProperties : function(outlineNode) {
        // 只编辑标签
        if (outlineNode.type == "tag")
            designer.util.openPropertyGrid(outlineNode);
        else
            trace("Invalid node type ->", outlineNode);
    },
    execInsertFirstChild : function(outlineNode) {
        
    },
    execInsertLastChild : function(outlineNode) {
        
    },
    execInsertSiblingBefore : function(outlineNode) {
        
    },
    execInsertSiblingAfter : function(outlineNode) {
        
    }
};



designer.util = {
    getPosition : function(location) {
        return { line : location.line - 1, ch : location.col - 1 };
    },
    /**
     * 替换outlineNode的开始标签
     * @param {Object} node
     * @param {String} newTag 
     * @param {Boolean} doNotRebuildOutline 是否禁止重建大纲
     */
    replaceTag : function(node, newTag, doNotRebuildOutline) {
        trace("replace tag ->", node, newTag);
        var pos0 = { line : node.location.line - 1, ch : node.location.col - 1 },
            tagLines = node.raw.split("\n"),
            pos1 = { line : node.location.line - 1 + tagLines.length - 1, ch : tagLines[tagLines.length - 1].length + 1 + (tagLines.length == 1 ? node.location.col : 0) };
        designer.getEditor().replaceRange(newTag, pos0, pos1);
        if (!doNotRebuildOutline)
            designer.outline.build();
        designer.fireRedesign();
    },
    
    TAB_SIZE : 4,
    LINE_WRAP_THRESHOLD : 100,
    _propGrid : null,
    /**
     * 打开属性编辑器
     * @param {Object} indexNode
     */
    openPropertyGrid : function(outlineNode) {
        if (!this._propGrid)
            this._propGrid = new HtmlPropertyGrid();
        var tagProperties = this.getDefaultProperties(outlineNode) || [],
            tagPropertyMap = {};
        $.each(tagProperties, function() {
            tagPropertyMap[this] = "";
        });
        properties = $.extend(tagPropertyMap, outlineNode.attributes || {});
        this._propGrid.edit(properties, function(newProperties) {
            var editor = designer.getEditor(),
                indexNode = designer.outline.getIndexNode(outlineNode),
                from = designer.util.getPosition(indexNode.location),
                to = editor.posFromIndex(indexNode.index + outlineNode.raw.length + 2),
                indent = editor.getRange($.extend($.extend({}, from), { ch : 0 }), from),  // 行首缩进的字符串
                indentChars = 0; // 行首缩进的字符数（展开tab，汉字算为2个字符）
            for (var i = 0; i < indent.length; ++i)
                indentChars += indent.charCodeAt(i) == 9 ? designer.util.TAB_SIZE : (indent.charCodeAt(i) <= 255 ? 1 : 2);

            // 根据编辑后的属性更新node和代码
            trace("end editing node ->", indexNode, newProperties);
            var newTag = designer.util._buildTag(outlineNode, newProperties, indentChars, 100, designer.util.TAB_SIZE);
            trace("new tag ->", newTag);
            
            editor.replaceRange(newTag, from, to);
            designer.outline.build();
            designer.fireRedesign();
            // var source = designer.getSourceText();
            // source = source.substring(0, indexNode.index) + newTag + source.substring(indexNode.nextIndex);
            // designer.setSourceText(source);
            // designer.outline.build();
        });
    },
    /**
     * 根据outlineNode和属性表创建标签字符串
     * @param {Objet} node
     * @param {Object} properties 属性集合
     * @param {Number} indent 行首缩进量
     * @param {Number} maxLineWidth 最大行长度
     * @param {Number} indentSize 缩进大小
     * @returns {String} 
     */
    _buildTag : function(node, properties, indent, maxLineWidth, indentSize) {
        if (!indent)
            indent = 0;
        if (!maxLineWidth)
            maxLineWidth = designer.util.LINE_WRAP_THRESHOLD;
        if (!indentSize)
            indentSize = designer.util.TAB_SIZE;
        var selfEnclosing = node.raw.charAt(node.raw.length - 1) == "/",
            tag = [],
            col = indent,
            indentStr = [" "].times(indent + indentSize).join(""),
            wrap = false;
        tag.push("<", node.name, " ");
        col += node.name.length + 2;
        for (var name in properties) {
            var value = null;
            if (!properties.hasOwnProperty(name) || 
                    typeof (value = properties[name]) != "string" || 
                    !value.length)
                continue;
            var quote = value.indexOf("\"") != -1 ? "'" : "\"",
                pnewline = value.indexOf("\n"),
                firstlinewidth = name.length + 2 + (pnewline == -1 ? (value.length + 1) : pnewline);
            if (col + firstlinewidth > maxLineWidth) {
                tag.push("\n", indentStr);
                col = indent + indentSize;
                wrap = true;
            }
            tag.push(name, "=", quote);
            col += name.length + 2;
            if (pnewline == -1) {
                tag.push(value);
                col += value.length;
            } else {
                var lines = value.split("\n");
                tag.push(lines[0]);
                for (var i = 1; i < lines.length; ++i) {
                    tag.push("\n", indentStr, lines[i]);
                    col = lines[i].length + indentSize + indent;
                }
            }
            tag.push(quote, " ");
            col += 2;
        }
        if (tag[tag.length - 1] == " ")
            tag.pop();
        tag.push(selfEnclosing ? "/>" : ">");
        return tag.join("");
    },
    
    /**
     * 根据标签获取节点的默认属性集合
     * @param {Object} node
     * @returns {Array} 默认属性名称列表
     */
    getDefaultProperties : function(node) {
        if (node.type != "tag")
            return [];
        var tag = node.name.toUpperCase(),
            props = designer.util.html.tags[tag] || [];
        return props;
    },
    
    html : {
        groups : {
            CLICKABLE : ["onclick", "onmouseover", "onmouseout", "onmousemove", "ondblclick"],
            INPUTABLE : ["onkeyup", "onkeydown", "onkeypress"],
            PLACEHOLDER : ["disabled", "width", "height", "onclick", "onmouseover", "onmouseout", "onmousemove", "ondblclick"],
            VISUAL : ["width", "height"],
            VALUEHOLDER : ["readonly", "onchange", "onkeyup", "onkeydown", "onkeypress"],
            ALIGNABLE : ["align", "valign"],
            LINK : ["href"],
            RESOURCE : ["src"],
            "*" : ["id", "name", "class", "style", "title", "tabindex"]
        },
        tags : {
        }
    }
};

__at("table", __eg(["cellpadding", "cellspacing", "border"], "placeholder,alignable"));
__at("thead,tbody", __eg("alignable"));
__at("th,td", __eg(["rowspan", "colspan"], "placeholder,alignable"));
__at("input", __eg(["maxlength", "type", "value", "cols", "size", "required", "placeholder", "step"], "placeholder,valueholder"));
__at("input_checkbox", __et(["checked"], "input"));
__at("input_radio", __et(["checked"], "input"));
__at("input_image", __et(__eg("resource"), "input"));
__at("textarea", __eg(["rows", "wrap"], "placeholder"));
__at("label", __eg(["for"], "placeholder"));
__at("span,p,pre,font,u,i,b,s,strike,center,sup,sub,strong,div,body,html,*", __eg("placeholder"));
__at("ul,li", __eg("placeholder"));
__at("ol", __eg(["start"], "placeholder"));
__at("br,head,title", []);
__at("colgroup,col", __eg(["width"], "alignable"));
__at("a", __eg(["target"], "placeholder,link"));
__at("iframe", __eg(["frameborder", "target"], "placeholder,resource"));
__at("meta", ["charset", "name", "http-equiv", "content", "scheme"]);
__at("img", __eg(["alt"], "placeholder,alignable,resource"));
__at("form", __eg(["action", "method", "autocomplete", "accept", "accept-charset", "enctype", "target"], "placeholder"));

function __at(tag, props) {
    $.each(tag.split(","), function() {
        designer.util.html.tags[$.trim(this.toUpperCase()).toUpperCase()] = props || [];
    });
}
// extend groups
function __eg(props) {
    var args = [].slice.apply(arguments),
        rslt = [];
    if (typeof props == "string") {
    } else {
        args.shift();
        rslt = rslt.concat(props);
    }
    args.push("*");
    for (var i = 0; i < args.length; ++i) {
        $.each(args[i].split(","), function() {
            var gps = designer.util.html.groups[$.trim(this.toString()).toUpperCase()] || [];
            rslt = rslt.concat(gps);
        });
    }
    return rslt.distinct();
}
// extend tag
function __et(props, tagName) {
    props = [].concat(props).concat(designer.util.html.tags[tagName.toUpperCase()] || []);
    return props;
}

var MODE_COLOR_EXT_MAP = {
    js : { mode : "javascript", labelColor : "#6F8921" },
    groovy : { mode : "groovy", labelColor : "#27656E" },
    html : { mode : "htmlmixed", labelColor : "" },
    htm : { mode : "htmlmixed", labelColor : "" },
    css : { mode : "css", labelColor : "" },
    jsp : { mode : "htmlmixed", labelColor : "" },
    include:{ mode : "htmlmixed", labelColor : "" }
};
