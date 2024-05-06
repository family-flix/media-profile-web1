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
            children: {},
          },
          search: {
            title: "影视剧搜索",
            pathname: "/home/search",
            children: {},
          },
          rank: {
            title: "影视剧热榜",
            pathname: "/home/rank",
            children: {},
          },
        },
      },
      notfound: {
        title: "404",
        pathname: "/notfound",
        children: {},
      },
    },
  },
};

function apply(
  configure: OriginalRouteConfigure,
  parent: {
    pathname: PathnameKey;
    name: string;
  }
): RouteConfig[] {
  const routes = Object.keys(configure).map((key) => {
    const config = configure[key];
    const { title, pathname, children } = config;
    // 一个 hack 操作，过滤掉 root
    const name = [parent.name, key].filter(Boolean).join(".") as PageKeys;
    if (children) {
      const subRoutes = apply(children, {
        name,
        pathname,
      });
      return [
        {
          title,
          name,
          pathname,
          // component,
          parent: {
            name: parent.name,
          },
        },
        ...subRoutes,
      ];
    }
    return [
      {
        title,
        name,
        pathname,
        // component,
        parent: {
          name: parent.name,
        },
      },
    ];
  });
  return routes.reduce((a, b) => {
    return a.concat(b);
  }, []);
}
const configs = apply(configure, {
  name: "",
  pathname: "/",
});
export const routes: Record<PathnameKey, RouteConfig> = configs
  .map((a) => {
    return {
      [a.name]: a,
    };
  })
  .reduce((a, b) => {
    return {
      ...a,
      ...b,
    };
  }, {});
// @ts-ignore
window.__routes__ = routes;
export const routesWithPathname: Record<PathnameKey, RouteConfig> = configs
  .map((a) => {
    return {
      [a.pathname]: a,
    };
  })
  .reduce((a, b) => {
    return {
      ...a,
      ...b,
    };
  }, {});
// @ts-ignore
window.__routes_with_pathname__ = routesWithPathname;

type PageKeysType<T extends OriginalRouteConfigure, K = keyof T> = K extends keyof T & (string | number)
  ? `${K}` | (T[K] extends object ? `${K}.${PageKeysType<T[K]["children"]>}` : never)
  : never;
export type PathnameKey = string;
export type PageKeys = PageKeysType<typeof configure>;
export type RouteConfig = {
  /** 使用该值定位唯一 route/page */
  name: PageKeys;
  title: string;
  pathname: PathnameKey;
  parent: {
    name: string;
  };
  // component: unknown;
};
type OriginalRouteConfigure = Record<
  PathnameKey,
  {
    title: string;
    pathname: string;
    children: OriginalRouteConfigure;
    // component: unknown;
  }
>;
