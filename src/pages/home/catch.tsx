/**
 * @file 到视频网站抓取影视剧详情
 */
import { For, Show, createSignal } from "solid-js";

import { ViewComponent } from "@/store/types";
import { HttpClientCore } from "@/domains/http_client/index";
import { TmpRequestResp, request } from "@/domains/request/utils";
import { RequestCore } from "@/domains/request/index";

function search_media(values: { url: string }) {
  const { url } = values;
  return request.post<{
    type: "movie" | "season";
    platform: "";
    name: string;
    poster_path: string;
    seasons: {
      id: string;
      name: string;
      overview: string;
      poster_path: string;
      air_date: string;
      episodes: {
        name: string;
        episode_number: number;
        air_date: string;
        thumbnail: string;
      }[];
      persons: {
        name: string;
        avatar: string;
      }[];
      genres: string[];
      origin_country: string[];
    }[];
  }>("/profile_api/v1/analysis", { url });
}
type MediaSearchResult = NonNullable<TmpRequestResp<typeof search_media>["data"]>;
function fetch_season_profile(values: { id: string; platform: string }) {
  const { id, platform } = values;
  return request.post<{
    id: string;
    name: string;
    overview: string;
    poster_path: string;
    air_date: string;
    episodes: {
      name: string;
      episode_number: number;
      air_date: string;
      thumbnail: string;
    }[];
    persons: {
      name: string;
      avatar: string;
    }[];
    genres: string[];
    origin_country: string[];
  }>("/profile_api/v1/season_profile", {
    id,
    platform,
  });
}
type SeasonMediaProfile = NonNullable<TmpRequestResp<typeof fetch_season_profile>["data"]>;
type MediaProfileSearchProps = {
  client: HttpClientCore;
};

class MediaProfileSearchCore {
  $client: HttpClientCore;
  $search: RequestCore<typeof search_media>;
  $profile: RequestCore<typeof fetch_season_profile>;

  constructor(props: MediaProfileSearchProps) {
    const { client } = props;

    this.$client = client;
    this.$search = new RequestCore(search_media, {
      client: this.$client,
    });
    this.$profile = new RequestCore(fetch_season_profile, {
      client: this.$client,
    });
  }
}

export const MediaProfileCatchPage: ViewComponent = (props) => {
  const { app, client } = props;

  const $logic = new MediaProfileSearchCore({ client });

  const [url, setUrl] = createSignal("");
  const [values, setValues] = createSignal<null | MediaSearchResult>(null);
  const [curSeason, setCurSeason] = createSignal<null | SeasonMediaProfile>(null);

  return (
    <main class="flex min-h-screen flex-col p-24">
      <div>
        <div class="text-2xl text-center">抓取影视剧详情</div>
        <div class="flex justify-center mt-4">
          <div class="flex space-x-4 p-8">
            <div>
              <input
                value={url()}
                placeholder="请输入要抓取的影视剧播放页地址"
                onChange={(event) => {
                  setUrl(event.currentTarget.value);
                }}
              />
            </div>
            <div>
              <button
                onClick={async () => {
                  setValues(null);
                  setCurSeason(null);
                  const r = await $logic.$search.run({ url: url() });
                  if (r.error) {
                    app.tip({
                      text: [r.error.message],
                    });
                    return;
                  }
                  const { type, platform, name, poster_path, seasons } = r.data;
                  setValues((prev) => {
                    return {
                      ...prev,
                      type,
                      platform,
                      name,
                      poster_path,
                      seasons,
                    };
                  });
                  if (type === "season") {
                    for (let i = 0; i < seasons.length; i += 1) {
                      await (async () => {
                        const season = seasons[i];
                        const { id } = season;
                        const r = await $logic.$profile.run({ id, platform });
                        if (r.error) {
                          app.tip({ text: [r.error.message] });
                          return;
                        }
                        const d = r.data;
                        setValues((prev) => {
                          if (prev === null) {
                            return prev;
                          }
                          return {
                            ...prev,
                            seasons: [...prev.seasons.slice(0, i), d, ...prev.seasons.slice(i + 1)],
                          };
                        });
                      })();
                    }
                  }
                }}
              >
                抓取
              </button>
            </div>
          </div>
        </div>
        <Show when={values()}>
          {(() => {
            if (values() === null) {
              return null;
            }
            if (values()?.type === "movie") {
              const profile = values()?.seasons[0];
              if (!profile) {
                return null;
              }
              const { name, overview, poster_path, air_date, origin_country, genres, persons } = profile;
              return (
                <div>
                  <div class="flex">
                    <div class="mr-4">
                      <img class="w-[180px]" src={poster_path} alt={name} />
                    </div>
                    <div class="flex-1">
                      <div class="text-2xl">{name}</div>
                      <div class="">{overview}</div>
                      <div class="mt-4">
                        {air_date} {origin_country.map((t) => t).join("、")}
                      </div>
                      <div class="mt-2 flex gap-3">
                        <For each={genres}>
                          {(g) => {
                            return <div>{g}</div>;
                          }}
                        </For>
                      </div>
                      <div class="flex flex-wrap gap-3 mt-4">
                        <For each={persons}>
                          {(person) => {
                            return (
                              <div>
                                <img
                                  class="w-[40px] h-[40px] object-cover rounded-full"
                                  src={person.avatar}
                                  alt={person.name}
                                />
                                <div class="break-all text-center">{person.name}</div>
                              </div>
                            );
                          }}
                        </For>
                      </div>
                      <div class="mt-8">
                        <button
                          onClick={() => {
                            console.log(JSON.stringify(profile, null, 2));
                          }}
                        >
                          打印
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            if (values()?.type === "season") {
              return (
                <div class="profile">
                  <div class="flex flex-wrap gap-3 mt-8">
                    <For each={values()?.seasons}>
                      {(season) => {
                        const { name, poster_path, air_date } = season;
                        return (
                          <div
                            class="w-[120px]"
                            onClick={() => {
                              setCurSeason(season);
                            }}
                          >
                            <div class="relative w-full h-[160px] bg-gray-200">
                              {poster_path ? (
                                <img class="w-full h-full object-cover" src={poster_path} alt={name} />
                              ) : null}
                              <div class="absolute bottom-1 left-1">{air_date}</div>
                            </div>
                            <div>{name}</div>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                  {(() => {
                    const cur = curSeason();
                    if (!cur) {
                      return null;
                    }
                    const {
                      name,
                      poster_path,
                      overview,
                      air_date,
                      genres,
                      origin_country,
                      episodes = [],
                      persons,
                    } = cur;
                    return (
                      <div class="mt-8">
                        <div class="flex">
                          <div class="mr-4">
                            <img class="w-[180px]" src={poster_path} alt={name} />
                          </div>
                          <div class="flex-1">
                            <div class="text-2xl">{name}</div>
                            <div class="">{overview}</div>
                            <div class="mt-4">
                              {air_date} {origin_country.map((t) => t).join("、")}
                            </div>
                            <div class="mt-2 flex gap-3">
                              <For each={genres}>
                                {(g) => {
                                  return <div>{g}</div>;
                                }}
                              </For>
                            </div>
                            <div class="flex flex-wrap gap-3 mt-4">
                              <For each={persons}>
                                {(person) => {
                                  return (
                                    <div>
                                      <img
                                        class="w-[40px] h-[40px] object-cover rounded-full"
                                        src={person.avatar}
                                        alt={person.name}
                                      />
                                      <div class="break-all text-center">{person.name}</div>
                                    </div>
                                  );
                                }}
                              </For>
                            </div>
                          </div>
                        </div>
                        <div class="flex flex-wrap gap-3 mt-4">
                          <For each={episodes}>
                            {(episode) => {
                              const { name, episode_number, air_date, thumbnail } = episode;
                              return (
                                <div class="w-[120px]">
                                  <div class="relative w-full">
                                    <img class="w-full" src={thumbnail} alt={name} />
                                    <div class="absolute left-1 bottom-1">{air_date}</div>
                                  </div>
                                  <div class="mt-2 break-all">{name}</div>
                                </div>
                              );
                            }}
                          </For>
                        </div>
                        <div class="mt-8">
                          <button
                            onClick={async () => {
                              console.log(JSON.stringify(curSeason, null, 2));
                              // const r = await fetch("/api/v1/create_season", {
                              //   body: JSON.stringify(curSeason),
                              //   method: "POST",
                              // });
                              // const r1 = await r.json();
                              // console.log(r1);
                            }}
                          >
                            打印
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            }
          })()}
        </Show>
      </div>
    </main>
  );
};
