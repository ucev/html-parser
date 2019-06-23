# html-parser
简单的html解析器

这个库是为了检验我对正则表达式的掌握能力创建的。为了简化解析规则，特限定
1. 所有标签名和属性名的命名规则为[-a-z][-a-z0-9]
2. 所有的属性值都用双引号包围起来
3. 字符串只使用双引号
4. 所有标签的套嵌都是正确的
5. style标签中间没有`</style>`字段
6. 没有CDATA

完整的解析规则需要熟悉html规范，这超出我目前的能力，且对于检验正则表达式的掌握能力没有更多的益处。


## 用法
#### 初始化
```
const parser = new Parser();
```
#### 添加要解析的html文本
```
parser.feed('<p>a</p>');
```
#### 添加事件监听
```
parser.subscribe(EVENT_NAME, CALLCACK);
```
能够监听的事件类型及回调函数
1. start 解析开始事件，() => void
2. end 解析结束事件，(ast: Object) => void，其中，ast是解析后的AST树
3. text 文本解析事件, (content: String) => void，其中，content是文本节点的内容
4. comment 注释解析事件, (content: String) => void，其中，content是注释节点的内容
5. opentag 开标签解析事件，(tagname: String, attrs: Object) => void，其中，tagname是标签名，attrs是标签的属性
6. closetag 闭标签解析事件，(tagname: String) => void
#### 取消事件监听
```
parser.subscribe(EVENT_NAME, CALLBACK)
```
EVENT_NAME是事件类型，CALLBACK是添加事件监听时的函数。如果同时传了EVENT_NAME和CALLBACK，则取消对CALLBACK的回调；如果只传了EVENT_NAME，则取消EVENT_NAME的所有回调；如果都没穿，取消所有的回调。
#### 触发解析
```
parser.parse()
```
