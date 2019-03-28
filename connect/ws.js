let websocketServer = {
    url:'',
    lockReconnect:false,
    ws:null,
    data:{},
    createWebSocket(){
        try{
            if ('WebSocket' in window){
                this.ws = new WebSocket(this.url);
            }else if('MozWebSocket' in window){
                this.ws = new WebSocket(this.url);
            }else{
                alert("您的浏览器不支持websocket协议,建议使用新版谷歌、火狐等浏览器，请勿使用IE10以下浏览器，360浏览器请使用极速模式，不要使用兼容模式！")
            }
            this.initEvent();
            this.windowClose();
        }catch(err){
            console.log(err);
            this.reconnect();
        }
    },
    initEvent() {
        this.ws.onopen = ()=> {
            this.heartCheck.reset(); //心跳检测重置
            this.heartCheck.start(this.ws); //心跳检测重置
            console.log("ws连接成功！" + new Date().format("yyyy-MM-dd hh:mm:ss"));
            this.ws.send("连接成功")
        };
        this.ws.onmessage = event=> {//如果获取到消息，心跳检测重置
            this.heartCheck.reset(); //拿到任何消息都说明当前连接是正常的
            this.heartCheck.start(this.ws); //拿到任何消息都说明当前连接是正常的
            this.data=JSON.parse(event.data);
            this.handMsg(event);
        };
        this.ws.onclose = ()=> {
            console.log("ws连接关闭！" + new Date().format("yyyy-MM-dd hh:mm:ss"));
            this.reconnect();
        };
        this.ws.onerror = () =>{
            console.log("ws连接错误！");
            this.reconnect();
        };
    },
    heartCheck:{
        timeout:5000,
        timer:null,
        serverTimer:null,
        reset(){
            clearTimeout(this.timer);
            clearTimeout(this.serverTimer);
        },
        start(ws){
            //console.log(ws);
            if(ws === null){
                console.log("ws已关闭");
                return false;
            }
            this.timer=setTimeout(()=>{
                ws.send('ping');
                //console.log('ping');
                this.serverTimer=setTimeout(()=>{
                    ws.close();
                },this.timeout)
            },this.timeout)
        }
    },
    reconnect(){
        if (this.lockReconnect) return;
        this.lockReconnect = true;
        setTimeout(()=>{
            this.createWebSocket();
            this.lockReconnect=false;
        },2000)
    },
    windowClose(){
        window.onbeforeunload = () =>{this.ws.close()};
    },
    handClose(){
        this.ws.close();
        this.lockReconnect = true;
    },
    handMsg(e){
        console.log(JSON.parse(e.data));
        return JSON.parse(e.data);
    }
};

Date.prototype.format = function (fmt) {
    let o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};
