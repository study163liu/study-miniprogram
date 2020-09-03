const logger = wx.getRealtimeLogManager();

Page({
  data: {
    text: 'hello world!',
    showRefresh: false
  },
  onLoad(){
    let data = wx.getSystemInfoSync();
    data = Object.keys(data).map(item => item + ':' + data[item] + ',').join('\n');
    this.setData({
      text: data,
    })
  },
  scrollEnough(){
    console.log('滚动到位了');
    // 加了个震动提示效果
    wx.vibrateShort();
    logger.info('Pull enough.');
    logger.setFilterMsg('page_pull');
  },
  refreshStart(){
    console.log('刷新开始');
    // 开始刷新，先把showRefresh设置为true
    // 为的是wxs中监控showRefresh变为false时下拉动画还原
    this.setData({
      showRefresh: true,
    })
    // 此处模拟1秒后数据刷新完成，下拉还原
    setTimeout(() => {
      if(this.data.showRefresh){
        this.setData({
          showRefresh: false,
        })
      }
    }, 1000);
  },
  refreshCancel(){
    console.log('刷新取消');
    this.setData({
      showRefresh: false,
    })
  }
})
