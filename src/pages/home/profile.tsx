/**
 * @file 电视剧详情
 */
import { For, Show, createSignal, onMount } from "solid-js";
import { ArrowLeft, Play, Trash } from "lucide-solid";

import { ViewComponent } from "@/store/types";
import { appendAction } from "@/store/actions";
import {
  MediaEpisodeItem,
  MediaProfile,
  fetchMediaFilePreview,
  fetchMediaProfile,
  setMediaProfile,
} from "@/biz/services/media";
import { deleteParsedMediaSource } from "@/biz/services/parsed_media";
import { TMDBSearcherCore } from "@/biz/tmdb";
import { Button, ScrollView, Skeleton, Dialog, LazyImage, ListView, Input } from "@/components/ui";
import {
  MenuItemCore,
  ContextMenuCore,
  ScrollViewCore,
  DialogCore,
  ButtonCore,
  InputCore,
  ImageInListCore,
  ImageCore,
} from "@/domains/ui";
import { RequestCore } from "@/domains/request";
import { RefCore } from "@/domains/cur";
import { ListCore } from "@/domains/list";
import { bytes_to_size, cn } from "@/utils";

export const MediaProfilePage: ViewComponent = (props) => {
  const { app, history, client, view } = props;

  const profileRequest = new RequestCore(fetchMediaProfile, {
    client,
    onSuccess(v) {
      poster.setURL(v.poster_path);
      setProfile(v);
    },
    onFailed(error) {
      app.tip({ text: ["获取详情失败", error.message] });
    },
  });
  const previewRequest = new RequestCore(fetchMediaFilePreview);
  const episodeRef = new RefCore<MediaEpisodeItem>();
  // const fileRef = new RefCore<EpisodeItemInSeason["sources"][number]>();
  const searcher = new TMDBSearcherCore();
  const dialog = new DialogCore({
    onOk() {
      const id = view.query.id as string;
      if (!id) {
        app.tip({ text: ["更新详情失败", "缺少电视剧 id"] });
        return;
      }
      const media = searcher.cur;
      if (!media) {
        app.tip({ text: ["请先选择详情"] });
        return;
      }
      dialog.okBtn.setLoading(true);
      // seasonProfileChangeRequest.run({
      //   media_id: id,
      //   media_profile: {
      //     id: String(media.id),
      //     type: media.type,
      //     name: media.name,
      //   },
      // });
    },
  });
  const profileChangeBtn = new ButtonCore({
    onClick() {
      if (profileRequest.response) {
        searcher.$input.setValue(profileRequest.response.name);
      }
      dialog.show();
    },
  });
  const profileRefreshBtn = new ButtonCore({
    onClick() {
      app.tip({
        text: ["开始刷新"],
      });
      // profileRefreshBtn.setLoading(true);
      // seasonProfileRefreshRequest.run({ season_id: view.query.season_id });
    },
  });
  const seasonDeletingBtn = new ButtonCore({
    onClick() {
      // if (profileRequest.response) {
      //   seasonRef.select(profileRequest.response.curSeason);
      // }
      // seasonDeletingConfirmDialog.show();
    },
  });
  const fileDeletingConfirmDialog = new DialogCore({
    title: "删除视频源",
    onOk() {
      // const theSource = fileRef.value;
      // if (!theSource) {
      //   app.tip({
      //     text: ["请先选择要删除的源"],
      //   });
      //   return;
      // }
      // sourceDeletingRequest.run({
      //   parsed_media_source_id: theSource.id,
      // });
    },
  });
  // const profileTitleInput = new InputCore({
  //   defaultValue: "",
  //   placeholder: "请输入电视剧标题",
  // });
  // const profileEpisodeCountInput = new InputCore({
  //   defaultValue: "",
  //   placeholder: "请输入季剧集总数",
  // });
  // const profileUpdateBtn = new ButtonCore({
  //   onClick() {
  //     profileManualUpdateDialog.show();
  //   },
  // });
  // const profileManualUpdateDialog = new DialogCore({
  //   title: "手动修改详情",
  //   onOk() {
  //     const title = profileTitleInput.value;
  //     const episodeCount = profileEpisodeCountInput.value;
  //     if (!title && !episodeCount) {
  //       app.tip({
  //         text: ["请至少输入一个变更项"],
  //       });
  //       return;
  //     }
  //     profileManualUpdateRequest.run({
  //       season_id: view.query.season_id,
  //       title,
  //       episode_count: episodeCount ? Number(episodeCount) : undefined,
  //     });
  //   },
  // });
  const scrollView = new ScrollViewCore({});
  const poster = new ImageCore({});
  const seriesPoster = new ImageInListCore({});

  const [profile, setProfile] = createSignal<MediaProfile | null>(null);
  // const [curEpisodeResponse, setCurEpisodeResponse] = createSignal(curEpisodeList.response);
  // const [curSeason, setCurSeason] = createSignal(mediaRef.value);
  const [sizeCount, setSizeCount] = createSignal<string | null>(null);

  // mediaRef.onStateChange((nextState) => {
  //   setCurSeason(nextState);
  // });
  // curEpisodeList.onStateChange((nextResponse) => {
  //   const sourceSizeCount = nextResponse.dataSource.reduce((count, cur) => {
  //     const curCount = cur.sources.reduce((total, cur) => {
  //       return total + cur.size;
  //     }, 0);
  //     return count + curCount;
  //   }, 0);
  //   setSizeCount(bytes_to_size(sourceSizeCount));
  //   setCurEpisodeResponse(nextResponse);
  // });
  // curEpisodeList.onComplete(() => {
  //   seasonRef.select({
  //     id: curEpisodeList.params.season_id as string,
  //     name: tmpSeasonRef.value?.name ?? "",
  //     season_text: tmpSeasonRef.value?.season_text ?? "",
  //   });
  // });

  onMount(() => {
    profileRequest.run({ media_id: view.query.id });
  });

  return (
    <>
      <ScrollView class="h-screen py-4 px-8" store={scrollView}>
        <div class="py-2">
          <div
            class="mb-2 cursor-pointer"
            onClick={() => {
              history.back();
            }}
          >
            <ArrowLeft class="w-6 h-6" />
          </div>
          <Show
            when={!!profile()}
            fallback={
              <div class="relative">
                <div class="">
                  <div>
                    <div class="relative z-3">
                      <div class="flex">
                        <Skeleton class="w-[240px] h-[360px] rounded-lg mr-4 object-cover" />
                        <div class="flex-1 mt-4">
                          <Skeleton class="w-full h-[48px]"></Skeleton>
                          <Skeleton class="mt-6 w-12 h-[36px]"></Skeleton>
                          <div class="mt-2 space-y-1">
                            <Skeleton class="w-12 h-[18px]"></Skeleton>
                            <Skeleton class="w-full h-[18px]"></Skeleton>
                            <Skeleton class="w-32 h-[18px]"></Skeleton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          >
            <div class="relative">
              <div class="">
                <div>
                  <div class="relative z-3">
                    <div class="flex">
                      <LazyImage
                        class="overflow-hidden w-[240px] h-[360px] rounded-lg mr-4 object-cover"
                        store={poster}
                        // src={profile()?.poster_path ?? undefined}
                      />
                      <div class="flex-1 mt-4">
                        <h2 class="text-5xl">{profile()?.name}</h2>
                        <div class="mt-6 text-2xl">剧情简介</div>
                        <div class="mt-2">{profile()?.overview}</div>
                        {/* <div class="mt-4">
                          <a href={`https://www.themoviedb.org/tv/${profile()?.tmdb_id}`}>TMDB</a>
                        </div> */}
                        <div>{sizeCount()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="relative z-3 mt-4">
                <div class="flex items-center space-x-4 whitespace-nowrap">
                  <Button store={profileRefreshBtn}>刷新详情</Button>
                  <Button store={seasonDeletingBtn}>删除季</Button>
                </div>
                <div class="space-y-4 mt-8">
                  <For each={profile()?.episodes}>
                    {(episode) => {
                      const { id, name, still_path, overview, order: episode_number, files, subtitles } = episode;
                      return (
                        <div title={id}>
                          <div class="text-lg">
                            {episode_number}、{name}
                            <img class="w-[68px] h-[38px] object-cover" src={still_path} />
                          </div>
                          <div class="pl-4 space-y-1">
                            <For each={files}>
                              {(file) => {
                                const { id, file_name } = file;
                                return (
                                  <div class="flex items-center space-x-4 text-slate-500">
                                    <span class="break-all" title={`${file_name}`}>
                                      {file_name}
                                    </span>
                                    <div class="flex items-center space-x-2">
                                      <div
                                        class="p-1 cursor-pointer"
                                        title="播放"
                                        onClick={async () => {
                                          const p = profile();
                                          if (!p) {
                                            return;
                                          }
                                          const r = await previewRequest.run({ id });
                                          if (r.error) {
                                            return null;
                                          }
                                          const subtitle = await (async () => {
                                            if (subtitles.length !== 0) {
                                              return subtitles[0];
                                            }
                                            if (r.data.subtitles.length === 0) {
                                              return null;
                                            }
                                            return r.data.subtitles[0];
                                          })();
                                          appendAction("pendingSubtitle", {
                                            media: {
                                              id: p.id,
                                              name: p.name,
                                              original_name: p.original_name,
                                              order: p.order,
                                              poster_path: p.poster_path,
                                            },
                                            episode: {
                                              id,
                                              order: episode_number,
                                              name,
                                              still_path,
                                              overview,
                                              url: r.data.url,
                                            },
                                            subtitle,
                                          });
                                          history.push("root.home_layout.editor");
                                        }}
                                      >
                                        <Play class="w-4 h-4" />
                                      </div>
                                      <div
                                        class="p-1 cursor-pointer"
                                        title="删除源"
                                        onClick={() => {
                                          episodeRef.select(episode);
                                          fileDeletingConfirmDialog.show();
                                        }}
                                      >
                                        <Trash class="w-4 h-4" />
                                      </div>
                                    </div>
                                  </div>
                                );
                              }}
                            </For>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>
            </div>
          </Show>
        </div>
        <div class="h-[120px]"></div>
      </ScrollView>
    </>
  );
};
