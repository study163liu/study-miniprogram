// pages/login/login.js
// import {wxLogin} from '../../utils/wxAPI';
import {reqwest} from '../../utils/request';
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: 'index',
    isLogin: false,
    opacityAni: {},
    indexAnimateClass: 'transition_effect initial_translate',
    selectAnimateClass: 'transition_effect initial_translate',
    hasSafeArea: app.globalData.hasSafeArea,
    bookList: [],
    bookIndex: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getBooks();
  },
  onShow() {
    console.log('show');
    setTimeout(() => {
      this.showIndex();
    }, 500);
  },
  showIndex() {
    // 重置动画状态
    this.animateStatus = 0;
    this.setData({
      indexAnimateClass: 'transition_effect'
    })
    this.animateOpacity(0, 1);
  },
  // 首页左滑消失
  hideIndex(){
    this.setData({
      indexAnimateClass: 'transition_effect final_translate'
    })
    // 底部按钮渐隐
    this.animateOpacity(60, 0);
  },
  onTransitionEnd(){
    switch (this.animateStatus) {
      case 0:
        // 进场动画结束
        this.setData({
          indexAnimateClass: 'animate_shake',
        })
        break;
      case 1:
        // 出场动画结束
        this.goSelect();
        break;
      default:
        break;
    }
    this.animateStatus++;
  },
  /**
   * 设置底部元素的动画数值
   * @param {number} y 动画最终y轴偏移距离
   * @param {number} o 动画最终透明度的值
   */
  animateOpacity(y, o) {
    const opacityAni = wx.createAnimation({
      duration: 600,
      timingFunction: 'linear',
    }).translateY(y).opacity(o).step().export();
    this.setData({
      opacityAni
    })
  },
  // 获取用户信息的回调,必须要在调用了wx.login之后且session没有过期
  onGetUserInfo(infoRes) {
    app.loginPromise.then( () => {
      if (infoRes.detail.errMsg === 'getUserInfo:ok') {
        console.log('info res', infoRes.detail);
        const {
          encryptedData,
          iv,
          userInfo: {
            nickName,
            avatarUrl,
            gender,
          }
        } = infoRes.detail;
        // 储存用户信息
        app.globalData.userInfo = {
          nickName,
          avatarUrl,
          gender,
        }
        this.setData({
          isLogin: true,
        })
        console.log('登录成功');
        // 执行登录页面的退场动画
        this.hideIndex();
        // 如果小程序有关联在微信开放平台账号下，就可以使用调用服务端接口解密获得用户的UnionId
        // 本示例小程序因为没有企业实体，注册不了开放平台账号，所以解密了也拿不到UnionId
        // reqwest({
        //   url: '/decrypt',
        //   data: {
        //     encryptedData,
        //     iv,
        //   },
        //   method: 'POST'
        // }).then( res => {
        //   if(res.data){
        //     console.log('userinfo decrypt res', res.data);
        //   }
        // })
      }else{
        wx.showToast({
          title: '请授权登录',
          icon: 'none',
          duration: 3000
        })
      }
    }, msg => {
      console.log('登录失败', msg);
    })
  },
  goSelect(){
    this.setData({
      show: 'select',
    }, () => {
      console.log('选择页出现');
      this.setData({
        selectAnimateClass: 'transition_effect'
      })
      this.animateOpacity(0, 1);   
    })
  },
  getBooks(){
    reqwest({
      url: `/book`,
      method: 'GET',
    }).then(res => {
      if (res.code === 0) {
        const info = res.data
        const bookList = info.map(item => {
          if (item.femaleCount >= 10000) {
            item.femaleCount = (item.femaleCount / 10000).toFixed(1) + '万'
          }
          if (item.maleCount >= 10000) {
            item.maleCount = (item.maleCount / 10000).toFixed(1) + '万'
          }
          return {
            bookName: item.book.title,
            bookCover: item.book.imageUrl,
            bookId: item.book.bookId,
            femaleCount: item.femaleCount,
            maleCount: item.maleCount,
            authors: item.authors.map(i => i.name).join(','),
            recommendBookId: item.recommendBookId,
            recommend: item.recommend
          }
        })
        console.log('bookList', bookList);
        // 只装载渲染层需要的data到bookList对象中
        this.setData({
          bookList,
        })
      } else {
        wx.showToast({
          title: res.msg,
          duration: 3000
        })
      }
    })
  },
  onSwiperChange(e){
    this.setData({
      bookIndex: e.detail.current,
    })
  },
  goShare(){
    wx.navigateTo({
      url: '/pages/share/share',
    })
  }
})