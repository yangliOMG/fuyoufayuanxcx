/**
 * 获取url参数 
 */
export function getQueryString (url,name){
    var reg = new RegExp('(^|&|/?)' + name + '=([^&|/?]*)(&|/?|$)', 'i')
    var r = decodeURIComponent(url).substr(1).match(reg) 
    if (r != null) {
        return r[2]
    }
    return null;
}
/**
 * 数字转时间长度
 */
export function duringDictionary(){
    return [{type:1,name:'1天'},{type:30,name:'1月'},{type:365,name:'1年'},{type:7200,name:'长明'}]
}
/**
 * 数字转方向
 * @param {数字} num 
 */
export function directionDictionary(num,type=0){
    let dick = [['南','东南','东','东北','北','西北','西','西南'],
                ['S','SE','E','EN','N','WN','W','WS']]
    return num !== undefined ?dick[type][num] : dick[type]
}
/**
 * 数字反向表示层数
 * @param {数字} num 
 * @param {数字} len 
 */
export function cengConvert(idx,lenth){
    try {
        return Number(lenth||15) - Number(idx)
    } catch (error) {
        return 'X'
    }
}
/**
 * 时间ios兼容转换
 * @param {日期} date 
 */
export function timeFormat(time){
    try {
        var date = new Date(time)
        var year = date.getFullYear()
        var month = date.getMonth() + 1
        var day = date.getDate()
        
        var hour = date.getHours()
        var minute = date.getMinutes()
        var second = date.getSeconds()
        
        return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')

    } catch (error) {
        return '0'
    }
}
const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}
/**
 * 三维数组选出最优的num个位置
 * @param {三维数组} dataArr 
 * @param {数量} num 
 */
export function recommendAI(dataArr,num){
    let bestPos = new Map()
    dataArr.forEach((arr2d,idx) => {
        arr2d.forEach((arrrow,idx1) => {
            let count = 0 , row = []
            arrrow.forEach((v,idx2) => {
                let val = 0;
                if(v.state===1){
                    count = 0
                }else{
                    val += 10 
                    for (let i = 0; i < count; i++) {
                        row[row.length-i-1] += 10*count
                    }
                    count ++
                }
                row.push(val)
                bestPos.set(val,[idx,idx1,idx2])
            })
            row.forEach((v,idx2) => {
                bestPos.set(v,[idx,idx1,idx2])
            })
            while(bestPos.size > num){
                let min = Math.min(...bestPos.keys())
                bestPos.delete(min)
            }
        })
    })
    return [...bestPos.values()]
}