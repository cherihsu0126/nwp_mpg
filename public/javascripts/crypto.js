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
    let HASHKEY = TradeInfo.key;
    let HASHIV = TradeInfo.iv;
    console.log('dataChain(TradeInfo)',dataChain(TradeInfo))

    if (String(TradeInfo.EncryptType) === '1') {
      // PHP
      // $cipher_iv = bin2hex(openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-gcm')));
      // $tag = '';
      // $edata1 =  $cipher_iv . '.' . bin2hex(openssl_encrypt($data1, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $cipher_iv, $tag, '', 16)) . '.' . bin2hex($tag);;
      
      // AES/GCM加密模式
      const cipher_iv = Buffer.from(crypto.randomBytes(12), 'utf8'); // GCM 推薦使用 12(*二進制) 的 IV 
      const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(HASHKEY, 'utf8'), cipher_iv, {authTagLength:16});
      let encrypted = Buffer.concat([ cipher.update( dataChain(TradeInfo),'utf8' ), cipher.final(), cipher.getAuthTag() ]);
      const tag = cipher.getAuthTag();
      return `${cipher_iv.toString('hex')}.${encrypted.toString('hex')}.${tag.toString('hex')}`;
    } else {
      // PHP
      // bin2hex(openssl_encrypt($data1, "AES-256-CBC", $key, OPENSSL_RAW_DATA, $iv)); // bin二進制 to hex十六進制(), OPENSSL_RAW_DATA(輸出為二進制)
      // AES/CBC加密模式
      const cipher = crypto.createCipheriv('aes-256-cbc', HASHKEY, HASHIV);
      const encrypted = Buffer.concat([ cipher.update( dataChain(TradeInfo),'utf8' ), cipher.final() ]);
      return encrypted.toString('hex');
    }
  }
  
  // sha256 加密
  function sha_encrypt(aesEncrypt, HASHKEY, HASHIV) {
    const sha = crypto.createHash('sha256');
    const plainText = `HashKey=${HASHKEY}&${aesEncrypt}&HashIV=${HASHIV}`;

    return sha.update(plainText).digest('hex').toUpperCase();
  }
  

  module.exports = {
    dataChain,
    aes_encrypt,
    sha_encrypt
};