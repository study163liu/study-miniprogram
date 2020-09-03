// components/skeleton.js
import SystemInfo from '../../utils/getSystemInfo'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    itemIndex: Number
  },
  /**
   * 组件的初始数据
   */
  data: {
    height: 0, //卡片高度，用来做外部懒加载的占位
    showSlot: true, //控制是否显示当前的slot内容
  },

  /**
   * 组件回收时断开observer
   */
  detached() {
    if(this.observer){
      try {
        this.observer.disconnect()
      } catch (error) {

      }
      this.observer  = null
    }
  },

  ready() {
    // console.log('我是组件:', this.data.itemIndex);
    let info = SystemInfo.getInfo();
    let { windowHeight = 667 } = info.source.system;
    let showNum = 1 // 超过屏幕的数量，目前这个设置是上下2屏，也就是observer视窗高度为5个屏高
    try {
      this.observer = this.createIntersectionObserver();
      // 监听进入或移出屏幕的上下两屏范围的item
      this.observer.relativeToViewport({ top: showNum * windowHeight, bottom: showNum * windowHeight })
        .observe(`#list-item-${this.data.itemIndex}`, res => {
          // console.log(`组件${this.data.itemIndex}的高度:`, res.boundingClientRect.height);
          let { intersectionRatio } = res;
          if (intersectionRatio === 0) {
            // item移出范围，只展示占位高度
            // console.log('【卸载】', this.data.itemIndex, '超过预定范围，从页面卸载')
            this.setData({
              showSlot: false
            })
          } else {
            // item首次渲染就在范围内或者重新进入范围内
            // 记录item所形成的高度，写入item外层容器，这样后续可以只显示占位高度
            // console.log('【进入】', this.data.itemIndex, '达到预定范围，渲染进页面')
            this.setData({
              showSlot: true,
              height: res.boundingClientRect.height
            })
          }
        })
    } catch (error) {
      console.log(error)
    }
  }
})
