// miniprogram/pages/choices/choices.js

var Dec = require('../../util/public.js'); 
const FormData = require('../../util/formData.js')
var URL = require('../../util/url.js');
const Multipart = require('../../util/Multipart.min.js')
let formData = new FormData();
Page({
  data: {
      caseId:0, //题目ID
      type:0,  //题目类型，0-单选,1-多选,2-抢答问答，3-抢答单选，4-抢答多选，5-抽奖摇号模式
      optionCount:0, //选项个数
      couId:'', // 教师ID
      answers:[{
        name: 'A',
        checked: false
      }, {
        name: 'B',
        checked: false
      }, {
        name: 'C',
        checked: false
      }, {
        name: 'D',
        checked: false
      }, {
        name: 'E',
        checked: false
      }, {
        name: 'F',
        checked: false
      }, {
        name: 'G',
        checked: false
      }, {
        name: 'H',
        checked: false
      }],  //选项信息
      postInfo:[], //提交的选项信息
      submitStatus:0, //用于接受单选及多选提交后的返回状态信息
      choice:'', // 用于存储用户选择的选项信息，ABC...
      openId:'',  //获取的openid
      nickname:'', // 用户昵称
      avatarUrl:'', // 用户头像地址
      picPath:'',//图片路径
    },

 // 多选
  checkbox: function (e) {
    var index = e.currentTarget.dataset.index;//获取当前点击的下标
    var checkboxArr = this.data.answers;//选项集合
    checkboxArr[index].checked = !checkboxArr[index].checked;//改变当前选中的checked值
    this.setData({
      answers: checkboxArr
    });
  },
  checkboxChange: function (e) {
    var checkValue = e.detail.value;
    this.setData({
      checkValue: checkValue,
      choice:checkValue
    });
  },
  confirm: function() {// 提交
    console.log(this.data.checkValue,typeof(this.data.checkValue)),//所有选中的项的value
    console.log("--------")
    console.log(this.data.choice)
    console.log(this.nickname)
    console.log(this.avatarUrl)
  },

  //单选
  radio: function (e) {
    var index = e.currentTarget.dataset.index;//获取当前点击的下标
    var checkboxArr = this.data.answers;//选项集合
    if (checkboxArr[index].checked) return;//如果点击的当前已选中则返回
    checkboxArr.forEach(item => {
      item.checked = false
    })
    checkboxArr[index].checked = true;//改变当前选中的checked值
    this.setData({
      answers: checkboxArr
    });
  },
  radioChange: function (e) {
    var checkValue = e.detail.value;
    this.setData({
      checkValue: checkValue,
      choice:checkValue
    });
  },

  //单选及多选答案提交
  choiceSubmit:function(e){
    var s1 = "id="+this.data.couId+'&caseid='+this.data.caseId+'&choice='+this.data.choice+'&openid='+this.data.openId
    var submitStr = URL.Urlencode(Dec.Encrypt(s1))
    wx.request({
      url: 'https://www.uandi.top/student_voteWeixin.action?p='+submitStr,
      success:function(res){
        console.log(res)
        var t = Dec.Decrypt(res.data["response"])
        // console.log(t)
          var status = t.substring(10,11)
          // console.log(status)
          if(status==0){ //正常提交
            wx.showToast({
              title: '成功提交',
            })
          }else if(status==1){ //未提交选项
            wx.showToast({
              title: '必须提交选项',
            })
          }else if(status==2){ //测试未开始或结束
            wx.showToast({
              title: '测试未开始或已结束',
            })
          }else if(status==3){ //页面已过期
            wx.showToast({
              title: '页面已过期，请刷新后尝试',
            })
          }else if(status==4){ //重复提交
            wx.showToast({
              title: '已提交，请勿重复提交',
            })
          }else{ //系统错误
            wx.showToast({
              title: '系统错误',
            })
          } 
        },
        fail:function(err){
          console.log(err)
        }
    })
  },

  //抢答题和抽奖题提交，包括头像上传
  picSubmit:function(e){
    var that =this
    var formdata={ //需提交的表单数据
      id:this.data.couId,//教师id（第二个模块返回值couId）
      caseid:this.data.caseId,//caseId题目id（第二个模块返回值caseId）
      openid:this.data.openId,//openid
      wxname:this.data.nickname, //微信名
      choice:this.data.choice,//选项（抢答题choice=X；摇号模式 choice=Z）
      type:this.data.type 
    }
    console.log(formdata,typeof(formdata))

    //最终方法！！！
    wx.uploadFile({
      filePath: that.picPath,
      name: 'stufile',
      url: 'https://www.uandi.top/uploadWeinxin.action',
      header: { "Content-Type": "multipart/form-data;boundary=62633c9f-6bd5-4967-8cda-5a51027a482e" },
      formData:{
        "stuinfo":Dec.Encrypt(JSON.stringify(formdata)),
      },
      success(res){
      console.log(res)
      console.log("成功上传图片")
      var temp = res.data
      console.log(temp,typeof(temp))
      var t =temp.substring(13,temp.length-8)
      console.log(t,typeof(t))
      console.log(Dec.Decrypt(t))
      
      var status_data = Dec.Decrypt(t)
      // var status = temp.substring(13,temp.length-2)
      console.log(status_data,typeof(status_data))
      var status  =status_data[10]
      // console.log(Dec.Decrypt)
      if(status==0){ //正常提交
        wx.showToast({
          title: '成功提交',
        })
      }else if(status==6){ //已有人抢答
        wx.showToast({
          title: '已经有人抢答',
        })
      }else if(status==2){ //测试未开始或结束
        wx.showToast({
          title: '测试未开始或已结束',
        })
      }else if(status==3){ //页面已过期
        wx.showToast({
          title: '页面已过期，请刷新后尝试',
        })
      }else if(status==4){ //重复提交
        wx.showToast({
          title: '已提交，请勿重复提交',
        })
      }else{ //系统错误
        wx.showToast({
          title: '系统错误',
        })
      } 
      }
    })
    
    //方法一：自定义拼接构成data
    /*
    wx.request({
      url: 'https://www.uandi.top/uploadWeinxin.action',
      method: "POST",
      header: {'content-type':'multipart/form-data; boundary=62633c9f-6bd5-4967-8cda-5a51027a482e',},
      data:'\r\n--62633c9f-6bd5-4967-8cda-5a51027a482e' +
      '\r\nContent-Disposition: form-data; name="stuinfo"' +
      '\r\n' +
      '\r\n' +formdata+
      '\r\n--62633c9f-6bd5-4967-8cda-5a51027a482e' +
      '\r\nContent-Disposition: form-data; name="stufile"' +
      '\r\n' +
      '\r\nvalue2' +
      '\r\n--62633c9f-6bd5-4967-8cda-5a51027a482e--',
    success: function (res) {
      
     }
    })*/
    
    //方法二：调用已封装的js函数
    //调用它的append()方法来添加字段或者调用appendFile()方法添加文件
    /*formData.append("stuinfo", formdata);
    formData.appendFile("stufile", that.picPath);
    let data = formData.getData();
    console.log(data)
    console.log(data.buffer)
    //添加完成后调用它的getData()生成上传数据，之后调用小程序的wx.request提交请求
    wx.request({
      url: 'https://www.uandi.top/uploadWeinxin.action',
      header: {
        'content-type': data.contentType
      },
      data: data.buffer,
      success:function(res){
        console.log(res)
        // console.log("成功上传图片")
        // var status = res.data["status"]
        // 后续返回信息判断待补充
      }
    });

    //方法三：是直接封装请求,这个返回的是Promise对象
    /*const fields=[formdata];
    const files=
    [
        { name: "stufile", filePath: that.picPath },
    ];
    let result = new Multipart({
      files,
      fields
    }).submit('https://www.uandi.top/uploadWeinxin.action');
  result.then(function (res) {
  //请求结果
    console.log(res);
  });*/


    
    // wx.getImageInfo({
    //   src: this.avatarUrl,
    //   success: function (sres) {   
    //    //上传图片
    //     wx.uploadFile({
    //       url: 'https://www.uandi.top/uploadWeinxin.action',
    //       filePath: sres.path,
    //       name: "stufile",
    //       header: {  // 请求头  
    //         Authorization:'token',
    //         'content-type':'multipart/form-data',
    //         // 'x-token':token    // 问问后端是否需要token 不需要就不用传  
    //     }, 
    //       success: function (res) {
    //         console.log(res)
    //         console.log("成功上传图片")
    //       var status = res.data["status"]
    //       this.setData({
    //         submitStatus:res.data["status"]
    //       })
    //       if(status==0){ //正常提交
    //         wx.showToast({
    //           title: '成功提交',
    //         })
    //       }else if(status==6){ //已有人抢答
    //         wx.showToast({
    //           title: '已经有人抢答',
    //         })
    //       }else if(status==2){ //测试未开始或结束
    //         wx.showToast({
    //           title: '测试未开始或已结束',
    //         })
    //       }else if(status==3){ //页面已过期
    //         wx.showToast({
    //           title: '页面已过期，请刷新后尝试',
    //         })
    //       }else if(status==4){ //重复提交
    //         wx.showToast({
    //           title: '已提交，请勿重复提交',
    //         })
    //       }else{ //系统错误
    //         wx.showToast({
    //           title: '系统错误',
    //         })
    //       } 
    //       },
    //       error: function (rev) {
    //         console.log(rev);
    //       }
    //     });
    //   },
    //   fail: function(srev){
    //     console.log(srev);
    //   }
    // })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that =this
      console.log(options)
      that.setData(
        {
          caseId:options.caseId,
          type:options.type,
          optionCount:options.optionCount,
          couId:options.couId,
          answers:that.data.answers.slice(0,options.optionCount),
          openId:options.openid,
        }
      )
      console.log(this.data.caseId,this.data.type,this.data.optionCount,this.data.couId)
      console.log(this.data.answers,this.openid)
      if(options.type==2){ //抢答问答题，设置choice为X
        that.choice = 'X'
      }
      else if(options.type==5){ //抽奖题，设置choice为Z
        that.choice ='Z'
      }
      wx.getStorage({
        key: 'key',    //这个是刚才在缓存数据时的关键字，保持一致
        success: function(r) {   //成功后回调的函数，先打印出来
          console.log(r.data);
          that.avatarUrl=r.data['avatarUrl']
          that.nickname=r. data['nickName']
          console.log("内部"+that.avatarUrl)
        },
        fail: function() {      //失败后回调的函数
          console.log('读取user_key发生错误')
        }  
      }) 
      wx.getStorage({
        key: 'key_pic',
        success:function(res){
          // console.log('传过来的图片路径为：'+res.data)
          that.picPath=res.data
          // console.log(that.picPath)
        }
      })   
  },
 

})