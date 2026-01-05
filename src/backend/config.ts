import router, { publicRoutes } from "@/router";

import { SplitzBackendApi } from "./openapi/apis/SplitzBackendApi";
import { Configuration } from "./openapi/runtime";

// Automatically select backend API address based on frontend access address
// If frontend accesses via LAN IP, backend uses the same IP
const getBasePath = () => {
  const hostname = window.location.hostname;

  // If frontend accesses via localhost or 127.0.0.1, backend also uses localhost
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5119";
  }

  // If frontend accesses via LAN IP (mobile devices), backend uses the same IP
  // Example: frontend is http://192.168.1.100:5173, backend is http://192.168.1.100:5119
  return `http://${hostname}:5119`;
};

const basePath = getBasePath();

const config = new Configuration({
  basePath: basePath,

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

    if (!accessToken) {
      if (publicRoutes.includes(router.currentRoute.value.name)) router.push({ name: "login" });
    }

    return "Bearer " + accessToken;
  }
});

export default config;
