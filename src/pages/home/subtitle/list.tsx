import { createSignal, For, onMount } from "solid-js";

import { ViewComponent } from "@/store/types";
import { request2 } from "@/biz/requests";
import { ListView, ScrollView } from "@/components/ui";
import { ScrollViewCore } from "@/domains/ui";
import { FetchParams } from "@/domains/list/typing";
import { ListCore } from "@/domains/list";
import { RequestCore } from "@/domains/request";
import { ListResponse } from "@/biz/requests/types";

function fetchSubtitleList(params: FetchParams) {
  const { page, pageSize, ...rest } = params;
  return request2.post<
    ListResponse<{
      id: number;
      title: string;
    }>
  >("/api/v1/subtitle/list", {
    ...rest,
    page,
    page_size: pageSize,
  });
}

export const SubtitleListPage: ViewComponent = (props) => {
  const { history } = props;
  const $scroll = new ScrollViewCore({});
  const $list = new ListCore(new RequestCore(fetchSubtitleList));

  const [response, setResponse] = createSignal($list.response);

  $list.onStateChange((v) => setResponse(v));

  onMount(() => {
    $list.init();
  });

  return (
    <ScrollView store={$scroll} class="h-full">
      <ListView store={$list}>
        <For each={response().dataSource}>
          {(subtitle) => {
            return (
              <div
                onClick={() => {
                  history.push("root.home_layout.subtitle_profile", { id: String(subtitle.id) });
                }}
              >
                <div>{subtitle.title}</div>
              </div>
            );
          }}
        </For>
      </ListView>
    </ScrollView>
  );
};
