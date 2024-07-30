/**
 * @file 影视剧热度
 */
import { createSignal, For, onMount, Show } from "solid-js";

import { ViewComponent } from "@/store/types";
import { Skeleton, ScrollView } from "@/components/ui";
import { ScrollViewCore } from "@/domains/ui/index";
import { RequestCore } from "@/domains/request/index";
import { request } from "@/domains/request/utils";
import { MediaRankSource } from "@/constants/index";

function fetchMediaRank() {
  return request.get<{
    status: boolean;
    dataList: {
      list: {
        barValue: number;
        /** 当前热度 */
        currHeat: number;
        /** 当前热度 文本 */
        currHeatDesc: string;
        /** 影视剧信息 */
        seriesInfo: {
          /** 影视剧名称 */
          name: string;
          /** 是否新上映？ */
          newSeries: boolean;
          /** 所在平台 */
          platformDesc: string;
          /** 所在平台 id */
          platformTxt: number;
          /** 上线天数 */
          releaseInfo: string;
          /** 电视剧 id */
          seriesId: number;
        };
      }[];
      updateInfo: {
        updateGapSecond: number;
        updateTimestamp: number;
      };
    };
    /** 指定影视剧详细 */
    webHeatDetail: {
      data: {
        /** 评论总数 */
        commentCount: string;
        /** 热度趋势 */
        heatTrends: {
          /** 日期 YYYYMMDD 格式 */
          date: number;
          /** 热度数值 */
          heat: number;
        }[];
        /** 历史最大热度 */
        historyMaxHeat: number;
        /** 历史最大热度所在日期 */
        historyMaxHeatDate: string;
        /** 影视剧信息 */
        seriesInfo: {
          category: string;
          imgUrl: string;
          name: string;
          platformDesc: string;
          releaseInfo: string;
          seriesId: number;
        };
        sumCommentCountSplitUnit: {
          num: number;
          unit: string;
        };
      };
      success: boolean;
    };
    currentIndex: number;
    /** 日历 */
    calendar: {
      /** 今天 YYYY-MM-DD 格式 */
      today: string;
      selectMinDate: string;
      selectMaxDate: string;
      defaultSelect: string;
      /** 服务器时间 UTC 格式 */
      serverTimestamp: string;
      /** 选择的时间 */
      selectDate: string;
    };
  }>("/profile_api/v1/media_rank", { source: MediaRankSource.Maoyan });
}

export const MediaRankPage: ViewComponent = (props) => {
  const { app, history, client, view } = props;

  const $list = new RequestCore(fetchMediaRank, {
    client,
  });
  const scrollView = new ScrollViewCore({});

  const [state, setState] = createSignal($list.state);

  $list.onStateChange((v) => {
    setState(v);
  });

  onMount(() => {
    $list.run();
  });

  return (
    <>
      <ScrollView class="h-screen p-8" store={scrollView}>
        <div class="relative">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl">排行榜</h1>
          </div>
          <div class="mt-8">
            <div class="flex items-center space-x-2"></div>
            <div class="mt-4">
              <Show
                when={state().response}
                fallback={
                  <div>
                    <div class="rounded-md border border-slate-300 bg-white shadow-sm">
                      <div class="flex">
                        <div class="overflow-hidden mr-2 rounded-sm">
                          <Skeleton class="w-[180px] h-[272px]" />
                        </div>
                        <div class="flex-1 p-4">
                          <Skeleton class="h-[36px] w-[180px]"></Skeleton>
                          <div class="mt-2 space-y-1">
                            <Skeleton class="h-[24px] w-[120px]"></Skeleton>
                            <Skeleton class="h-[24px] w-[240px]"></Skeleton>
                          </div>
                          <div class="flex items-center space-x-4 mt-2">
                            <Skeleton class="w-10 h-6"></Skeleton>
                            <Skeleton class="w-10 h-6"></Skeleton>
                            <Skeleton class="w-10 h-6"></Skeleton>
                          </div>
                          <div class="flex space-x-2 mt-6">
                            <Skeleton class="w-24 h-8"></Skeleton>
                            <Skeleton class="w-24 h-8"></Skeleton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                }
              >
                <div class="space-y-4">
                  <For each={state().response?.dataList.list}>
                    {(record) => {
                      const { currHeat, currHeatDesc, seriesInfo } = record;
                      return (
                        <div class="rounded-md border border-slate-300 bg-white shadow-sm">
                          <div class="p-4">
                            <div class="flex items-center">
                              <h2 class="text-2xl text-slate-800">{seriesInfo.name}</h2>
                            </div>
                            <div class="mt-2">{currHeatDesc}</div>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </ScrollView>
    </>
  );
};
