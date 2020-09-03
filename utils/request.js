import wxAPI from './wxAPI';
import config from './config'
import uuidv1 from './uuid';

const origin = `http://${config.host}`;

export const getCurrentPageUrl = function () {
  var pages = getCurrentPages()
  var currentPage = pages[pages.length - 1]
  var url = currentPage.route

  return url
}

//获取小程序的协议header中所需的X-User-Agent,同时生成并存储设备ID
export const getXUserAgent = function () {
  let xUserAgent = wx.getStorageSync('xUserAgent');
  if (!xUserAgent) {
    const systemInfo = getApp().globalData.systemInfo;
    let deviceId = wx.getStorageSync('deviceId');
    if (!deviceId) {
      deviceId = uuidv1();
      wx.setStorageSync('deviceId', deviceId);
    }
    xUserAgent = `cpminiprogram/${config.clientVersion}/${config.protocolVersion} (${deviceId};${systemInfo.model};${systemInfo.screenHeight}x${systemInfo.screenWidth}) (${(systemInfo.system).replace(' ', ';')}) (miniprogram)`
    wx.setStorageSync('xUserAgent', xUserAgent);
  }
  return xUserAgent;
}


/***
 * 数据请求方法
 * @param options object类型
 * url:必填，请求链接
 * data:请求数据object类型，可为空
 * method："GET" or "POST"
 * header:object类型
 * domainType: 空或者'protocolDomain'
 * @returns {*}返回Promise
 */
export const reqwest = function (options = {}) {
  const wxRequest = wxAPI.wxRequest();
  return wxRequest({
    url: origin + options.url,
    data: options.data,
    method: options.method || 'GET',
    dataType: options.dataType,
    header: {
      uid: getApp().globalData.uid,
      ...options.header
    }
  }).then((res) => {
    return Promise.resolve(res.data)
  }, (res) => {
    if (res.statusCode === 401) {
      wx.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.reLaunch({
          url: 'pages/login/login'
        })
      }, 800);
    }
    return Promise.reject(res.data)
  })
}

export const uploadFile = function (options = {}) {
  return wxAPI.wxUploadFile({
    url: domain + options.url,
    filePath: options.filePath,
    name: options.name,
    formData: options.formData || {},
    header: options.header || {
      "X-Authorization": wx.getStorageSync('token') || ''
    }
  }).then((res) => {
    return Promise.resolve(JSON.parse(res.data))
  }, (res) => {
    return Promise.reject(JSON.parse(res.data))
  })
}