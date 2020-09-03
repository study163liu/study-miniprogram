//app.js
import {wxLogin, wxGetShareInfo} from './utils/wxAPI';
import {reqwest} from './utils/request';
App({
  globalData: {
    userInfo: null,
    shareTicket: '',
    uid: '',
  },
  onLaunch: function ({
    path,
    scene,
    query,
    shareTicket
  }) {
    // 设置分享附带hareTicket
    wx.showShareMenu({
      withShareTicket: true,
    })
    // 获取系统信息
    wx.getSystemInfo({
      success: (res) => {
        console.log(res)
        this.globalData.systemInfo = res;
        this.globalData.hasSafeArea = res.screenHeight > res.safeArea.bottom;
      }
    })
    // 进入小程序就直接调用一次wx.login，以备后续使用
    this.loginPromise = wxLogin().then( res => {
      console.log('login res', res);
      return reqwest({
        url: '/login',
        data: {
          code: res.code
        },
        method: 'POST'
      }).then(loginRes => {
        if(loginRes.data){
          this.globalData.uid = loginRes.data.uid;
          console.log('login complete, uid:', this.globalData.uid);
          // 以下方法为从微信群打开带shareTicket的小程序卡片后，通过服务端解密获取该群的唯一ID的过程
          if(shareTicket){
            this.getShareInfo(shareTicket);
          }
          return Promise.resolve();
        }else{
          return Promise.reject();
        }
      })
    }, res => {
      console.log('登录失败！' + res.errMsg)
      return res.errMsg;
    })
  },
  // 获取分享信息
  getShareInfo(shareTicket){
    console.log('shareTicket', shareTicket);
    this.loginPromise.then(loginRes => {
      // 用shareTicket和微信的api获得分享打开时的详细信息
      wxGetShareInfo({
        shareTicket
      }).then(shareInfoRes => {
        // 发送到服务端进行解密，获取当前是从哪个群打开的小程序
        const { encryptedData, iv} = shareInfoRes;
        reqwest({
          url: '/decrypt',
          data: {
            encryptedData,
            iv,
          },
          method: 'POST'
        }).then( res => {
          if(res.data){
            console.log(`从群Id${res.data.openGId}打开的小程序`);
            wx.showToast({
              title: `当前打开的小程序的群ID为${res.data.openGId}`,
              icon: 'none',
              duration: 1500
            });
          }
        })
      })
    })
  },
})