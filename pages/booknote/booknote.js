const { Stomp } = require('../../utils/stomp.js');

// pages/websocket/websocket.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    firstRendring: true,
    loading: false,
    noMore: false,
    list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.startTime = new Date().getTime();
    console.log('options', options);
    this.shareReadId = options.shareReadId;
    this.initList();
    // 需要服务端支持
    this.createSocket();
  },
  onReady(){
    const renderTime = new Date().getTime() - this.startTime;
    console.log('renderTime', renderTime);
    if (wx.canIUse('reportPerformance')) {
      wx.reportPerformance(2001, renderTime, 'custom');
    }
  },
  onUnload(){
    this.client && this.client.disconnect();
  },
  // 建立websocket连接，订阅更新
  createSocket: function() {
    // 防止连接还未建立时
    var socketOpen = false
    var socketMsgQueue = []
    function sendSocketMessage(msg) {
      console.log('send msg:', msg);
      if (socketOpen) {
        wx.sendSocketMessage({
          data: msg
        })
      } else {
        socketMsgQueue.push(msg);
      }
    }
    // 因为在小程序内的Websocket协议与Web环境有所不同
    // 我们需要先构造一个Stomp所需的Websocket协议对象
    // 其中主要就是提供Stomp所需的send方法
    var ws = {
      send: sendSocketMessage,
      close: () => {
        console.log('stomp is close');
      }
    }

    // setInterval是用来发心跳包的，而小程序没有window对象
    Stomp.setInterval = function (interval, f) {
      return setInterval(f, interval);
    }

    Stomp.clearInterval = function (id) {
      return clearInterval(id);
    }
    // 设置Stomp sdk所需的websocket协议
    // Web环境可以不做这步
    this.client = Stomp.over(ws);
    this.client.debugger = console.log;

    // 注册小程序内Websocket的事件处理函数
    wx.onSocketOpen(function (res) {
      socketOpen = true;
      console.log("连接已打开, 开始初始化Stomp");
      // 调用Stomp内置的onopen方法，开启Stomp client与server真正的连接
      ws.onopen();
    })
    wx.onSocketError(function (err) {
      console.log('socket err:', err);
    })
    wx.onSocketMessage(function (res) {
      // 接收到的message要传给Stomp内置的onmessage方法
      ws.onmessage(res);
    })
    wx.onSocketClose(() => {
      // 退出页面需要把send清空，否则一直向服务端发消息
      ws.send = () => {};
      this.client.disconnect();
    })
    wx.connectSocket({
      url: `wss://du.163.com/ws`,
      header: {
        'X-Auth-Token': 'a6d68b520b714c22a2a150a696f121db' // 发送到服务端的用户标识，在登录成功后由服务端返回并储存在小程序
      },
      success: () => {
        // 连接建立成功后，开始Stomp协议的连接及订阅
        this.client.connect({}, () => {
          console.log('connect');
          // 订阅笔记列表更新
          this.client.subscribe(`/topic/shareRead.2001597274`, this.handleMessage);
          // 订阅用户回复通知
          this.client.subscribe(`/user/topic/shareRead.2001597274`, this.handleMessage);
        }, (err) => {
          console.log('err', err);
        })
      }
    });
    
  },
  // 处理订阅消息
  handleMessage: function(message) {
    console.log('websokcet get message !', message.headers.destination);
    // 发送消息回执
    message.ack({
      destination: message.headers.destination,
      'message-id': message.headers['message-id']
    });
  },
  initList() {
    this.loadmore();
  },
  loadmore() {
    if(this.data.loading) return;
    this.setData({
      loading: true
    });
    setTimeout(() => {
      let mockList = this.getList(10);
      const listDelta = {};
      const listLength = this.data.list.length;
      mockList.forEach((item, index) => {
        listDelta[`list[${listLength + index}]`] = item;
      })
      console.log('listDelta', listDelta);
      this.setData(
        {
          // list: this.data.list.concat(mockList)
          ...listDelta
        },
        () => {
          this.setData({
            loading: false,
            firstRendring: false
          });
        }
      );
    }, 1000);
  },
  /**
   * 每次推入num条数据
   */
  getList(num) {
    let list = [];
    for (let i = 0; i < num; i++) {
      list.push({
        height: this.getRadomHeight(),
        extraData: '​JS-SDK 解决了移动网页能力不足的问题，通过暴露微信的接口使得 Web 开发者能够拥有更多的能力，然而在更多的能力之外，JS-SDK 的模式并没有解决使用移动网页遇到的体验不良的问题。用户在访问网页的时候，在浏览器开始显示之前都会有一个的白屏过程，在移动端，受限于设备性能和网络速度，白屏会更加明显。我们团队把很多技术精力放置在如何帮助平台上的Web开发者解决这个问题。因此我们设计了一个 JS-SDK 的增强版本，其中有一个重要的功能，称之为“微信 Web 资源离线存储”。JS-SDK 解决了移动网页能力不足的问题，通过暴露微信的接口使得 Web 开发者能够拥有更多的能力，然而在更多的能力之外，JS-SDK 的模式并没有解决使用移动网页遇到的体验不良的问题。用户在访问网页的时候，在浏览器开始显示之前都会有一个的白屏过程，在移动端，受限于设备性能和网络速度，白屏会更加明显。我们团队把很多技术精力放置在如何帮助平台上的Web开发者解决这个问题。因此我们设计了一个 JS-SDK 的增强版本，其中有一个重要的功能，称之为“微信 Web 资源离线存储”。JS-SDK 解决了移动网页能力不足的问题，通过暴露微信的接口使得 Web 开发者能够拥有更多的能力，然而在更多的能力之外，JS-SDK 的模式并没有解决使用移动网页遇到的体验不良的问题。用户在访问网页的时候，在浏览器开始显示之前都会有一个的白屏过程，在移动端，受限于设备性能和网络速度，白屏会更加明显。我们团队把很多技术精力放置在如何帮助平台上的Web开发者解决这个问题。因此我们设计了一个 JS-SDK 的增强版本，其中有一个重要的功能，称之为“微信 Web 资源离线存储”。JS-SDK 解决了移动网页能力不足的问题，通过暴露微信的接口使得 Web 开发者能够拥有更多的能力，然而在更多的能力之外，JS-SDK 的模式并没有解决使用移动网页遇到的体验不良的问题。用户在访问网页的时候，在浏览器开始显示之前都会有一个的白屏过程，在移动端，受限于设备性能和网络速度，白屏会更加明显。我们团队把很多技术精力放置在如何帮助平台上的Web开发者解决这个问题。因此我们设计了一个 JS-SDK 的增强版本，其中有一个重要的功能，称之为“微信 Web 资源离线存储”。JS-SDK 解决了移动网页能力不足的问题，通过暴露微信的接口使得 Web 开发者能够拥有更多的能力，然而在更多的能力之外，JS-SDK 的模式并没有解决使用移动网页遇到的体验不良的问题。用户在访问网页的时候，在浏览器开始显示之前都会有一个的白屏过程，在移动端，受限于设备性能和网络速度，白屏会更加明显。我们团队把很多技术精力放置在如何帮助平台上的Web开发者解决这个问题。因此我们设计了一个 JS-SDK 的增强版本，其中有一个重要的功能，称之为“微信 Web 资源离线存储”。JS-SDK 解决了移动网页能力不足的问题，通过暴露微信的接口使得 Web 开发者能够拥有更多的能力，然而在更多的能力之外，JS-SDK 的模式并没有解决使用移动网页遇到的体验不良的问题。用户在访问网页的时候，在浏览器开始显示之前都会有一个的白屏过程，在移动端，受限于设备性能和网络速度，白屏会更加明显。我们团队把很多技术精力放置在如何帮助平台上的Web开发者解决这个问题。因此我们设计了一个 JS-SDK 的增强版本，其中有一个重要的功能，称之为“微信 Web 资源离线存储”。JS-SDK 解决了移动网页能力不足的问题，通过暴露微信的接口使得 Web 开发者能够拥有更多的能力，然而在更多的能力之外，JS-SDK 的模式并没有解决使用移动网页遇到的体验不良的问题。用户在访问网页的时候，在浏览器开始显示之前都会有一个的白屏过程，在移动端，受限于设备性能和网络速度，白屏会更加明显。我们团队把很多技术精力放置在如何帮助平台上的Web开发者解决这个问题。因此我们设计了一个 JS-SDK 的增强版本，其中有一个重要的功能，称之为“微信 Web 资源离线存储”。JS-SDK 解决了移动网页能力不足的问题，通过暴露微信的接口使得 Web 开发者能够拥有更多的能力，然而在更多的能力之外，JS-SDK 的模式并没有解决使用移动网页遇到的体验不良的问题。用户在访问网页的时候，在浏览器开始显示之前都会有一个的白屏过程，在移动端，受限于设备性能和网络速度，白屏会更加明显。我们团队把很多技术精力放置在如何帮助平台上的Web开发者解决这个问题。因此我们设计了一个 JS-SDK 的增强版本，其中有一个重要的功能，称之为“微信 Web 资源离线存储”。JS-SDK 解决了移动网页能力不足的问题，通过暴露微信的接口使得 Web 开发者能够拥有更多的能力，然而在更多的能力之外，JS-SDK 的模式并没有解决使用移动网页遇到的体验不良的问题。用户在访问网页的时候，在浏览器开始显示之前都会有一个的白屏过程，在移动端，受限于设备性能和网络速度，白屏会更加明显。我们团队把很多技术精力放置在如何帮助平台上的Web开发者解决这个问题。因此我们设计了一个 JS-SDK 的增强版本，其中有一个重要的功能，称之为“微信 Web 资源离线存储”。JS-SDK 解决了移动网页能力不足的问题，通过暴露微信的接口使得 Web 开发者能够拥有更多的能力，然而在更多的能力之外，JS-SDK 的模式并没有解决使用移动网页遇到的体验不良的问题。用户在访问网页的时候，在浏览器开始显示之前都会有一个的白屏过程，在移动端，受限于设备性能和网络速度，白屏会更加明显。我们团队把很多技术精力放置在如何帮助平台上的Web开发者解决这个问题。因此我们设计了一个 JS-SDK 的增强版本，其中有一个重要的功能，称之为“微信 Web 资源离线存储”。JS-SDK 解决了移动网页能力不足的问题，通过暴露微信的接口使得 Web 开发者能够拥有更多的能力，然而在更多的能力之外，JS-SDK 的模式并没有解决使用移动网页遇到的体验不良的问题。用户在访问网页的时候，在浏览器开始显示之前都会有一个的白屏过程，在移动端，受限于设备性能和网络速度，白屏会更加明显。我们团队把很多技术精力放置在如何帮助平台上的Web开发者解决这个问题。因此我们设计了一个 JS-SDK 的增强版本，其中有一个重要的功能，称之为“微信 Web 资源离线存储”。JS-SDK 解决了移动网页能力不足的问题，通过暴露微信的接口使得 Web 开发者能够拥有更多的能力，然而在更多的能力之外，JS-SDK 的模式并没有解决使用移动网页遇到的体验不良的问题。用户在访问网页的时候，在浏览器开始显示之前都会有一个的白屏过程，在移动端，受限于设备性能和网络速度，白屏会更加明显。我们团队把很多技术精力放置在如何帮助平台上的Web开发者解决这个问题。因此我们设计了一个 JS-SDK 的增强版本，其中有一个重要的功能，称之为“微信 Web 资源离线存储”。JS-SDK 解决了移动网页能力不足的问题，通过暴露微信的接口使得 Web 开发者能够拥有更多的能力，然而在更多的能力之外，JS-SDK 的模式并没有解决使用移动网页遇到的体验不良的问题。用户在访问网页的时候，在浏览器开始显示之前都会有一个的白屏过程，在移动端，受限于设备性能和网络速度，白屏会更加明显。我们团队把很多技术精力放置在如何帮助平台上的Web开发者解决这个问题。因此我们设计了一个 JS-SDK 的增强版本，其中有一个重要的功能，称之为“微信 Web 资源离线存储”。JS-SDK 解决了移动网页能力不足的问题，通过暴露微信的接口使得 Web 开发者能够拥有更多的能力，然而在更多的能力之外，JS-SDK 的模式并没有解决使用移动网页遇到的体验不良的问题。用户在访问网页的时候，在浏览器开始显示之前都会有一个的白屏过程，在移动端，受限于设备性能和网络速度，白屏会更加明显。我们团队把很多技术精力放置在如何帮助平台上的Web开发者解决这个问题。因此我们设计了一个 JS-SDK 的增强版本，其中有一个重要的功能，称之为“微信 Web 资源离线存储”。JS-SDK 解决了移动网页能力不足的问题，通过暴露微信的接口使得 Web 开发者能够拥有更多的能力，然而在更多的能力之外，JS-SDK 的模式并没有解决使用移动网页遇到的体验不良的问题。用户在访问网页的时候，在浏览器开始显示之前都会有一个的白屏过程，在移动端，受限于设备性能和网络速度，白屏会更加明显。我们团队把很多技术精力放置在如何帮助平台上的Web开发者解决这个问题。因此我们设计了一个 JS-SDK 的增强版本，其中有一个重要的功能，称之为“微信 Web 资源离线存储”。'
      });
    }
    return list;
  },
  /**
   * 生成随机(100, 400)高度
   */
  getRadomHeight() {
    return parseInt(Math.random() * 300 + 100);
  }
});