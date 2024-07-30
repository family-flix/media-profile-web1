/**
 * 在页面间切换时，希望上一个页面做的事情
 */
export const pendingActions: Partial<{
  deleteTV: {
    tv_id: string;
    id: string;
  };
  deleteMovie: {
    movie_id: string;
  };
  pendingSubtitle: {
    media: {
      id: string;
      order: number;
      name: string;
      original_name: string | null;
      poster_path: string;
    };
    episode: {
      id: string;
      name: string;
      order: number;
      overview: string;
      still_path: string;
      url: string;
    };
    subtitle: null | {
      type: number;
      id: string;
      name: string;
      url: string;
      language: string;
    };
  };
}> = {};
export function appendAction<T extends keyof typeof pendingActions>(key: T, value: (typeof pendingActions)[T]) {
  pendingActions[key] = value;
}
export function consumeAction<T extends keyof typeof pendingActions>(key: T): (typeof pendingActions)[T] {
  const v = pendingActions[key];
  delete pendingActions[key];
  return v;
}
