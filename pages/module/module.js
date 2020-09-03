// 小程序的JS模块化方案为CommonJS
const {
  a,
  addA
} = require('./moduleA.js')

Page({
  data: {
    a: a,
  },
  tapHandler(){
    // CommonJS引用的变量是静态的，无法通过调用模块中的方法去改变
    console.log('a', a);
    addA();
    console.log('a', a);
  }
})
