function Urlencode(data){
  var str = ''
  str = data.split("+").join("%2B").split("/").join("%2F").split("=").join("%3D").split(" ").join("%20").split("?").join("%3F").split("%").join("%25").split("#").join("%23").split("&").join("%26")
 /* if(data.indexOf("+")!= -1){
    str =data.split("+").join("%2B")
  }
  if(data.indexOf("/")!= -1){
    str=data.split("/").join("%2F")
  }
  if(data.indexOf("=")!= -1){
    str=data.split("=").join("%3D")
  }*/
  return str
}
module.exports.Urlencode = Urlencode;