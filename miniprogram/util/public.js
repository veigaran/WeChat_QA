
var CryptoJS = require('./aes.js');  //引用AES源码js
var CryptoJSNoPad = require('./nopad.js')//nopadding
var CryptoJsZeroPad = require('./zeropadding.js') //zeropadding 
var padding = CryptoJSNoPad;
var padding1 = CryptoJsZeroPad;  //测试后zeropadding为正确的加密方式

var key = CryptoJS.enc.Utf8.parse("3FF2EC019C627B94");//十六位十六进制数作为秘钥
var iv = CryptoJS.enc.Utf8.parse("F27D5C9927726BCE");//十六位十六进制数作为秘钥 
 
//解密的方法
function Decrypt(word){
  // let base64 = CryptoJS.enc.Base64.parse(word)
  // let src  = CryptoJS.enc.Base64.stringfy(base64)
  var decrypt = CryptoJS.AES.decrypt(word, key, { iv: iv, mode: CryptoJS.mode.CBC, padding:padding1}); //可选项：偏移量CryptoJS.pad.Pkcs5
  var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}
 
//加密的方法
function Encrypt(word) {
  var srcs = CryptoJS.enc.Utf8.parse(word);
  var encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: padding1});
  // return encrypted.ciphertext.toString().toUpperCase();   //这个是基础的16位16进制的加密返回值
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  // return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
}
 
 
module.exports.Decrypt = Decrypt;
module.exports.Encrypt = Encrypt;