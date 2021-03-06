"use strict";

import Vue from "vue";
import axios from "axios";
import store from "../store";
import qs from "querystring";
import router from "../router";
import server from "../plugins/server";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import { Promise } from "core-js";

// Full config:  https://github.com/axios/axios#request-config
axios.defaults.baseURL =
  process.env.baseURL || process.env.apiUrl || server.axios_url;
//axios.defaults.headers.post["Content-Type"] = "application/json";
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

let config = {
  // baseURL: process.env.baseURL || process.env.apiUrl || ""
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
};

const _axios = axios.create(config);

_axios.interceptors.request.use(
  function(config) {
    // Do something before request is sent
    return config;
  },
  function(error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
_axios.interceptors.response.use(
  function(response) {
    // Do something with response data
    return response;
  },
  function(error) {
    // Do something with response error
    return Promise.reject(error);
  }
);

Plugin.install = function(Vue, options) {
  Vue.axios = _axios;
  window.axios = _axios;
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return _axios;
      }
    },
    $axios: {
      get() {
        return _axios;
      }
    }
  });
};

Vue.use(Plugin);

const refreshAuthLogic = failedRequest =>
  Vue.axios
    .post(
      "auth/token",
      qs.stringify({
        client_id: server.client_id,
        refresh_token: store.state.User.refresh_token,
        grant_type: "refresh_token"
      })
    )
    .then(tokenRefreshResponse => {
      let token = tokenRefreshResponse.data.access_token;
      localStorage.setItem("token", token);
      store.commit("User/refresh_update_token", { access_token: token });
      failedRequest.response.config.headers["Authorization"] =
        "Bearer " + token;
      console.log("success get new token");
      return Promise.resolve();
    })
    .catch(error => {
      console.log("error get new token");
      return Promise.reject(error);
    });

createAuthRefreshInterceptor(Vue.axios, refreshAuthLogic);

export default Plugin;
