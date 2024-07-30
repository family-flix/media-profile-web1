import { createSignal, For, onMount, Show } from "solid-js";
import { ArrowUpDownIcon, ChevronDownIcon, TrashIcon, UserIcon } from "lucide-solid";
import axios from "axios";

import { consumeAction } from "@/store/actions";
import { ViewComponent } from "@/store/types";
import { Button, ScrollView } from "@/components/ui/index";
import { ButtonCore, ScrollViewCore } from "@/domains/ui/index";
import { DragZoneCore } from "@/domains/ui/drag-zone/index";
import { RequestCore } from "@/domains/request";
import { RefCore } from "@/domains/cur";
import { extraLanguageFromSubtitleURL, parseSubtitleContent, parseSubtitleURL } from "@/biz/subtitle/utils";
import { subtitleAnalysis, subtitleDownload, subtitleProfile, subtitleUpdate } from "@/biz/services/subtitle";
import { SubtitleReaderCore } from "@/biz/subtitle/reader";
import { SubtitleCore } from "@/biz/subtitle";
import { MediaOriginCountry } from "@/biz/constants";
import { SubtitleFileSuffix, SubtitleParagraph } from "@/biz/subtitle/types";
import { cn } from "@/utils/index";

export const SubtitleProfilePage: ViewComponent = (props) => {
  const { app, view, client } = props;

  const $requests = {
    subtitleProfile: new RequestCore(subtitleProfile),
    subtitleUpdate: new RequestCore(subtitleUpdate),
    subtitleDownload: new RequestCore(subtitleDownload),
    subtitleAnalysis: new RequestCore(subtitleAnalysis),
  };
  const $ui = {
    download: new ButtonCore({
      async onClick() {
        if (!$requests.subtitleProfile.response) {
          app.tip({
            text: ["请等待获取到详情"],
          });
          return;
        }
        $ui.download.setLoading(true);
        const payload = subtitleDownload({ id: $requests.subtitleProfile.response.id });
        const response = await axios({
          url: [payload.hostname, payload.url].join(""),
          method: payload.method,
          data: payload.body,
          responseType: "blob",
        });
        $ui.download.setLoading(false);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          $requests.subtitleProfile.response.title.replace($requests.subtitleProfile.response.suffix, "") + ".pdf"
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    }),
    analysis: new ButtonCore({
      async onClick() {
        if (!$requests.subtitleProfile.response) {
          app.tip({
            text: ["请等待获取到详情"],
          });
          return;
        }
        $ui.analysis.setLoading(true);
        const r = await $requests.subtitleAnalysis.run({ id: $requests.subtitleProfile.response.id });
        $ui.analysis.setLoading(false);
        if (r.error) {
          return;
        }
        app.tip({
          text: ["解析成功"],
        });
      },
    }),
    submit: new ButtonCore({
      async onClick() {
        const values = subtitle();
        if (!values) {
          app.tip({
            text: ["请先上传字幕文件"],
          });
          return;
        }
        const media = mediaRef.value;
        if (!media) {
          app.tip({
            text: ["请选择匹配的剧集"],
          });
          return;
        }
        $ui.submit.setLoading(true);
        const { title, language, suffix, paragraphs } = values;
        const r = await $requests.subtitleUpdate.run({
          id: 0,
          title,
          language: language.join("&"),
          suffix,
          paragraphs,
          media,
        });
        $ui.submit.setLoading(false);
        if (r.error) {
          return;
        }
        app.tip({
          text: ["创建成功"],
        });
      },
    }),
  };
  const $scroll = new ScrollViewCore();
  const fileReader = new SubtitleReaderCore({
    onRead(file) {
      const suffix = parseSubtitleURL(file.filename);
      const r = parseSubtitleContent(file.content, suffix);
      const language = extraLanguageFromSubtitleURL(file.content);
      console.log("[PAGE]upload - after const r = parseSubtitleContent", r);
      setSubtitle({
        title: file.filename,
        suffix,
        language,
        paragraphs: r,
      });
    },
  });
  const uploadZone = new DragZoneCore({
    onChange(files) {
      console.log(files);
      const file = files[0];
      if (!file) {
        return;
      }
      fileReader.read(file);
    },
  });
  const mediaRef = new RefCore<{
    id: string;
    order: number;
    name: string;
    original_name: string | null;
    poster_path: string;
    episode: {
      name: string;
      order: number;
      overview: string;
      still_path: string;
    };
  }>();

  const [state, setState] = createSignal(uploadZone.state);
  const [subtitle, setSubtitle] = createSignal<null | {
    title: string;
    suffix: SubtitleFileSuffix;
    language: MediaOriginCountry[];
    paragraphs: SubtitleParagraph[];
  }>(null);
  const [response, setResponse] = createSignal($requests.subtitleProfile.response);

  const deleteParagraph = (paragraph: SubtitleParagraph) => {
    setSubtitle((prev) => {
      if (prev === null) {
        return null;
      }
      const { paragraphs, ...rest } = prev;
      return {
        ...rest,
        paragraphs: paragraphs.filter((p) => p.line !== paragraph.line),
      };
    });
  };
  const changeOrder = (paragraph: SubtitleParagraph) => {
    setSubtitle((prev) => {
      if (prev === null) {
        return null;
      }
      const { paragraphs, ...rest } = prev;
      return {
        ...rest,
        paragraphs: paragraphs.map((p) => {
          if (p.line !== paragraph.line) {
            return p;
          }
          return {
            ...p,
            texts: p.texts.reverse(),
            text1: p.text2,
            text2: p.text1,
          };
        }),
      };
    });
  };

  uploadZone.onStateChange((v) => setState(v));
  $requests.subtitleProfile.onResponseChange((v) => setResponse(v));

  onMount(() => {
    $requests.subtitleProfile.run({ id: Number(view.query.id) });
  });

  return (
    <ScrollView store={$scroll} class="h-full">
      <div
        classList={{
          "overflow-y-auto absolute top-0 right-0 w-full h-full rounded-sm bg-slate-200 border border-2": true,
          "border-green-500 border-dash": state().hovering,
        }}
        style={{ bottom: "128px" }}
        onDragOver={(event) => {
          event.preventDefault();
          uploadZone.handleDragover();
        }}
        onDragLeave={() => {
          uploadZone.handleDragleave();
        }}
        onDrop={(event) => {
          event.preventDefault();
          uploadZone.handleDrop(Array.from(event.dataTransfer?.files || []));
        }}
      >
        <Show when={response()}>
          <div class="relative">
            <div class="#title pb-10 border-b">
              <h2 class="text-5xl break-all" contentEditable>
                {response()?.title}
              </h2>
              <div class="flex items-center mt-4 space-x-8">
                <div class="flex items-center">
                  <UserIcon class="w-4 h-4 mr-2 text-gray-400" />
                  <span class="text-gray-400">unknown</span>
                </div>
              </div>
            </div>
            <div class="mt-14 pb-20 space-y-16">
              <For each={response()?.paragraphs}>
                {(paragraph) => {
                  return (
                    <div class={cn("relative group rounded-md")}>
                      <div class="#tool absolute -top-9 flex p-2 space-x-2 bg-gray-800 rounded">
                        <div class="text-gray-100">{paragraph.line}</div>
                        <TrashIcon
                          class="w-4 h-4 text-gray-100 cursor-pointer"
                          onClick={() => {
                            deleteParagraph(paragraph);
                          }}
                        />
                        <ArrowUpDownIcon
                          class="w-4 h-4 text-gray-100 cursor-pointer"
                          onClick={() => {
                            changeOrder(paragraph);
                          }}
                        />
                        {/* <ChevronDownIcon
                          class={cn("w-4 h-4 text-gray-100 cursor-pointer")}
                          onClick={mergeNextLine(paragraph)}
                        /> */}
                        <Show when={!paragraph.text2}>
                          <div>该段落缺少中文或英文，建议删除</div>
                        </Show>
                      </div>
                      <div>
                        <p
                          class="text1"
                          contentEditable
                          //     onBlur={updateText1(paragraph)}
                        >
                          {paragraph.text1}
                        </p>
                        <p
                          class="text2 text-xl"
                          //     suppressContentEditableWarning
                          contentEditable
                          //     onBlur={updateText2(paragraph)}
                        >
                          {paragraph.text2}
                        </p>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </Show>
      </div>
      <div class="fixed right-4 bottom-4">
        <div class="flex items-center space-x-2">
          <Button store={$ui.submit}>提交</Button>
          <Button store={$ui.analysis}>解析</Button>
          <Button store={$ui.download}>下载</Button>
        </div>
      </div>
    </ScrollView>
  );
};
