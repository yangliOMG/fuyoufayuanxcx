//app.
App({
    data: {
        serverUrl: 'http://10.9.5.195:8080',    //http://10.9.5.136:8080       https://www.fuyoufayuan.com
        position: [],
        user:{}
    },
    onLaunch: function () {
        let _this = this
        wx.showLoading({ title: '加载中...', mask: true })

        new Promise((resolve,reject)=>{
            // 登录
            wx.login({
                success: res => {
                    if (res.code) {
                        wx.request({
                            url: this.data.serverUrl + '/login/wxMiniLogin.do',
                            data: {code: res.code,},
                            success: function(res){
                                wx.hideLoading()
                                let arr = (res.header["Set-Cookie"] || res.header["set-cookie"]).split('JSESSIONID')
                                if (arr[1]) {
                                    wx.setStorageSync("sessionid", 'JSESSIONID' + arr[1])
                                } else {
                                    console.log('没有JSESSIONID')
                                }
                                resolve()
                            }
                        })
                    }
                }
            })
        }).then(()=>{
            // 获取用户信息
            wx.getSetting({
                success: res => {
                    if (res.authSetting['scope.userInfo']) {
                        wx.getUserInfo({
                            withCredentials:true,
                            success: res => {
                                _this.data.user = { nick: res.userInfo.nickName }
                                if (_this.userInfoReadyCallback) {
                                    _this.userInfoReadyCallback(_this.data.user)
                                }
                            }
                        })
                    }else{
                        if (_this.loginCallback) {
                            _this.loginCallback()
                        }
                    }
                }
            })
        })
    },
})