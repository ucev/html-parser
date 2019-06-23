const {
    OPENTAG,
    CLOSETAG,
    TEXT,
    COMMENT,
    DOCTYPE,
    STYLE,
    SCRIPT,
    RAW_TEXT
} = require('./regex');
const SELF_CLOSED = require('./self-closed-tag');
const { cloneDeep } = require('lodash');

class Parser {
    constructor() {
        this.originalHtml = '';
        this.currentHtml = '';
        this.structs = undefined;
        this.currentNode = undefined;
        this.tags = [];
        this.initCallbacks();
    }
    feed(html) {
        this.originalHtml = html.trim();
    }
    getAttrs(attrStr) {
        let attrReg = RAW_TEXT.ATTR_REG;
        let reg = new RegExp(attrReg, 'gi');
        let attrs = {};
        let res;
        while (res = reg.exec(attrStr)) {
            attrs[res.groups.name] = res.groups.value || true;
        }
        return attrs;
    }
    callCallbacks(cbName, ...args) {
        for (let c of this.callbacks[cbName]) {
            c(...args);
        }
    }
    parseOpenTag() {
        let res = OPENTAG.exec(this.currentHtml);
        if (res) {
            this.currentHtml = this.currentHtml.substring(OPENTAG.lastIndex);
            OPENTAG.lastIndex = 0;
            let tagName = res.groups.tag.toLowerCase();
            let node = {
                name: tagName,
                nodeType: '',
                attrs: this.getAttrs(res.groups.attrs),
                children: [],
                parent: this.currentNode
            }
            this.currentNode.children.push(node);
            this.callCallbacks('opentag', node.name, cloneDeep(node.attrs));
            if (!res.groups.closed && !SELF_CLOSED[tagName]) {
                this.currentNode = node;
                this.tags.push(tagName);
                if (tagName === 'style') {
                    this.parseStyle();
                } else if (tagName === 'script') {
                    this.parseScript();
                }
            } else {
                this.callCallbacks('closetag', node.name);
            }
        }
    }
    parseCloseTag() {
        let res = CLOSETAG.exec(this.currentHtml);
        if (res) {
            let tagName = res.groups.tag.toLowerCase();
            this.currentHtml = this.currentHtml.substring(CLOSETAG.lastIndex);
            CLOSETAG.lastIndex = 0;
            if (!SELF_CLOSED[tagName]) {
                let openTag = this.tags.pop();
                if (openTag !== tagName) {
                    throw new Error('tag标签闭合错误');
                }
                this.currentNode = this.currentNode.parent;
                this.callCallbacks('closetag', tagName);
            }
        }
    }
    parseText() {
        let res = TEXT.exec(this.currentHtml);
        if (res) {
            this.currentHtml = this.currentHtml.substring(TEXT.lastIndex);
            TEXT.lastIndex = 0;
            let node = {
                name: 'text',
                nodeType: '',
                children: [],
                parent: this.currentNode,
                attrs: {},
                content: res.groups.text
            };
            this.currentNode.children.push(node);
            this.callCallbacks('text', node.content);
        }
    }
    parseComment() {
        let res = COMMENT.exec(this.currentHtml);
        if (res) {
            this.currentHtml = this.currentHtml.substring(COMMENT.lastIndex);
            COMMENT.lastIndex = 0;
            let node = {
                name: 'comment',
                nodeType: '',
                attrs: {},
                children: [],
                content: res.groups.comment
            };
            this.currentNode.children.push(node);
            this.callCallbacks('comment', node.content);
        }
    }
    parseDoctype() {
        let res = DOCTYPE.exec(this.currentHtml);
        if (res) {
            let doctype = {
                name: 'doctype',
                nodeType: '',
                attrs: this.getAttrs(res.groups.attrs),
                parent: this.currentNode
            };
            this.currentNode.children.push(doctype);
            this.currentHtml = this.currentHtml.substring(DOCTYPE.lastIndex);
            DOCTYPE.lastIndex = 0;
            this.callCallbacks('opentag', doctype.name, cloneDeep(doctype.attrs));
            this.callCallbacks('closetag', doctype.name);
        }
    }
    parseStyle() {
        let res = STYLE.exec(this.currentHtml);
        if (res) {
            this.currentNode.content = res.groups.content;
            this.currentHtml = this.currentHtml.substring(STYLE.lastIndex);
            STYLE.lastIndex = 0;
        }
    }
    parseScript() {
        let res = SCRIPT.exec(this.currentHtml);
        if (res) {
            this.currentNode.content = res.groups.content;
            this.currentHtml = this.currentHtml.substring(SCRIPT.lastIndex);
            SCRIPT.lastIndex = 0;
        }
    }
    parse() {
        this.structs = {
            name: '',
            nodeType: '',
            attrs: {},
            children: [],
            parent: null
        };
        this.currentNode = this.structs;
        this.tags = [];
        this.callCallbacks('start');
        this.currentHtml = this.originalHtml;
        this.parseDoctype();
        let len = this.currentHtml.length;
        while (this.currentHtml.length) {
            this.parseOpenTag();
            this.parseCloseTag();
            this.parseText();
            this.parseComment();
            if (this.currentHtml.length === len) {
                throw new Error('HTML格式错误');
            }
            len = this.currentHtml.length;
        }
        this.callCallbacks('finish', cloneDeep(this.structs));
    }
    subscribe(phase, cb) {
        let cbs = this.callbacks[phase];
        if (!cbs) {
            return;
        }
        if (!cbs.includes(cb)) {
            cbs.push(cb);
        }
    }
    unsubscribe(phase, cb) {
        let cbs = this.callbacks[phase];
        if (!cbs) {
            return;
        }
        if (cb) {
            let index = cbs.indexOf(cb);
            if (index >= 0) {
                cbs.splice(index, 1);
            }
        } else if (phase) {
            this.callbacks[phase] = [];
        } else {
            this.initCallbacks();
        }
    }
    initCallbacks() {
        this.callbacks = {
            'opentag': [],
            'closetag': [],
            'text': [],
            'comment': [],
            'start': [],
            'finish': []
        };
    }
}

module.exports = Parser;
