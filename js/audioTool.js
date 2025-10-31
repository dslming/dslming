import { MD5 } from "./MD5.js";


const YOUDAO_PRONOUNCE_SECRET_KEY = 'U3uACNRWSDWdcsKm';
function makeYoudaoPronounceSign(params, signSecretKey) {
  var _a, _b;
  const paramOrder = (_b = (_a = params.pointParam) === null || _a === void 0 ? void 0 : _a.split(',')) !== null && _b !== void 0 ? _b : [];
  const signParams = {};
  for (const key of paramOrder) {
    if (key in params && key !== 'key') {
      signParams[key] = params[key];
    }
  }
  const queryParts = [];
  for (const key of paramOrder) {
    if (key in signParams && key !== 'key') {
      const value = signParams[key];
      queryParts.push(`${key}=${value}`);
    }
  }
  const baseString = queryParts.join('&');
  const signString = `${baseString}&key=${signSecretKey}`;
  return new MD5(new TextEncoder().encode(signString)).hexdigest();
}

// https://dict.youdao.com/pronounce/base?product=webdict&appVersion=1&client=web&mid=1&vendor=web&screen=1&model=1&imei=1&network=wifi&keyfrom=dick&keyid=voiceDictWeb&mysticTime=1761888073922&yduuid=abcdefg&le=&phonetic=&rate=4&word=hello%20world&type=2&id=&sign=4a957e58063307c97e807c5f85d78811&pointParam=appVersion,client,imei,keyfrom,keyid,mid,model,mysticTime,network,product,rate,screen,type,vendor,word,yduuid,key
export function makeYoudaoPronounceUrl(word, { type = '2', mysticTime = null, secretKey = YOUDAO_PRONOUNCE_SECRET_KEY } = {}) {
  if (mysticTime == null) {
    mysticTime = Date.now().toString();
  }
  else if (typeof mysticTime === 'number') {
    mysticTime = mysticTime.toString();
  }
  const baseParams = {
    product: 'webdict',
    appVersion: '1',
    client: 'web',
    mid: '1',
    vendor: 'web',
    screen: '1',
    model: '1',
    imei: '1',
    network: 'wifi',
    keyfrom: 'dick',
    keyid: 'voiceDictWeb',
    mysticTime,
    yduuid: 'abcdefg',
    le: '',
    phonetic: '',
    rate: '4',
    word: word,
    type,
    id: '',
    pointParam: 'appVersion,client,imei,keyfrom,keyid,mid,model,mysticTime,network,product,rate,screen,type,vendor,word,yduuid,key',
  };
  const sign = makeYoudaoPronounceSign(baseParams, secretKey);
  const queryParams = new URLSearchParams(Object.assign(Object.assign({}, baseParams), { sign }));
  const queryString = queryParams.toString();
  return `https://dict.youdao.com/pronounce/base?${queryString}`;
}
