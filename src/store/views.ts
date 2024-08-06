import { JSXElement } from "solid-js";

import { ViewComponent } from "@/store/types";
import { NotFoundPage } from "@/pages/notfound";
import { MediaProfileHomeLayout } from "@/pages/home/layout";
import { MediaProfileManagePage } from "@/pages/home/index";
import { MediaProfileCatchPage } from "@/pages/home/catch";
import { MediaRankPage } from "@/pages/home/rank";
import { MediaProfilePage } from "@/pages/home/profile";
import { LoginPage } from "@/pages/login";
// import { SubtitleListPage } from "@/pages/home/subtitle/list";
import { SubtitleListPage } from "@/pages/home/subtitle/list_v2";
import { SubtitleProfilePage } from "@/pages/home/subtitle/profile";
import { SubtitleEditorPage } from "@/pages/home/editor";

import { PageKeys } from "./routes";

export const pages: Omit<Record<PageKeys, ViewComponent>, "root"> = {
  "root.home_layout": MediaProfileHomeLayout,
  "root.home_layout.index": MediaProfileManagePage,
  "root.home_layout.search": MediaProfileCatchPage,
  "root.home_layout.profile": MediaProfilePage,
  "root.home_layout.rank": MediaRankPage,
  "root.home_layout.subtitle_list": SubtitleListPage,
  "root.home_layout.subtitle_profile": SubtitleProfilePage,
  "root.home_layout.editor": SubtitleEditorPage,
  "root.login": LoginPage,
  "root.notfound": NotFoundPage,
};
