/**
 * @doc https://www.iso.org/standard/63545.html
 */
export enum MediaOriginCountry {
  US = "US", // 美国 (United States)
  CN = "CN", // 中国 (China)
  TW = "TW", // 中国台湾 (Taiwan)
  HK = "HK", // 中国香港 (Hong Kong)
  JP = "JP", // 日本 (Japan)
  DE = "DE", // 德国 (Germany)
  GB = "GB", // 英国 (United Kingdom)
  FR = "FR", // 法国 (France)
  IT = "IT", // 意大利 (Italy)
  BR = "BR", // 巴西 (Brazil)
  CA = "CA", // 加拿大 (Canada)
  AU = "AU", // 澳大利亚 (Australia)
  IN = "IN", // 印度 (India)
  RU = "RU", // 俄罗斯 (Russia)
  KR = "KR", // 韩国 (South Korea)
  BE = "BE", // 比利时
  ES = "ES", // 西班牙 (Spain)
  MX = "MX", // 墨西哥 (Mexico)
  ID = "ID", // 印度尼西亚 (Indonesia)
  TR = "TR", // 土耳其 (Turkey)
  SA = "SA", // 沙特阿拉伯 (Saudi Arabia)
  ZA = "ZA", // 南非 (South Africa)
  AR = "AR", // 阿根廷 (Argentina)
  TH = "TH", // 泰国 (Thailand)
  EG = "EG", // 埃及 (Egypt)
  NL = "NL", // 荷兰 (Netherlands)
  CH = "CH", // 瑞士 (Switzerland)
  SE = "SE", // 瑞典 (Sweden)
  PL = "PL", // 波兰 (Poland)
  PK = "PK", // 巴基斯坦 (Pakistan)
  NG = "NG", // 尼日利亚 (Nigeria)
  MY = "MY", // 马来西亚 (Malaysia)
  BD = "BD", // 孟加拉国 (Bangladesh)
}

export const SeasonMediaOriginCountryTexts: Record<MediaOriginCountry, string> = {
  [MediaOriginCountry.CN]: "国产剧",
  [MediaOriginCountry.TW]: "台剧",
  [MediaOriginCountry.HK]: "港剧",
  [MediaOriginCountry.JP]: "日剧",
  [MediaOriginCountry.KR]: "韩剧",
  [MediaOriginCountry.US]: "美剧",
  [MediaOriginCountry.GB]: "英剧",
  [MediaOriginCountry.FR]: "法国",
  [MediaOriginCountry.IT]: "意大利",
  [MediaOriginCountry.BR]: "巴西",
  [MediaOriginCountry.BE]: "比利时",
  [MediaOriginCountry.DE]: "德国",
  [MediaOriginCountry.CA]: "加拿大",
  [MediaOriginCountry.AU]: "澳大利亚",
  [MediaOriginCountry.IN]: "印度",
  [MediaOriginCountry.RU]: "俄罗斯",
  [MediaOriginCountry.ES]: "西班牙",
  [MediaOriginCountry.MX]: "墨西哥",
  [MediaOriginCountry.ID]: "印度尼西亚",
  [MediaOriginCountry.TR]: "土耳其",
  [MediaOriginCountry.SA]: "沙特阿拉伯",
  [MediaOriginCountry.ZA]: "南非",
  [MediaOriginCountry.AR]: "阿根廷",
  [MediaOriginCountry.TH]: "泰国",
  [MediaOriginCountry.EG]: "埃及",
  [MediaOriginCountry.NL]: "荷兰",
  [MediaOriginCountry.CH]: "瑞士",
  [MediaOriginCountry.SE]: "瑞典",
  [MediaOriginCountry.PL]: "波兰",
  [MediaOriginCountry.PK]: "巴基斯坦",
  [MediaOriginCountry.NG]: "尼日利亚",
  [MediaOriginCountry.MY]: "马来西亚",
  [MediaOriginCountry.BD]: "孟加拉国",
};
