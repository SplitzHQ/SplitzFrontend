export const assetsBasePath = import.meta.env.VITE_SPLITZ_ASSETS_BASE_URL ?? "https://splitz.pro/assets";

const absoluteUrlPattern = /^[a-z][a-z\d+.-]*:/i;

export function resolveAssetUrl<T extends string | null | undefined>(url: T): T | string {
  return resolveAssetUrlWithBase(url, assetsBasePath);
}

export function resolveAssetUrlWithBase<T extends string | null | undefined>(url: T, baseUrl: string): T | string {
  if (!url || absoluteUrlPattern.test(url)) {
    return url;
  }

  return new URL(url, ensureTrailingSlash(baseUrl)).toString();
}

function ensureTrailingSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}
