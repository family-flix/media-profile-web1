/**
 * @file 影视剧详情列表
 */
import { createSignal, For, onMount, Show } from "solid-js";
import { Award, Send, BookOpen, Calendar, RotateCw, Search, SlidersHorizontal, Train } from "lucide-solid";

import { ViewComponent } from "@/store/types";
import { pendingActions, consumeAction } from "@/store/actions";
import {
  fetchMediaProfileList,
  fetchMediaProfileListProcess,
  fetchPartialMediaProfile,
  MediaProfileItem,
  deleteMediaProfile,
  editMediaProfile,
  refreshMediaProfile,
  fetchPartialMediaProfileProcess,
  setMediaProfileName,
} from "@/biz/services/media_profile";
import { Skeleton, Popover, ScrollView, Input, Button, Dialog, BackToTop, ListView } from "@/components/ui";
import { MediaProfileValues, MediaProfileValuesCore } from "@/components/MediaProfileValues";
import {
  ScrollViewCore,
  DialogCore,
  PopoverCore,
  InputCore,
  ButtonCore,
  ButtonInListCore,
  CheckboxGroupCore,
} from "@/domains/ui";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { RefCore } from "@/domains/cur/index";
import { Result } from "@/domains/result/index";
import { MediaTypes, TVGenresOptions } from "@/constants/index";

export const MediaProfileManagePage: ViewComponent = (props) => {
  const { app, history, view } = props;

  const $list = new ListCore(new RequestCore(fetchMediaProfileList, { process: fetchMediaProfileListProcess }), {
    onLoadingChange(loading) {
      searchBtn.setLoading(loading);
      resetBtn.setLoading(loading);
      refreshBtn.setLoading(loading);
    },
  });
  const editMediaRequest = new RequestCore(setMediaProfileName, {
    onLoading(loading) {
      dialog.okBtn.setLoading(loading);
    },
    onSuccess(r) {
      app.tip({
        text: ["编辑成功"],
      });
      dialog.hide();
    },
    onFailed(error) {
      app.tip({
        text: ["编辑失败", error.message],
      });
    },
  });
  const partialMediaRequest = new RequestCore(fetchPartialMediaProfile, { process: fetchPartialMediaProfileProcess });
  const refreshProfileRequest = new RequestCore(refreshMediaProfile, {
    onSuccess(r) {
      refreshProfileBtn.setLoading(false);
      refreshPartialMedia();
    },
    onFailed(error) {
      refreshProfileBtn.setLoading(false);
      app.tip({
        text: ["更新失败", error.message],
      });
    },
  });
  const mediaDeleteRequest = new RequestCore(deleteMediaProfile, {
    onSuccess() {
      app.tip({
        text: ["删除成功"],
      });
      $list.deleteItem((item) => {
        if (item.id === seasonRef.value?.id) {
          return true;
        }
        return false;
      });
    },
    onFailed(error) {
      app.tip({ text: ["删除失败", error.message] });
    },
  });
  const seasonRef = new RefCore<MediaProfileItem>();
  const tvGenresCheckboxGroup = new CheckboxGroupCore({
    options: TVGenresOptions,
    onChange(options) {
      setHasSearch(!!options.length);
      $list.search({
        genres: options.join("|"),
      });
    },
  });
  const tipPopover = new PopoverCore({
    align: "end",
  });
  const refreshPartialMedia = async (id?: string) => {
    const season_id = id || seasonRef.value?.id;
    if (!season_id) {
      return Result.Err("缺少季 id");
    }
    const r = await partialMediaRequest.run({ id: season_id });
    if (r.error) {
      app.tip({
        text: ["获取电视剧最新信息失败", r.error.message],
      });
      return Result.Err(r.error.message);
    }
    $list.modifyItem((item) => {
      if (item.id !== season_id) {
        return item;
      }
      return {
        ...r.data,
      };
    });
    return Result.Ok(null);
  };
  const nameSearchInput = new InputCore({
    defaultValue: "",
    placeholder: "请输入名称搜索",
    onEnter() {
      searchBtn.click();
    },
  });
  const searchBtn = new ButtonCore({
    onClick() {
      $list.search({ name: nameSearchInput.value });
    },
  });
  const resetBtn = new ButtonCore({
    onClick() {
      $list.reset();
      nameSearchInput.clear();
    },
  });
  const refreshPartialBtn = new ButtonInListCore<MediaProfileItem>({
    async onClick(record) {
      refreshPartialBtn.setLoading(true);
      const r = await refreshPartialMedia(record.id);
      refreshPartialBtn.setLoading(false);
      if (r.error) {
        return;
      }
      app.tip({
        text: ["刷新成功"],
      });
    },
  });
  const refreshProfileBtn = new ButtonInListCore<MediaProfileItem>({
    onClick(record) {
      app.tip({
        text: ["开始更新"],
      });
      refreshProfileBtn.setLoading(true);
      seasonRef.select(record);
      refreshProfileRequest.run({ media_id: record.id });
    },
  });
  const profileBtn = new ButtonInListCore<MediaProfileItem>({
    onClick(record) {
      history.push("root.home_layout.profile", { id: record.id });
    },
  });
  const editBtn = new ButtonInListCore<MediaProfileItem>({
    onClick(record) {
      seasonRef.select(record);
      dialog.show();
    },
  });
  const $doubanBtn = new ButtonInListCore<MediaProfileItem>({
    onClick(record) {
      seasonRef.select(record);
      $doubanDialog.show();
    },
  });
  const values = new MediaProfileValuesCore();
  const dialog = new DialogCore({
    title: "编辑详情",
    onOk() {
      const media = seasonRef.value;
      if (!media) {
        app.tip({
          text: ["请先选择"],
        });
        return;
      }
      const r = values.validate();
      if (r.error) {
        app.tip({
          text: [r.error.message],
        });
        return;
      }
      const value = r.data;
      editMediaRequest.run({
        id: media.id,
        name: value.name,
        original_name: value.originalName,
      });
    },
  });
  const profileDeleteBtn = new ButtonInListCore<MediaProfileItem>({
    onClick(record) {
      seasonRef.select(record);
      mediaDeleteRequest.run({
        id: record.id,
      });
    },
  });
  const $doubanDialog = new DialogCore({
    async onOk() {
      const v = $doubanInput.value;
      if (!v) {
        app.tip({
          text: ["请输入豆瓣 id 或链接"],
        });
        return;
      }
      const cur = seasonRef.value;
      if (!cur) {
        app.tip({
          text: ["请选择要更新的影视剧"],
        });
        return;
      }
      $doubanDialog.okBtn.setLoading(true);
      const r = await refreshProfileRequest.run({ media_id: cur.id, douban_id: v, override: 1 });
      $doubanDialog.okBtn.setLoading(false);
      if (r.error) {
        app.tip({
          text: [r.error.message],
        });
        return;
      }
      $doubanDialog.hide();
      app.tip({
        text: ["更新成功"],
      });
      refreshPartialMedia(cur.id);
    },
  });
  const $doubanInput = new InputCore({
    defaultValue: "",
    placeholder: "请输入豆瓣 id 或链接",
  });
  // const gotoInvalidTVListPageBtn = new ButtonCore({
  //   onClick() {
  //     app.showView(homeInvalidTVListPage);
  //   },
  // });
  const gotoSeasonArchivePageBtn = new ButtonCore({
    onClick() {
      // app.showView(seasonArchivePage);
      // history.push("root.archive");
    },
  });
  const refreshBtn = new ButtonCore({
    onClick() {
      $list.refresh();
    },
  });
  const scrollView = new ScrollViewCore({
    async onReachBottom() {
      await $list.loadMore();
      scrollView.finishLoadingMore();
    },
    onScroll() {
      tipPopover.hide();
    },
  });

  const [seasonListState, setSeasonListState] = createSignal($list.response);
  const [tips, setTips] = createSignal<string[]>([]);
  const [hasSearch, setHasSearch] = createSignal(false);

  $list.onStateChange((nextState) => {
    setSeasonListState(nextState);
  });
  view.onShow(() => {
    const { deleteTV } = pendingActions;
    if (!deleteTV) {
      return;
    }
    consumeAction("deleteTV");
    $list.deleteItem((season) => {
      if (season.id === deleteTV.id) {
        return true;
      }
      return false;
    });
  });

  onMount(() => {
    $list.init();
  });
  // driveList.initAny();

  return (
    <>
      <ScrollView class="h-screen p-8" store={scrollView}>
        <div class="relative">
          <div class="flex items-center space-x-4">
            <h1 class="text-2xl">电视剧列表({seasonListState().total})</h1>
          </div>
          <div class="mt-8">
            <div class="flex items-center space-x-2">
              <Button class="space-x-1" icon={<RotateCw class="w-4 h-4" />} store={refreshBtn}>
                刷新
              </Button>
              <Button class="" store={resetBtn}>
                重置
              </Button>
              {/* <PurePopover
                align="center"
                class="w-96"
                content={
                  <div class="h-[320px] py-4 pb-8 px-2 overflow-y-auto">
                    <div>
                      <div>来源</div>
                      <CheckboxGroup store={sourceCheckboxGroup} />
                    </div>
                    <div class="mt-4">
                      <div>类型</div>
                      <CheckboxGroup store={tvGenresCheckboxGroup} />
                    </div>
                  </div>
                }
              >
                <div class="relative p-2 cursor-pointer">
                  <SlidersHorizontal class={cn("w-5 h-5")} />
                  <Show when={hasSearch()}>
                    <div class="absolute top-[2px] right-[2px] w-2 h-2 rounded-full bg-red-500"></div>
                  </Show>
                </div>
              </PurePopover> */}
            </div>
            <div class="flex items-center space-x-2 mt-4">
              <Input class="" store={nameSearchInput} />
              <Button class="" icon={<Search class="w-4 h-4" />} store={searchBtn}>
                搜索
              </Button>
            </div>
            <div class="mt-4">
              <ListView
                store={$list}
                skeleton={
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
                  <For each={seasonListState().dataSource}>
                    {(season) => {
                      const {
                        id,
                        type,
                        name,
                        overview,
                        poster_path,
                        vote_average,
                        air_date,
                        genres,
                        persons,
                        origin_country,
                        episode_count,
                      } = season;
                      // const url = history.buildURLWithPrefix("root.home_layout.season_profile", { id });
                      const url = "";
                      // const url = homeTVProfilePage.buildUrlWithPrefix({
                      //   id,
                      // });
                      return (
                        <div class="rounded-md border border-slate-300 bg-white shadow-sm">
                          <div class="flex">
                            {/* <div class="overflow-hidden mr-2 rounded-sm">
                              <LazyImage class="w-[180px] h-[272px]" src={poster_path} alt={name} />
                            </div> */}
                            <div class="flex-1 w-0 p-4">
                              <div class="flex items-center">
                                <h2 class="text-2xl text-slate-800">
                                  <a href={url}>{name}</a>
                                </h2>
                              </div>
                              <div class="mt-2 overflow-hidden text-ellipsis">
                                <p class="text-slate-700 break-all whitespace-pre-wrap truncate line-clamp-3">
                                  {overview}
                                </p>
                              </div>
                              <div class="flex items-center flex-wrap space-x-2">
                                <For each={origin_country}>
                                  {(country) => {
                                    return <div>{country}</div>;
                                  }}
                                </For>
                                <For each={genres}>
                                  {(genre) => {
                                    return <div>{genre}</div>;
                                  }}
                                </For>
                              </div>
                              <div class="flex items-center flex-wrap space-x-2">
                                <For each={persons}>
                                  {(person) => {
                                    return (
                                      <div class="w-[48px]">
                                        <div>{person.name}</div>
                                        <div>{person.role}</div>
                                      </div>
                                    );
                                  }}
                                </For>
                              </div>
                              <div class="flex items-center space-x-4 mt-2 break-keep overflow-hidden">
                                <div class="flex items-center space-x-1 px-2 border border-slate-600 rounded-xl text-slate-600">
                                  <Calendar class="w-4 h-4 text-slate-800" />
                                  <div class="break-keep whitespace-nowrap">{air_date}</div>
                                </div>
                                <div class="flex items-center space-x-1 px-2 border border-yellow-600 rounded-xl text-yellow-600">
                                  <Award class="w-4 h-4" />
                                  <div>{vote_average}</div>
                                </div>
                                <Show when={type === MediaTypes.Season}>
                                  <div class="flex items-center space-x-1 px-2 border border-blue-600 rounded-xl text-blue-600">
                                    <Send class="w-4 h-4" />
                                    <div>{episode_count}</div>
                                  </div>
                                </Show>
                              </div>
                              <div class="space-x-2 mt-4 p-1 overflow-hidden whitespace-nowrap">
                                <Button
                                  store={refreshPartialBtn.bind(season)}
                                  variant="subtle"
                                  icon={<RotateCw class="w-4 h-4" />}
                                ></Button>
                                <Button
                                  store={profileBtn.bind(season)}
                                  variant="subtle"
                                  icon={<BookOpen class="w-4 h-4" />}
                                >
                                  详情
                                </Button>
                                <Button
                                  store={refreshProfileBtn.bind(season)}
                                  variant="subtle"
                                  icon={<BookOpen class="w-4 h-4" />}
                                >
                                  更新详情
                                </Button>
                                <Button
                                  store={editBtn.bind(season)}
                                  variant="subtle"
                                  icon={<BookOpen class="w-4 h-4" />}
                                >
                                  编辑
                                </Button>
                                <Button
                                  store={$doubanBtn.bind(season)}
                                  variant="subtle"
                                  icon={<BookOpen class="w-4 h-4" />}
                                >
                                  强制覆盖
                                </Button>
                                <Button
                                  store={profileDeleteBtn.bind(season)}
                                  variant="subtle"
                                  icon={<Train class="w-4 h-4" />}
                                >
                                  删除
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </ListView>
            </div>
          </div>
        </div>
      </ScrollView>
      <Dialog store={dialog}>
        <div class="w-[520px]">
          <MediaProfileValues store={values} />
        </div>
      </Dialog>
      <Dialog store={$doubanDialog}>
        <div class="w-[520px]">
          <Input store={$doubanInput} />
        </div>
      </Dialog>
      <Popover
        store={tipPopover}
        content={
          <div class="space-y-2">
            <For each={tips()}>
              {(tip) => {
                return <div class="text-sm text-slate-800">{tip}</div>;
              }}
            </For>
          </div>
        }
      ></Popover>
      <BackToTop store={scrollView} />
    </>
  );
};
