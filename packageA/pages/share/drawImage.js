const bgUrl = '../../../images/share.png';
const {wxGetImageInfo} = require('../../../utils/wxAPI')
const drawImage = qrUrl => {
  console.log('drawImage qr', qrUrl);
  const ctx = wx.createCanvasContext('imageCanvas');
  // 绘制背景图
  ctx.drawImage(bgUrl, 0, 0, 750/2, 1222/2);
  // 网络图片需要保存本地后再绘制
  return new Promise((resolve, reject) => {
    wxGetImageInfo({
      src: qrUrl
    }).then(res => {
      ctx.drawImage(res.path, 230, 470, 86, 86);
      ctx.draw(true, () => {
        resolve();
      });
    })
  })
}

module.exports = {
  drawImage,
}