# Yedeying's 2048
> yedeying's 2048 game

[Github repo](https://github.com/yedeying999/2048)
[Play Online](http://yedeying2048.coding.io)
## 前言
2048是什么游戏就不说了, 这个项目是挺久前已经创建了。而创建它的动力, 就是想自己来实现一遍这个经典的游戏。

记得当初创建时, 那晚也是通宵了, 算是实现了它的基本功能, 但是BUG一定不会少。就这样过了好久, 一直没动它。有时想动时, 看到以前自己写的那么烂的代码, 又无从下手了。所以, 架构真的很重要=.=。

直到前几天, 决定重新把它给实现一遍。把之前的各种垃圾写法给扔掉(各种各样的全局函数, 作用域不鲜明等), 重新想了一遍这个应该怎么组织(具体思路看下面), 结果, 就出来了, 写个博文纪念下。
## 特点
主体分成两大部分, 一个Model类, 一个Game类(就是View类, 取名太乱不要嫌弃8.8), 还有一个调用的入口
### Model类
Model类提供了2048的模型及数据级的操作。
#### 属性
主要数据属性是两个多维数组, 一个是邻接矩阵dataRect, 一个是数据表dataTable
##### dataRect
每个坐标都可以在dataRect里取到一个对象, 这个对象包含了该格的值(-1为空)和对应数据表的索引(-1为空)
##### dataTable
DataTable中只能通过id来获取其中某一项, 而每一项是一个对象, 包含格子坐标和值。

而且有个特点：每一时刻, 每个有值的格子都会对应着唯一一个数据表项。

``` js
dataRect[x][y] = {
  id: xxx,
  val: xxx
}
dataTable[id] = {
  x: xxx,
  y: xxx,
  val: xxx
}
```
#### 行为
Model类主要提供了以下行为
```
addGrid        添加一个格子, 可以限定在某个方向的边沿生成, 从dataList中随机取一个值作为新值
move           移动操作, 接受四种方向
show           主要调试用, 往控制台输出当前的格子分布及数值
```
#### 参数
Model接受以下的参数, 通过对象传入
```
size 大数, 默认为4
numList        每次生成的数字都是从本数列中随机抽取的, 默认为[2, 4], 可以通过设置多个相同数字提高其出现概率, 如[2, 2, 2, 4]
createHandle   当格子被创建时, 该函数会被调用, 提供对应的数据表项作为参数
moveHandle     当格子移动后, 该函数会被调用, 提供对应的数据表项作为参数
delHandle      当格子被删除时, 该函数会被调用, 提供对应的数据表项作为参数
finishHandle   当游戏结束时, 该函数会被调用
```
### Game类
为游戏提供展示、移动、删除、布局等功能
Game类主要做了以下事：
```
createHandle   为Model提供回调, 当生成一个格子时, 向页面添加该格子对应的html, 往dataTable添加col属性, 指向该格子对应的html元素
moveHandle     为Model提供回调, 当移动一人个格子时, 配合css的transition属性实现移动动作
delHandle      为Model提供回调, 当一个格子消失时, 删除页面对应的html元素
finishHandle   为Model提供回调, 当游戏结束时, 弹出结束框, 并去掉键盘监听
bindEvents     添加键盘事件, 提供WSAD, KJHL, ↑↓←→三种方向组合
fixFontSize    设置文字大小自适应, 以防因文字太大而溢出格子
fixColor       为每个格子添加data-num属性, 代表其值以2为根的对数, 配合css添加颜色样式
initStyle      一些动态的样式(如格子宽度等), 无法在css上写好, 故须写在js里
```
### 特色功能
提供大小设置功能, 可让玩家体验非4*4大小的2048游戏(10*10那种不是一般人玩的= =)

## 最后
祝玩得开心^.^, 源码主要是script.js, 如有可以改进的地方可以[Tell me](mailto:yedeying999@gmail.com?subject=about%202048)
