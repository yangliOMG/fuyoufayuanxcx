const _server = require('../../utils/server');
const _util = require('../../utils/util');
const app = getApp();

Page({
    data: {
        order :{
            num: 2,
            duration:1,
            total:390000,
            unick:"xxx",
            blessing:"身体健康，万事如意",
            type:1,
            dengwei:[],
            tname:'xxx',
            fname:'xxx',
            createTime:'',
        },
        dengweiDetail:'',
        during:'',
        createTime:'',
        showFlag:false
    },
    onLoad: function (options) {
        this.mount(options.id)
    },
    mount:function(id){
        _server.getOrderByid(id).then(res=>{
            this.messageInit(res)
            this.compute()
        })
    },
    compute:function(){
        const order = this.data.order
        const arr = order.dengwei.map(val=>
            `${_util.directionDictionary(val.side-1)}面${_util.cengConvert(val.row-1,val.maxrow)}层${('0'+val.col).slice(-2)}位、`)
        const during = _util.duringDictionary().find(v=>v.type===order.duration).name
        const createTime = _util.timeFormat(order.createTime)
        this.setData({dengweiDetail : arr.join(''), during, createTime})
    },
    messageInit(order){
        this.setData({order : order})
        if(order.payStatus!==2){
            _server.getWechatPayCallback(order.id).then(res=>{
                if(res.trade_state==='SUCCESS'){
                    this.messageInit({...order,payStatus:2})
                }
            })
        }
    },
    handleShow: function(){
        this.setData({ showFlag: !this.data.showFlag })
    },
    handlePreviewImage: function (e) {  
		wx.previewImage({
		  	urls: ["https://www.fuyoufayuan.com/html/images/qrcode.jpg"] 
		})
    },
    handleClickReback(){
        const order = this.data.order
        if(order.payStatus===1){
            wx.showLoading({title: '加载中...',mask:true})
            _server.getWechatPay({prayId:order.id,tid:order.tid}).then(res=>{
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
                        wx.redirectTo({
                            url: '../parydetail/parydetail?id='+prayid
                        })
                    }
                })
            }).catch(error=>{
                wx.showToast({title: error.message,mask:true,icon:'none',duration:2000})
            })
        }else if(order.payStatus===3){
            wx.navigateTo({
                url: '../paryform/paryform?id='+this.data.order.fid
            })
        }
    }
})
