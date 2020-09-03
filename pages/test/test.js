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
  onPullDownRefresh(){
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 2000);
  },
  scrollEnough(){
    console.log('滚动到位了');
  },
  refreshStart(){
    console.log('刷新开始');
    this.setData({
      showRefresh: true,
    })
    setTimeout(() => {
      this.setData({
        showRefresh: false,
      })
    }, 1000);
  },
  refreshCancel(){
    console.log('刷新取消');
  }
})
