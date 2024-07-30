import parse from "url-parse";

import { MediaOriginCountry } from "@/biz/constants/index";
import { padding_zero } from "@/utils/index";

import { SubtitleFile, SubtitleFileSuffix, SubtitleParagraph } from "./types";
import { SubtitleCore } from "./index";

export function timeStrToSeconds(durationStr: string) {
  if (durationStr.match(/[0-9]{1,2}:[0-9]{2}:[0-9]{2}[\.,]/)) {
    const timeParts = durationStr.split(":");
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = parseFloat(timeParts[2].replace(",", ".")); // 处理逗号分隔的秒和毫秒部分
    return parseFloat((hours * 60 * 60 + minutes * 60 + seconds).toFixed(2));
  }
  if (durationStr.match(/[0-9]{2}:[0-9]{2}[\.,]/)) {
    const timeParts = durationStr.split(":");
    const minutes = parseInt(timeParts[0]);
    const seconds = parseFloat(timeParts[1].replace(",", ".")); // 处理逗号分隔的秒和毫秒部分
    return parseFloat((minutes * 60 + seconds).toFixed(2));
  }
  return 0;
}
export function formatHourNumCount(v: string) {
  const r = v.match(/([0-9]{1,2})(:[0-9]{2}:[0-9]{2}[\.,])([0-9]{1,})/);
  if (!r) {
    return v;
  }
  const [, a, b, c] = r;
  return padding_zero(a) + b + padding_zero(c, { count: 3, pos: 2 });
}

export function parseSubtitleURL(url: string): SubtitleFileSuffix {
  if (!url) {
    return "srt";
  }
  const { pathname } = parse(url);
  const segments = pathname.split(".");
  const suffix = segments.pop();
  if (suffix) {
    return suffix.toLowerCase() as SubtitleFileSuffix;
  }
  return "srt";
}
const SubtitleLanguageMap = {
  chs: "中文",
  cht: "繁体中文",
  eng: "英文",
  jpn: "日语",
  fra: "法语",
  ger: "德语",
  spa: "西班牙语",
  ita: "意大利语",
  rus: "俄语",
  kor: "韩语",
  tur: "土耳其语",
  ara: "阿拉伯语",
  por: "葡萄牙语",
};
export function extraLanguageFromSubtitleURL(url: string) {
  const r = url
    .toLowerCase()
    .match(
      /\b(chs|cht|eng|fra|ger|spa|ita|rus|kor|tur|ara|por)(\&(chs|cht|eng|fra|ger|spa|ita|rus|kor|tur|ara|por)){0,1}/
    );
  if (!r) {
    return [] as MediaOriginCountry[];
  }
  return [r[1], r[3]].filter(Boolean) as MediaOriginCountry[];
}

const SUBTITLE_PARSER_MAP: Record<SubtitleFileSuffix, (content: string) => SubtitleParagraph[]> = {
  srt: (content: string) => {
    if (!content) {
      return [];
    }
    let oriParagraphs = content.split("\r\n\r\n").filter(Boolean);
    if (oriParagraphs.length === 1) {
      oriParagraphs = oriParagraphs[0].split("\n\n").filter(Boolean);
    }
    return oriParagraphs
      .map((paragraph, i) => {
        const r: [string, string, string[]] | null = (() => {
          let [startAndEnd, ...texts] = paragraph.split("\r\n").filter(Boolean);
          if (startAndEnd && startAndEnd.includes("-->")) {
            const [start, end] = startAndEnd.split(" --> ");
            return [start, end, texts];
          }
          [startAndEnd, ...texts] = texts;
          if (startAndEnd && startAndEnd.includes("-->")) {
            const [start, end] = startAndEnd.split(" --> ");
            return [start, end, texts];
          }
          return null;
        })();
        if (r === null) {
          return null;
        }
        const [start, end, texts] = r;
        const s = start.replace(/,/, ".");
        const e = end.replace(/,/, ".");
        return {
          start: s,
          end: e,
          startTime: timeStrToSeconds(s),
          endTime: timeStrToSeconds(e),
          texts,
          text1: texts[0],
          text2: texts[1],
        };
      })
      .filter(Boolean)
      .filter((line) => {
        if (line === null) {
          return false;
        }
        if (Math.abs(line.endTime - line.startTime) < 0.1) {
          return false;
        }
        return true;
      })
      .map((line, index) => {
        const { start, end, startTime, endTime, texts } = line!;
        return {
          line: String(index),
          start,
          end,
          startTime,
          endTime,
          texts,
          text1: texts[0],
          text2: texts[1],
        };
      });
  },
  vtt: (content: string) => {
    if (!content) {
      return [];
    }
    const c = content.replace(/WEBVTT/, "");
    const oriParagraphs = c
      .split("\n\n")
      .filter(Boolean)
      .filter((v) => v !== "\n");
    // console.log("[DOMAIN]subtitle/utils - vtt", oriParagraphs);
    return oriParagraphs
      .map((paragraph, i) => {
        const [startAndEnd, ...texts] = paragraph.split("\n").filter(Boolean);
        // console.log("[DOMAIN]subtitle/utils - vtt", startAndEnd);
        const [start, end] = startAndEnd.split(" --> ");
        const s = start.split(",")[0];
        const e = end.split(",")[0];
        return {
          start: s,
          end: e,
          startTime: timeStrToSeconds(s),
          endTime: timeStrToSeconds(e),
          texts,
          text1: texts[0],
          text2: texts[1],
        };
      })
      .filter((line) => {
        if (Math.abs(line.endTime - line.startTime) < 0.1) {
          return false;
        }
        return true;
      })
      .map((line, index) => {
        const { start, end, startTime, endTime, texts } = line;
        return {
          line: String(index),
          start,
          end,
          startTime,
          endTime,
          texts,
          text1: texts[0],
          text2: texts[1],
        };
      });
  },
  ass: (content: string) => {
    if (!content) {
      return [];
    }
    const lines = content.match(/Dialogue:[^\n]{1,}\n{0,}/g);
    if (!lines) {
      return [];
    }
    return lines
      .map((line) => {
        const removeTextModifier = line.replace(/{[^}]{1,}}/g, "");
        const [, start, end, style, name, ml, mr, mv, effect, ...texts] = removeTextModifier.split(",");
        const [text1 = "", text2 = ""] = texts
          .map((text) => {
            return text.replace(/\n$/, "");
          })
          .join(",")
          .split("\\N");
        return {
          start,
          end,
          startTime: timeStrToSeconds(start),
          endTime: timeStrToSeconds(end),
          texts: [text1, text2].filter(Boolean),
        };
      })
      .filter((line) => {
        if (Math.abs(line.endTime - line.startTime) < 0.1) {
          return false;
        }
        return true;
      })
      .map((line, index) => {
        const { start, end, startTime, endTime, texts } = line;
        return {
          line: String(index),
          start,
          end,
          startTime,
          endTime,
          texts,
          text1: texts[0],
          text2: texts[1],
        };
      });
  },
};
/**
 * 解析字幕内容
 */
export function parseSubtitleContent(content: string, format: SubtitleFileSuffix): SubtitleFile["paragraphs"] {
  const parser = SUBTITLE_PARSER_MAP[format];
  if (parser) {
    return parser(content);
  }
  return [
    {
      line: "1",
      start: "",
      startTime: 0,
      end: "",
      endTime: 0,
      texts: [content],
      text1: "",
      text2: "",
    },
  ];
}
const VVTLanguageLabelMaps = {
  [MediaOriginCountry.CN]: "简体中文",
  [MediaOriginCountry.TW]: "繁体中文",
  [MediaOriginCountry.JP]: "日语",
  [MediaOriginCountry.US]: "英语",
  "chi&eng": "中英对照",
};
const VVTLanguageLangMaps = {
  [MediaOriginCountry.CN]: "zh",
  [MediaOriginCountry.TW]: "zh",
  [MediaOriginCountry.JP]: "ja",
  [MediaOriginCountry.US]: "en",
  "chi&eng": "zh",
};
export function createVVTSubtitle(store: SubtitleCore) {
  const { lines } = store;
  const content = [
    "WEBVTT",
    "",
    ...lines.map((line, i) => {
      const { start, end, texts } = line;
      return [`${formatHourNumCount(start)} --> ${formatHourNumCount(end)}`, ...texts].join("\n");
    }),
  ].join("\r\n\r\n");
  const blob = new Blob([content], { type: "text/vtt" });
  const url = URL.createObjectURL(blob);
  return {
    src: url,
    label: store.lang
      ? VVTLanguageLabelMaps[store.lang.join("&") as keyof typeof VVTLanguageLabelMaps]
      : store.filename,
    lang: (() => {
      if (!store.lang) {
        return "zh";
      }
      return VVTLanguageLangMaps[store.lang.join("&") as keyof typeof VVTLanguageLangMaps] || "zh";
    })(),
  };
}
