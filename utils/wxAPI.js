// 本文件目的是把wx的api promise化
// 现在小程序官方提供了这个工具，叫做miniprogram-api-promise
// 也可以搜索并使用官方工具库

var appInstance = getApp()

function wxPromisify(fn) {
  return (obj = {}) => {
    return new Promise((resolve, reject) => {
      obj.success = (resp) => {
        if (resp.statusCode !== undefined && resp.statusCode !== 200) {
          console.log("fail", resp)
          reject(resp)
        } else {
          resolve(resp)
        }
      }
      obj.fail = (resp) => {
        reject(resp)
      }
      fn(obj)
    })
  }
}

Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => {
      throw reason
    })
  );
}

function wxRequest() {
  return wxPromisify(wx.request)
}

function wxCheckSession(obj) {
  return wxPromisify(wx.checkSession)(obj)
}

/**
* 微信用户登录,获取code
*/
function wxLogin(obj) {
  return wxPromisify(wx.login)(obj).then((res) => {
    return Promise.resolve(res)
  })
}

function wxGetUserInfo(obj) {
  return wxPromisify(wx.getUserInfo)(obj).then((res) => {
    return Promise.resolve(res)
  });
}
function wxGetShareInfo(obj) {
  return wxPromisify(wx.getShareInfo)(obj).then((res) => {
    return Promise.resolve(res)
  });
}

function wxShowModal(obj) {
  return wxPromisify(wx.showModal)(obj)
}

function wxUploadFile(obj) {
  return wxPromisify(wx.uploadFile)(obj)
}

function wxAuthorize(obj) {
  return wxPromisify(wx.authorize)(obj)
}

function wxGetSetting(obj) {
  return wxPromisify(wx.getSetting)(obj)
}

function wxGetImageInfo(obj) {
  return wxPromisify(wx.getImageInfo)(obj);
}

module.exports = {
  wxRequest,
  wxCheckSession,
  wxLogin,
  wxGetUserInfo,
  wxGetShareInfo,
  wxUploadFile,
  wxShowModal,
  wxAuthorize,
  wxGetSetting,
  wxGetImageInfo,
}