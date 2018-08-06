//app.js
App({
    data: {
        serverUrl: 'http://10.9.5.141:8080',    //http://10.9.5.136:8080       https://www.fuyoufayuan.com
        position:[]
    },
    onLaunch: function () {
        let _this = this
        wx.showLoading({title: '加载中...',mask:true})
        wx.login({
            success: res => {
                if (res.code) {
                    wx.request({
                        url: this.data.serverUrl + '/login/login.do',
                        data: {
                            code: res.code,
                            isMoblieMode: false
                        },
                        success: function(res){
                            wx.hideLoading()
                            if(res.data.id===null){
                                return wx.showToast({title: 'appid与code不统一',mask:true,icon:'none'})
                            }
                            _this.data.user = {id:res.data.id, openid:res.data.openid, nick:res.data.nick}
                            if (_this.userInfoReadyCallback) {
                                _this.userInfoReadyCallback(_this.data.user)
                            }
                            let arr = res.header["Set-Cookie"].split('JSESSIONID')
                            if(arr[1]){
                                wx.setStorageSync("sessionid", 'JSESSIONID'+arr[1])
                            }else{
                                console.log('没有JSESSIONID')
                            }
                        }
                    })
                } else {
                    console.log('登录失败！' + res.errMsg)
                }
            }
        })
        // 获取用户信息
        // wx.getSetting({
        //   success: res => {
        //     if (res.authSetting['scope.userInfo']) {
        //       wx.getUserInfo({
        //         success: res => {
        //           this.globalData.userInfo = res.userInfo
        //           if (this.userInfoReadyCallback) {
        //             this.userInfoReadyCallback(res)
        //           }
        //         }
        //       })
        //     }
        //   }
        // })
    },
})