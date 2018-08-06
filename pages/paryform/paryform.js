//index.js
const _server = require('../../utils/server');
const _util = require('../../utils/util');
const app = getApp();

Page({
    data: {
        paryMessage:[],
        right:0,
        infoFlag:false,
        moduleFlag:false,
        textareaFlag:false,
        btnList:[],
        modulecontent:[
            [{name:'健康',type:0},{name:'长寿',type:1},{name:'平安',type:2},{name:'富贵',type:3},],
            [{name:'事业',type:4},{name:'姻缘',type:5},{name:'学业',type:6},]
        ],
        price:{1:980,30:1980,365:19900,7200:360000},

        prayman:'',
        num:2,
        duration: 30,
        blessing:'',
        position:[],
        
        prayArticle:''
    },
    onLoad: function (options) {
        if (app.data.user) {
            this.setData({
                prayman: app.data.user.nick,
            })
            this.init(options)
        //由于login是网络请求，可能会在 Page.onLoad 之后才返回所以此处加入 callback 以防止这种情况
        }else if(wx.canIUse('button.open-type.getUserInfo')){ 
            app.userInfoReadyCallback = res => {
                this.setData({
                    prayman: res.nick,
                })
                setTimeout(() => {              
                    this.init(options)
                }, 10)
                //此处加setimeout的缘由：因为系统后台 只有在login成功后才可以获取调用更多的接口。
                //虽然已写了userInfoReadyCallback，按理说已经登录成功了才调用的后面的接口，但是初次调用接口仍然不成功，所以加入settimeout即可
                // 推测和js线程有关系
            }
        }
    },
    init:function(options){
        this.compute()
        this.mount(options.id)
        
    },
    compute:function(){
        const arr = _util.duringDictionary()
        const btnList = Object.keys(this.data.price).map(val=>arr.find(v=>v.type+''===val))

        this.setData({ btnList })
    },
    computePosition:function(){
        this.setData({ position: app.data.position,num:app.data.position.length })
    },
    mount:function(id=4){
        _server.getTopMes(id).then(res=>{
            const paryMessage = res.data
            this.setData({paryMessage})
            this.scrollLeft()
        })
        _server.getTowerAndPriceById(id).then(res=>{
            let price = {}
            res.price.forEach(v=>price[v.duration]=v.price)
            res.facility.ico = app.data.serverUrl + res.facility.ico
            _server.getImageInfo(res.facility.ico)
            this.setData({
                obj: res.facility,
                price
            })
        }).catch(res=>console.log('info1',res))

        if(app.data.position.length<=0){
            _server.getRandomPosition(id,this.data.num).then(res=>{
                let position = res.data.map(v=>([
                    v.address,
                    [`${_util.directionDictionary(v.side-1)}${_util.cengConvert(v.row-1,v.maxrow)}层第${('0'+v.col).slice(-2)}位`,
                        `${_util.directionDictionary(v.side-1)}${_util.cengConvert(v.row-1,v.maxrow)}${v.col}`,
                        `${v.side-1},${v.row-1},${v.col-1}`]]))
                this.setData({
                    position,
                })
            })
        }
    },

    scrollLeft: function(){
        let screenW = wx.getSystemInfoSync().screenWidth, width, _this = this
        wx.createSelectorQuery().select('#marquee').boundingClientRect(function(res){
            width = res.width
            if(screenW<width){
                setInterval(function () {
                    let cha = parseInt(width - screenW),
                    val = cha < _this.data.right-100?  0:_this.data.right+1
                    _this.setData({ right: val })
                }, 30)
            }
        }).exec()
    },
    /**
     * 寺院信息窗口事件
     */
    handleInfo:function(){
        this.setData({ infoFlag: !this.data.infoFlag, textareaFlag: !this.data.textareaFlag })
    },
    /**
     * 输入框事件
     */
    handleTextarea:function(e){
        let id = e.currentTarget.id, value = e.detail.value
        if(id==='prayman'&& this.data.prayArticle){
            this.setData({blessing : this.data.prayArticle.replace(/{{prayer}}/g,value||'')}) 
        }
        this.setData({[id]:value}) 
    },
    /**
     * 更多模板事件
     */
    handleModule:function(){
        if(this.data.infoFlag){
            this.handleInfo()
        }
        this.setData({ moduleFlag: !this.data.moduleFlag, textareaFlag: !this.data.textareaFlag })
    },
    /**
     * 模板选择事件
     */
    handleTemplateType:function(e){
        let type = e.currentTarget.dataset.type
        _server.getRandomTemplateByType(type).then(res=>{
            if(res.content){
                this.setData({ 
                    prayArticle: res.content,
                    blessing: res.content.replace(/{{prayer}}/g,this.data.prayman||'')
                })
                this.handleBlurTextScan()
            }else{
                wx.showToast({title: '暂无该类模板',mask:true,icon:'none'})
            }
            this.handleModule()
        })
    },
    /**
     * textarea校验事件
     */
    handleBlurTextScan:function(){
        let blessing = this.data.blessing
        if(blessing!==''){
            _server.getTextScan(blessing).then(res=>{
                if(res.suggestion==='block'){
                    const dic = {spam:'含垃圾信息',ad:'广告',politics:'涉政',terrorism:'暴恐',abuse:'辱骂',
                        porn:'色情',flood:'灌水',contraband:'违禁',meaningless:'无意义'}
                    wx.showToast({title: '祈愿文内容违规，违规原因：'+dic[res.label],mask:true,icon:'none',duration:3000})
                }
            })
        }
    },
    /**
     * 供灯数量事件
     */
    handleNum:function(e){
        let type = e.currentTarget.dataset.type
        let num = type==='jia'? this.data.num+1:this.data.num-1
        if(num>=1){
            let position = this.data.position
            if( num < position.length){
                position = position.slice(0,num)
            }
            this.setData({num,position})
        }
    },
    /**
     * 供灯时长事件
     */
    handleTimeBtnClick:function(e){
        let duration = e.currentTarget.dataset.type
        this.setData({duration}) 
    },
    /**
     * 供灯位置事件
     */
    handlePosition:function(){
        app.data.position = this.data.position
        app.data.num = this.data.num
        wx.navigateTo({
            url: '../lampdetail/lampdetail?id='+this.data.obj.id
        })
    },
    /**
     * 确认祈福事件
     */
    handlePay:function(){
        let order = {}
        order.id = ''
        order.blessing = this.data.blessing
        order.prayman = this.data.prayman
        order.openTime = (new Date()).getTime()
        order.type = 1
        order.duration = this.data.duration
        order.num = this.data.position.length
        order.adds = this.data.position.map(i=>i[0])
        order.fid = this.data.obj.id
        order.source = 4
        if((order.num !== order.adds.length)||(order.adds.length<=0)){
            return wx.showToast({title: '请完善供灯位置',mask:true,icon:'none',duration:2000})
        }
        if(order.duration===""){
            return wx.showToast({title: '请选择时长',mask:true,icon:'none',duration:2000})
        }
        if(order.blessing){
            _server.getTextScan(order.blessing).then(res=>{
                if(res.suggestion==='pass'){
                    this.createOrder(order)
                }
            })
        }else{
            this.createOrder(order)
        }
    },
    /**
     * 创建订单->微信支付
     */
    createOrder(order){
        _server.createOrder(order).then(res=>{
            if(res.returnCode===1000){
                wx.showLoading({title: '加载中...',mask:true})
                _server.getWechatPay(res.data).then(res=>{
                    wx.hideLoading()
                    const prayid = res.prayId
                    wx.requestPayment({
                        'timeStamp': res.timestamp,
                        'nonceStr': res.nonceStr,
                        'package': res.packageValue,
                        'signType': 'MD5',
                        'paySign': res.paySign,
                        'success':function(res){
                            wx.showToast({title: "支付成功",mask:true,icon:'success',duration:2000})
                        },
                        'fail':function(res){
                             wx.showToast({title: "支付失败",mask:true,icon:'none',duration:2000})
                        },
                        'complete':function(){
                            wx.navigateTo({
                                url: '../parydetail/parydetail?id='+prayid
                            })
                        }
                    })
                }).catch(error=>{
                    wx.showToast({title: error.message,mask:true,icon:'none',duration:2000})
                })
            }else{
                let occ = res.data.occ
                if(occ){
                    let position = this.data.position.filter(v=>!occ.includes(v[0]))
                    this.setData({position})
                }
                wx.showToast({title: res.data.errorInfo,mask:true,icon:'none',duration:2000})
            }
        })
    }
})
