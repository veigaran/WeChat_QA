//index.js
const app = getApp()
var Dec = require('../../util/public.js');    //aes加密与解密封装的方法
var URL = require('../../util/url.js');
Page({
  data: {
    avatarUrl: '', //用户头像url
    nickName:'', // 用户昵称
    code:'0', //用户登录凭证
    appid:'wxaee1e13cad508996', //开发者appid
    secret:'fe6f6a1ab7ec3148436138f129dad27a', //开发者appsecret
    openid:'',
    userinfo:{},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    key :"3FF2EC019C627B94",
    iv :"F27D5C9927726BCE",
    getOpenidStr:'',//获取openid时的传参
  },

  //页面预加载获取相关信息
  onLoad: function(options) {
    var that=this;
    //登录获得code
    wx.login({
      success:function(res){
        that.code = res.code
        console.log('code为：'+that.code)
        var str1 = "appid="+that.data.appid+'&code='+res.code+'&secret='+that.data.secret;
        that.getOpenidStr = URL.Urlencode(Dec.Encrypt(str1))
        console.log(that.getOpenidStr)
        //获取openid
        wx.request({
          url:'https://www.uandi.top/student_getOpenID.action?p='+that.getOpenidStr,
          success:function(res){
            // console.log(res)
            var t =  Dec.Decrypt(res.data["response"])//结果为string，不是json格式，还需要手动截取
            that.openid = t.substring(11,t.length-2)
            console.log(that.openid)
          }
        })
      },
    })
    //获得用户信息
    wx.getUserInfo({
      success: res => {
        // console.log(res)    //获取的用户信息还有很多，都在res中，看打印结果
        that.avatarUrl =res.userInfo.avatarUrl
        that.nickName =res.userInfo.nickName
        wx.setStorage({
          data: res.userInfo,
          key: 'key',
          success: function() {      //缓存成功后，输出提示
            // console.log('写入userInfo缓存成功')
          }
        })
        // console.log("初始："+that.avatarUrl)
        wx.getImageInfo({
          // src: 'https://thirdwx.qlogo.cn/mmopen/vi_32/3mxLS528FVrTNUH1eUK2j6Fu4IC6dopcibia14fcsnpvnxBeR8n04o5PT0MJbIiahojDibVz83LV9vOKl4gyhMeC7Q/132',
          src:that.avatarUrl,
          success:function(e){
            console.log(e.path)
            wx.setStorage({
              data: e.path,
              key: 'key_pic',
            })
          },
          fail: function(srev){
            console.log("失败")
            console.log(srev);
          }
        })
      }
    })

  
    // console.log("分割线")
    // 这个是使用aes进行加密和解密的方法和列子
    // var s = '{"status":2,"testInfo":{"teaname":"黄山"}}'
    // console.log(Dec.Encrypt(s));
    // console.log(Dec.Decrypt('AZqi68ipdVE0xd8ZmpcdenqQgvNBXTjVq20qlixRyUwwVa2iexr88Ynw7N/evwQn')) //openid
    //解析后：{"openID":"oUGQO5L16D02xtM16PxPpzQepxww"}
    // var temp =Urlencode(that.getOpenidStr)
    // console.log(temp)
    // var s1 = '9Tkkk6O7OZWstc/MfKpASSXl45y/wMiHvVXiwlOHnKgxSGse8MI/f64SK8f7tDUDc0rxODhHoAh4FAzgN7SryEZk7wwvjiuVupKZ8DwrRlF17pGUNu9SeRKsNZT84T2n'
    // console.log(Dec.Decrypt(s1))

  },
  

  //页面判断及跳转
  pageRedirect:function(url){
    var that =this
    wx.request({
      url: url,
      success:function(re){
        console.log(re.data)
        console.log(re.data['response'])
        var s1 = re.data['response'].replace(/[\r\n]/g,"") //一直报错的bug找到了，因为后端传来的字符串过长时会添加一个换行，所以前端一直解密不正确，害~
        var temp =Dec.Decrypt(s1);
        // console.log("response的内容为："+temp)
        // console.log('解码后的数据为：'+temp+typeof(temp))
        var status_temp = temp.substring(0,11)+'}'
        console.log(status_temp+temp.substring(23,temp.length-1))
        var info = JSON.parse(temp.substring(23,temp.length-1))        
        var status = JSON.parse(status_temp)
        console.log(status["status"]+'------'+info["teaname"])
       
        if(status["status"]==0){
          wx.redirectTo({ //跳转到题目页面
            url: '../choices/choices?caseId='+info.caseId+"&type="+info.type
            +"&optionCount="+info.optionCount+"&couId="+info.couId+"&openid="+that.openid,
          })
        }
        else{
          wx.showToast({
            title: '未开始答题',
            icon: 'success',
            duration: 1000
          })
        }
      }
    })
  },

  //扫码
  getScancode: function() {
    var that = this;
    // 允许从相机和相册扫码
    wx.scanCode({
      success: (res) => {
        this.pageRedirect(res.result)
        /**/
      }
    })
  },

 // 图片上传测试
  upImg:function(e){
  //获取图片信息
    wx.getImageInfo({
      src: this.avatarUrl,
      success: function (sres) {   
  //上传图片
        wx.uploadFile({
          url: 'https://veigar.applinzi.com/upload.php',
          filePath: sres.path,
          method:'POST',
          name: "file",
          header: {  // 请求头  
            Authorization:'token',
            'content-type':'multipart/form-data',
            // 'x-token':token    // 问问后端是否需要token 不需要就不用传  
        }, 
          success: function (res) {
            console.log(res)
          },
          error: function (rev) {
            console.log(rev);
          }
        });
      },
      fail: function(srev){
        console.log(srev);
      }
    })
  },
  
  bindGetUserInfo: function(e){
    var that = this;
    //此处授权得到userInfo
    console.log(e.detail.userInfo);
    //接下来写业务代码
  
    //最后，记得返回刚才的页面
  
   },

   upLoadImage:function(){
    var that=this;
    //上传文件
    wx.chooseImage({
      success(res) {
        const tempFilePaths = res.tempFilePaths
        that.setData({
          imgSrc: tempFilePaths
        })
        wx.uploadFile({
          url: 'https://veigar.applinzi.com/upload.php', 
          filePath: tempFilePaths[0],
          name: 'fileUp001',
          success(res) {
            const data = res.data
            console.log(res);
            //do something
          }
        }) 
      }
    })
 }

})
