import { PageKeysType, build } from "@/domains/route_view/utils";

/**
 * @file 路由配置
 */
const configure = {
  root: {
    title: "ROOT",
    pathname: "/",
    children: {
      home_layout: {
        title: "详情管理布局",
        pathname: "/home",
        children: {
          index: {
            title: "首页",
            pathname: "/home/index",
          },
          search: {
            title: "影视剧搜索",
            pathname: "/home/search",
          },
          profile: {
            title: "影视剧热榜",
            pathname: "/home/media/profile",
          },
          rank: {
            title: "影视剧热榜",
            pathname: "/home/rank",
          },
          subtitle_list: {
            title: "字幕列表",
            pathname: "/home/subtitle/list",
          },
          subtitle_profile: {
            title: "字幕详情",
            pathname: "/home/subtitle/profile",
          },
          editor: {
            title: "字幕编辑",
            pathname: "/home/subtitle/edit",
          },
        },
      },
      login: {
        title: "登录",
        pathname: "/login",
      },
      notfound: {
        title: "404",
        pathname: "/notfound",
      },
    },
  },
};

export type PageKeys = PageKeysType<typeof configure>;
const result = build<PageKeys>(configure);
export const routes = result.routes;
export const routesWithPathname = result.routesWithPathname;

// @ts-ignore
globalThis.__routes_with_pathname__ = routesWithPathname;
// @ts-ignore
globalThis.__routes__ = routes;
