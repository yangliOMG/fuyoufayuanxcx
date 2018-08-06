const _server = require('../../utils/server');
const _util = require('../../utils/util');
const app = getApp();

Page({
    data: {
        direction: _util.directionDictionary(),
        btnList : [{type:1,name:'1盏'},{type:2,name:'2盏'},{type:3,name:'3盏'},{type:4,name:'4盏'}],
        curPage:0,
        data : [[],[],[]],
        seledList : [],
    },
    onLoad: function (options) {
        this.mount(options.id)
    },
    mount:function(id=4){
        let position = app.data.position, num = app.data.num
        wx.showLoading({title: '加载中...',mask:true})
        _server.getLayoutById(id).then(res=>{
            let layout = res
            _server.getOccupyById(id).then(res=>{
                let occupy = res
                let total = 0
                this.setData({
                    data: layout.map(arrd=>
                            arrd.map(arr=>
                                arr.map(id=>{
                                    total++;
                                    return {id,state: occupy.includes(id)?1:0}
                                })     //0可选，1不可选，2已选
                            )
                    ),
                    total,
                    occupy:occupy.length,
                    id
                })
                if(position&&position.length>0){
                    position.forEach((arr,idx)=>this.seatSelection(...arr[1][2].split(',')))
                }else if(num && num>0){
                    this.recommend(num)
                }
                wx.hideLoading()
            })
        }).catch(res=>console.log(res))
    },
    turnPage(curPage){
        this.setData({curPage:curPage*1})
    },
    seatSelection(idx,idx1,idx2){
        let data = this.data.data
        let seledList = this.data.seledList
        let lampdata = data[idx][idx1][idx2]
        let len = data[idx].length
        
        if(lampdata.state===0){
            lampdata.state = 2
            seledList.push([lampdata.id,[`${_util.directionDictionary(idx)}${_util.cengConvert(idx1,len)}层第${('0'+(idx2*1+1)).slice(-2)}位`,
                `${_util.directionDictionary(idx)}${_util.cengConvert(idx1,len)}${idx2*1+1}`,
                `${idx},${idx1},${idx2}`]])
        }else if(lampdata.state===2){
            seledList = seledList.filter(v=>v[0]!==lampdata.id)
            lampdata.state = 0
        }
        this.setData({
            data,seledList
        })
        this.turnPage(idx)
    },
    recommend:function(num){
        let data = this.data.data
        let recArrIdx = _util.recommendAI(data,num)
        recArrIdx.forEach(v=>this.seatSelection(...v))
    },
    handleSwiper:function(e){
        let page = e.detail.current
        this.turnPage(page)
    },
    handleLampClick:function(e){
        let pox = e.currentTarget.dataset.type
        this.seatSelection(...pox.split(','))
    },
    handleArrowClick:function(e){
        let curPage = this.data.curPage
        e.currentTarget.dataset.type==='left'? this.turnPage(curPage===0?7:--curPage) : this.turnPage(curPage===7?0:++curPage)
    },
    handleRecBtnClick:function(e){
        this.recommend(e.currentTarget.dataset.type)
    },
    handleSeatDelete:function(e){
        let id = e.currentTarget.dataset.type
        let re = new RegExp('"id":'+id+',"state":2','ig')
        let data = JSON.parse(JSON.stringify(this.data.data).replace(re,'"id":'+id+',"state":0'))
        this.setData({
            data,
            seledList:this.data.seledList.filter(v=>v[0]!==id)
        })
    },
    handleSureSelectClick:function(){
        app.data.position = this.data.seledList
        
        var pages = getCurrentPages()
        var beforePage = pages[pages.length - 2]
        wx.navigateBack({
            success: function() {
                beforePage.computePosition()
            }
        })
        // wx.navigateTo({
        //     url: '../paryform/paryform?id='+this.data.id
        // })
    },
})
