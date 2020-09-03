// pages/webview/webview.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inititalCount: 10,
    isShow: true,
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      isShow: true
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      isShow: false
    })
  },

  onMessage(e){
    console.log('小程序接收到webview消息', e);
    const data = e.detail.data;
    if(data && data.length){
      this.setData({
        inititalCount: data[data.length - 1]
      })
    }
  }
})