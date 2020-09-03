const logger = wx.getRealtimeLogManager();
Page({
  onLoad(){
    logger.info('Index page loaded.');
    logger.setFilterMsg('page_index');
  }
})
