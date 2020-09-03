// pages/share/share.js
import {reqwest} from '../../../utils/request';
import {drawImage} from './drawImage';
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  /**
   * 分享
   */
  onShareAppMessage: function (e) {
    console.log(e.from);
    let title = '';
    if(e.from === 'button'){
      title = e.target.dataset.title;
    }else{
      // 来自右上角菜单分享
      title = '分享配置3'
    }
    return {
      title,
      path: '/pages/login/login'
    }
  },
  onShareTimeline: function (e) {
    return {
      title: '朋友圈分享',
      path: '/pages/login/login'
    }
  },
  // 获取个人小程序码
  getQr(){
    return reqwest({
      url: '/qr',
      data: {
        path: `/pages/share/share?uid=${app.globalData.uid}`
      },
      method: 'GET'
    }).then( res => {
      if(res.data){
        return res.data.qrUrl
      }
    })
  },
  // 生成图片并保存
  getImage(){
    app.loginPromise.then(() => {
      this.getQr().then(qrUrl => {
        console.log('qrUrl', qrUrl);
        return drawImage(qrUrl);
      }).then(() => {
        console.log('绘制完成');
        wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 375,
            height: 611,
            canvasId: 'imageCanvas',
            success: tempRes => {
              wx.saveImageToPhotosAlbum({
                  filePath: tempRes.tempFilePath,//canvasToTempFilePath返回的tempFilePath
                  success: saveRes => {
                    wx.showToast({
                      title: `保存成功`,
                      icon: 'none',
                      duration: 1500
                    });
                  },
                  fail: err => {
                    wx.showToast({
                      title: `保存失败`,
                      icon: 'none',
                      duration: 1500
                    });
                  }
              })
            }
        })
      })
    })
  },
})