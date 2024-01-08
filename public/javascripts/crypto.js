const crypto = require('crypto');

// TradeInfo字串組合
function dataChain(TradeInfo) {
    console.log('dataChainTradInfo', TradeInfo)
    return Object.keys(TradeInfo).map(key => {
        let value = TradeInfo[key];
        if (['ItemDesc', 'Email'].includes(key)) {
            value = encodeURIComponent(value); //特殊字元編碼
        }
        return `${key}=${value}`;
    }).join('&');
}
  
  // aes 加密
  function aes_encrypt(TradeInfo) {
    const HASHKEY = TradeInfo.key;
    const HASHIV = TradeInfo.iv;
    const cipher = crypto.createCipheriv('aes-256-cbc', HASHKEY, HASHIV);
    const encrypted = Buffer.concat([ cipher.update( dataChain(TradeInfo),'utf8' ), cipher.final() ]);
    return encrypted.toString('hex');
  }
  
  // sha256 加密
  function sha_encrypt(aesEncrypt, HASHKEY, HASHIV) {
    const sha = crypto.createHash('sha256');
    const plainText = `HashKey=${HASHKEY}&${aesEncrypt}&HashIV=${HASHIV}`;

    return sha.update(plainText).digest('hex').toUpperCase();
  }
  
  // 將 aes 解密
  function aes_decrypt(TradeInfo, HASHKEY, HASHIV) {
    const decrypt = crypto.createDecipheriv('aes256', HASHKEY, HASHIV);
    decrypt.setAutoPadding(false);
    const text = decrypt.update(TradeInfo, 'hex', 'utf8');
    const plainText = text + decrypt.final('utf8');
    const result = plainText.replace(/[\x00-\x20]+/g, '');
    return JSON.parse(result);
  }

  module.exports = {
    dataChain,
    aes_encrypt,
    sha_encrypt,
    aes_decrypt
};