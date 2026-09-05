import { request } from "@/shared/api/httpClient";
import type { AdminResource, ContentRecord } from "../types/admin";

export const adminApi = {
  list: (resource: AdminResource) =>
    request<ContentRecord[]>(`/admin/${resource}`),
  create: (resource: AdminResource, data: Record<string, unknown>) =>
    request<ContentRecord>(`/admin/${resource}`, {
      method: "POST",
      data: { data },
    }),
  update: (
    resource: AdminResource,
    id: string,
    data: Record<string, unknown>,
  ) =>
    request<ContentRecord>(`/admin/${resource}/${id}`, {
      method: "PATCH",
      data: { data },
    }),
  archive: (resource: AdminResource, id: string) =>
    request<ContentRecord>(`/admin/${resource}/${id}/archive`, {
      method: "POST",
    }),
};
