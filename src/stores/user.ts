import { defineStore } from "pinia";
import { ref } from "vue";

import config from "@/backend/config";
import {
  SplitzBackendApi,
  AccountApi,
  type LoginRequest,
  type RegisterRequest,
  type SplitzUserDto
} from "@/backend/openapi";

export const useUserStore = defineStore("user", () => {
  const user = ref<SplitzUserDto | null>(null);
  const isAuthenticated = ref(false);
  const api = new SplitzBackendApi(config);
  const accountApi = new AccountApi(config);

  async function login(loginRequest: LoginRequest) {
    try {
      const response = await api.accountLoginPost({ loginRequest });
      if (response.accessToken && response.refreshToken) {
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        localStorage.setItem(
          "accessTokenExpiration",
          new Date(Date.now() + 1000 * response.expiresIn).getTime().toString()
        );
        isAuthenticated.value = true;
        // Fetch user info to get ID
        await fetchUserInfo();
        return true;
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
    return false;
  }

  async function register(registerRequest: RegisterRequest) {
    try {
      await api.accountRegisterPost({ registerRequest });
      return true;
    } catch (error) {
      console.error("Registration failed", error);
      throw error;
    }
  }

  async function fetchUserInfo() {
    try {
      const userInfo = await accountApi.getUserInfo();
      user.value = userInfo;
      isAuthenticated.value = true;
    } catch (error) {
      console.error("Failed to fetch user info", error);
    }
  }

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessTokenExpiration");
    user.value = null;
    isAuthenticated.value = false;
  }

  if (!user.value) {
    void fetchUserInfo();
  }

  return { user, isAuthenticated, login, register, logout, fetchUserInfo };
});
