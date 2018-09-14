# 问题总结
* 小程序js中，并没有很好的兼容map，set对象--在计算的时候是可以用的，但是将数据setData的时候，就会置为array对象。

* wxml并没有具有很强的计算能力，如需计算需嵌入wxs文件进行计算。

* app.userInfoReadyCallback用于接口调用后回调，在面对登录完成后再调后面的接口  这类问题，十分好用
```
      app.userInfoReadyCallback = res => {
            ....
      }
```