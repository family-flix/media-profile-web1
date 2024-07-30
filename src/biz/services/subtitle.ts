import { request2 } from "@/biz/requests";
import { SubtitleParagraph } from "@/biz/subtitle/types";

export function subtitleProfile(values: { id: number }) {
  return request2.post<{
    id: number;
    created_at: string;
    updated_at: string;
    title: string;
    suffix: string;
    language: string;
    media_episode_profile_id: number;
    media_episode_profile: {
      id: number;
      name: string;
      order: number;
      still_path: string;
      unique_id: string;
      media_profile_id: number;
      media_profile: {
        id: number;
        title: string;
        original_name: null;
        order: number;
        poster: string;
        unique_id: string;
      };
    };
    paragraphs: SubtitleParagraph[];
  }>("/api/v1/subtitle/profile", values);
}

export function subtitleCreate(values: {
  title: string;
  suffix: string;
  language: string;
  paragraphs: SubtitleParagraph[];
  media: {
    id: string;
    name: string;
    order: number;
    original_name: string | null;
    poster_path: string;
    episode: {
      name: string;
      order: number;
      overview: string;
      still_path: string;
    };
  };
}) {
  return request2.post("/api/v1/subtitle/create", values);
}
export function subtitleUpdate(values: {
  id: number;
  title: string;
  suffix: string;
  language: string;
  paragraphs: SubtitleParagraph[];
  media?: {
    id: string;
    name: string;
    order: number;
    original_name: string | null;
    poster_path: string;
    episode: {
      name: string;
      order: number;
      overview: string;
      still_path: string;
    };
  };
}) {
  return request2.post("/api/v1/subtitle/update", values);
}

export function subtitleAnalysis(values: { id: number }) {
  return request2.post("/api/v1/subtitle/analysis", values);
}

export function subtitleDownload(values: { id: number }) {
  return request2.post("/api/v1/subtitle/download", values);
}

export function downloadMedia(values: { url: string; filename: string }) {
  return request2.post("/api/v1/media/download", values);
}
