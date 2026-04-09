import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest";
import { BACKEND_BASE_URL } from "@/constants";
import { CreateResponse, GetOneResponse, ListResponse } from "@/types";
import { HttpError, UpdateResponse } from "@refinedev/core";

const buildHttpError = async (response: Response): Promise<HttpError> => {
  let message = "Request failed";

  try {
    const payload = (await response.json()) as { message?: string };

    if (payload?.message) message = payload.message;
  } catch {
    // Ignore errors
  }

  return {
    message,
    statusCode: response.status,
  };
};

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => `api/${resource}`,

    buildQueryParams: async ({ resource, pagination, filters }) => {
      const page = pagination?.currentPage ?? 1;
      const pageSize = pagination?.pageSize ?? 10;

      const params: Record<string, string | number> = { page, limit: pageSize };

      filters?.forEach((filter) => {
        const field = "field" in filter ? filter.field : "";

        const value = String(filter.value);

        if (resource === "subjects") {
          if (field === "department") params.department = value;
          if (field === "name" || field === "code") params.search = value;
        }

        if (resource === "classes") {
          if (field === "name") params.search = value;
          if (field === "subject") params.subject = value;
          if (field === "teacher") params.teacher = value;
        }

        if (resource === "class-join-requests") {
          if (field === "classId") params.classId = value;
          if (field === "studentId") params.studentId = value;
          if (field === "status") params.status = value;
        }

        if (resource === "enrollments") {
          if (field === "classId") params.classId = value;
          if (field === "studentId") params.studentId = value;
        }
      });

      return params;
    },

    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);

      const payload: ListResponse = await response.clone().json();
      return payload.data ?? [];
    },

    getTotalCount: async (response) => {
      if (!response.ok) throw await buildHttpError(response);

      const payload: ListResponse = await response.clone().json();

      return payload.pagination?.total ?? payload.data?.length ?? 0;
    },
  },

  create: {
    getEndpoint: ({ resource }) => `api/${resource}`,

    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);

      const json: CreateResponse = await response.clone().json();

      return json.data ?? {};
    },
  },

  update: {
    getEndpoint: ({ resource, id }) => `api/${resource}/${id}`,
    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);

      const json: UpdateResponse = await response.clone().json();

      return json.data ?? {};
    },
  },

  deleteOne: {
    getEndpoint: ({ resource, id }) => `api/${resource}/${id}`,

    mapResponse: async (response) => {
      if (!response.ok) return await buildHttpError(response);

      const json = await response.clone().json();

      return json.data ?? {};
    },
  },

  getOne: {
    getEndpoint: ({ resource, id }) => `api/${resource}/${id}`,

    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);

      const json: GetOneResponse = await response.clone().json();

      return json.data ?? {};
    },
  },
};

const originalFetch = globalThis.fetch.bind(globalThis);

type PendingRequest = {
  response: Promise<Response>;
  timestamp: number;
};

const pending = new Map<string, PendingRequest>();

async function fetchWithRetry(
  url: string | URL | Request,
  opts: RequestInit,
  attempt = 1
): Promise<Response> {
  const urlStr = typeof url === "string"
    ? url
    : (url instanceof Request ? url.url : String(url));

  try {
    const res = await originalFetch(urlStr, {
      ...opts,
      credentials: "include",
    });

    if (res.ok) return res;

    if (res.status >= 500 && attempt < 4) {
      const delay = Math.floor(
        1500 * Math.pow(2, attempt - 1) + Math.random() * 1500
      );
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(
        urlStr,
        { ...opts, credentials: "include" },
        attempt + 1
      );
    }

    return res;
  } catch (err) {
    if (attempt < 4) {
      const delay = Math.floor(
        1500 * Math.pow(2, attempt - 1) + Math.random() * 1500
      );
      await new Promise((r) => setTimeout(r, delay));
      return fetchWithRetry(
        urlStr,
        { ...opts, credentials: "include" },
        attempt + 1
      );
    }
    throw err;
  }
}

async function deduplicatedFetch(
  url: string | URL | Request,
  opts: RequestInit,
  attempt = 1
): Promise<Response> {
  const urlStr = typeof url === "string"
    ? url
    : (url instanceof Request ? url.url : String(url));

  if (urlStr.includes("/api/auth/")) {
    return fetchWithRetry(urlStr, opts, attempt);
  }

  const cacheKey = `${urlStr}|${JSON.stringify(opts)}`;
  const now = Date.now();

  const existing = pending.get(cacheKey);
  if (existing && now - existing.timestamp < 5000) {
    return (await existing.response).clone();
  }

  const p = fetchWithRetry(urlStr, opts, attempt);
  pending.set(cacheKey, { response: p, timestamp: now });

  try {
    return await p;
  } finally {
    setTimeout(() => {
      if (pending.get(cacheKey)?.response === p) {
        pending.delete(cacheKey);
      }
    }, 5000);
  }
}

globalThis.fetch = deduplicatedFetch as typeof globalThis.fetch;

const { dataProvider: baseDataProvider } = createDataProvider(
  BACKEND_BASE_URL,
  options,
  { credentials: "include" }
);

export const dataProvider = {
  ...baseDataProvider,
  getApiUrl: () => BACKEND_BASE_URL,
};
