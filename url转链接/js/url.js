		(function () {  
    var trim = function (s) {  
        /*jslint eqeq:true*/  
        if (s == null || s === '') {  
            return '';  
        }  
        // s 空格  
        //   制表符  
        // xA0 non-breaking spaces  
        // 3000中文空格  
        return String(s).replace(/^[s   xA03000]+/, '').  
            replace(/[s xA03000]+$/, '');  
    },  
    startsWith = function (s, sub) {  
        s = String(s);  
        return s.indexOf(sub) === 0;  
    },  
    test = function (str) {  
        /*jslint maxlen: 100*/  
        var URI_REG = new RegExp("/(https?://|www.|ssh://|ftp://)[a-z0-9&_+-?/.=#]+/i"),  
            MAIL_REG = new RegExp("/[a-z0-9_+-.]+@[a-z0-9_+-.]+/i");  
        str = trim(String(str));  
        return URI_REG.test(str) || MAIL_REG.test(str) || false;  
    },  
    /** 
     * @param {String} str 
     * @param {Function} replacer 
     */  
    replace = function (str, replacer) {  
        /*jslint maxlen: 100*/  
        var URI_REG = new RegExp("/(https?://|www.|ssh://|ftp://)[a-z0-9&_+-?/.=#]+/gi"),  
            MAIL_REG = new RegExp("/[a-z0-9_+-.]+@[a-z0-9_+-.]+/gi");  
  
        str = trim(String(str));  
  
        str = str.replace(URI_REG, function (match) {  
            var newStr =  replacer({  
                mail: false,  
                fullURI: startsWith(match.toLowerCase(), 'www.') ?  
                        ('http://' + match) : match,  
                match: match  
            });  
            /*jslint eqeq: true*/  
            return newStr == null ? match : newStr;  
        });  
        str = str.replace(MAIL_REG, function (match) {  
            var newStr =  replacer({  
                mail: true,  
                fullURI: 'mailto:' + match,  
                match: match  
            });  
            /*jslint eqeq: true*/  
            return newStr == null ? match : newStr;  
        });  
        return str;  
    },  
    uriRecognition = function (text) {  
        var doc = document,  
            html;  
        text = trim(String(text));  
        if (test(text)) {  
            //use {} to escape  
            text = text.replace(/{<}/g, '{{<}}').  
                replace(/{>}/g, '{{>}}').  
                replace(/</g, '{<}').  
                replace(/>/g, '{>}');  
  
            html = replace(text, function (info) {  
                if (!info || !info.match || !info.fullURI) {  
                    return null;  
                }  
                var link = doc.createElement('a');  
                link.setAttribute('href', info.fullURI);  
                /*jslint eqeq: true*/  
                if (link.innerText != null) {  
                    link.innerText = info.match;  
                } else if (link.textContent != null) {  
                    link.textContent = info.match;  
                }  
                return link.outerHTML;  
            });  
  
            html = html.replace(/{<}/g, '<').  
                replace(/{>}/g, '>');  
  
            return {  
                content: html,  
                isPlainText: false  
            };  
        }  
        return {  
            content: text,  
            isPlainText: true  
        };  
    },  
    setContentWithURIRecognition = function (el, text) {  
        var result = uriRecognition(text);  
        if (!result) {  
            return;  
        }  
        if (result.isPlainText) {  
            if (el.innerText != null) {  
                el.innerText = result.content;  
            } else if (el.textContent != null) {  
                el.textContent = result.content;  
            }  
        } else {  
            el.innerHTML = result.content;  
        }  
    };  
    window.uriRecognition = uriRecognition;  
    window.setContentWithURIRecognition = setContentWithURIRecognition;  
  
})();