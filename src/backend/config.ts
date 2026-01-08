import router, { publicRoutes } from "@/router";

import { SplitzBackendApi } from "./openapi/apis/SplitzBackendApi";
import { Configuration, type Middleware } from "./openapi/runtime";

const getBasePath = () => {
  return "http://172.233.154.131:5119";
};

const basePath = getBasePath();

const unauthorizedMiddleware: Middleware = {
  post: async ({ response }) => {
    if (response.status !== 401) {
      return;
    }

    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessTokenExpiration");
    } catch {
      // ignore (e.g. tests / restricted storage)
    }
  }
};

const config = new Configuration({
  basePath: basePath,
  middleware: [unauthorizedMiddleware],

  apiKey: async () => {
    let accessToken = localStorage.getItem("accessToken");
    const accessTokenExpiration = localStorage.getItem("accessTokenExpiration");
    const backendApi = new SplitzBackendApi(new Configuration({ basePath: basePath }));

    if (accessTokenExpiration && parseInt(accessTokenExpiration) < Date.now()) {
      accessToken = null;
      // access token expired, refresh it
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const accessTokenResponse = await backendApi.accountRefreshPost({
            refreshRequest: {
              refreshToken: refreshToken
            }
          });
          if (accessTokenResponse.accessToken && accessTokenResponse.refreshToken) {
            localStorage.setItem("accessToken", accessTokenResponse.accessToken);
            localStorage.setItem("refreshToken", accessTokenResponse.refreshToken);
            localStorage.setItem(
              "accessTokenExpiration",
              new Date(Date.now() + 1000 * accessTokenResponse.expiresIn).getTime().toString()
            );
            accessToken = accessTokenResponse.accessToken;
          }
        } catch {
          // do nothing, will return undefined accessToken
        }
      }
    }

    return "Bearer " + accessToken;
  }
});

export default config;
