const app = getApp();

export function getImageInfo(src){
    wx.getImageInfo({src})
}

function ajaxPromise(url,dataObj){
    return new Promise((resolve,reject)=>{
        wx.request({
            url: app.data.serverUrl+url,
            data: dataObj,
            header:{'cookie':wx.getStorageSync("sessionid")},
            success: function(res){
                if(res.data.returnCode===3005){
                    reject(res.data.data);
                    return
                }
                resolve(res.data);
            }
        })
    })
}
export function getTowerAndPriceById(id){
    return ajaxPromise("/facility/info1.do",{id})
}
export function getRandomPosition(id,num){
    return ajaxPromise("/facility/random.do",{id,num})
}
export function getLayoutById(id){
    return ajaxPromise("/facility/layout.do",{id})
}
export function getOccupyById(id){
    return ajaxPromise("/facility/occupy.do",{id})
}
export function getRandomTemplateByType(type){
    return ajaxPromise("/facility/random.do",{type})
}

export function getTextScan(content){
    return ajaxPromise("/template/textScan.do",{content})
}

export function createOrder(order){
    return ajaxPromise("/pray/create.do",{data:JSON.stringify(order)})
}
export function getOrderByid(id){
    return ajaxPromise("/pray/items.do",{id})
}
export function getTopMes(fid){
    return ajaxPromise("/pray/top.do",{top:5,fid})
}

export function getWechatPay(res){
    return ajaxPromise("/wxpay/wechat_paytest.do",{
        prayId:res.prayId , 
        tid: res.tid,
    })
}
export function getWechatPayCallback(prayId){
    return ajaxPromise("/wxpay/updatePrayType.do",{prayId})
}