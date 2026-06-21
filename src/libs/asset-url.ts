export const assetsBasePath = import.meta.env.VITE_SPLITZ_ASSETS_BASE_URL;
if (!assetsBasePath) {
  throw new Error("VITE_SPLITZ_ASSETS_BASE_URL environment variable is not set");
}

const absoluteUrlPattern = /^[a-z][a-z\d+.-]*:/i;

export function resolveAssetUrl<T extends string | null | undefined>(url: T): T | string {
  return resolveAssetUrlWithBase(url, assetsBasePath!);
}

export function resolveAssetUrlWithBase<T extends string | null | undefined>(url: T, baseUrl: string): T | string {
  if (!url || absoluteUrlPattern.test(url)) {
    return url;
  }

  return new URL(url.replace(/^\/+/, ""), ensureTrailingSlash(baseUrl)).toString();
}

function ensureTrailingSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}
