import { request_factory } from "@/domains/request/utils";
import { Result } from "@/domains/result/index";

/**
 * 域名 https://media.funzm.com
 */
export const request1 = request_factory({
  hostnames: {
    dev: "https://media-t.funzm.com",
    test: "https://media-t.funzm.com",
    prod: "",
  },
  process<T>(r: Result<{ code: number | string; msg: string; data: T }>) {
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const { code, msg, data } = r.data;
    if (code !== 0) {
      return Result.Err(msg, code, data);
    }
    return Result.Ok(data);
  },
});

/**
 * 域名 https://subtitle.funzm.com
 */
export const request2 = request_factory({
  hostnames: {
    dev: "https://subtitle-t.funzm.com",
    test: "https://subtitle-t.funzm.com",
    prod: "https://subtitle.frp.funzm.com",
  },
  process<T>(r: Result<{ code: number | string; msg: string; data: T }>) {
    if (r.error) {
      return Result.Err(r.error.message);
    }
    const { code, msg, data } = r.data;
    if (code !== 0) {
      return Result.Err(msg, code, data);
    }
    return Result.Ok(data);
  },
});
