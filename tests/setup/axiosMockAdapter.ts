import { AxiosError } from "axios";
import type { AxiosAdapter, AxiosResponse } from "axios";
import { apiClient } from "../../src/shared/api/httpClient";

function parseResponseBody(body: string): unknown {
  if (!body) return undefined;

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

const mockFetchAdapter: AxiosAdapter = async (config) => {
  const method = config.method?.toUpperCase();
  const response = await fetch(apiClient.getUri(config), {
    body: config.data,
    credentials: config.withCredentials ? "include" : "same-origin",
    headers: config.headers.toJSON(),
    method: method === "GET" ? undefined : method,
    signal: config.signal,
  });
  const axiosResponse: AxiosResponse = {
    config,
    data: await parseResponseBody(await response.text()),
    headers: {},
    status: response.status,
    statusText: response.statusText,
  };

  if (response.ok) return axiosResponse;

  throw new AxiosError(
    `Request failed with status code ${response.status}`,
    AxiosError.ERR_BAD_RESPONSE,
    config,
    undefined,
    axiosResponse,
  );
};

apiClient.defaults.adapter = mockFetchAdapter;
