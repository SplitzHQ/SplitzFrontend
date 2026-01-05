# SplitzBackendApi

All URIs are relative to _http://localhost_

| Method                                                                                           | HTTP request                              | Description |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------- | ----------- |
| [**accountForgotPasswordPost**](SplitzBackendApi.md#accountforgotpasswordpost)                   | **POST** /account/forgotPassword          |             |
| [**accountLoginPost**](SplitzBackendApi.md#accountloginpost)                                     | **POST** /account/login                   |             |
| [**accountManage2faPost**](SplitzBackendApi.md#accountmanage2fapost)                             | **POST** /account/manage/2fa              |             |
| [**accountManageInfoGet**](SplitzBackendApi.md#accountmanageinfoget)                             | **GET** /account/manage/info              |             |
| [**accountManageInfoPost**](SplitzBackendApi.md#accountmanageinfopost)                           | **POST** /account/manage/info             |             |
| [**accountRefreshPost**](SplitzBackendApi.md#accountrefreshpost)                                 | **POST** /account/refresh                 |             |
| [**accountRegisterPost**](SplitzBackendApi.md#accountregisterpost)                               | **POST** /account/register                |             |
| [**accountResendConfirmationEmailPost**](SplitzBackendApi.md#accountresendconfirmationemailpost) | **POST** /account/resendConfirmationEmail |             |
| [**accountResetPasswordPost**](SplitzBackendApi.md#accountresetpasswordpost)                     | **POST** /account/resetPassword           |             |
| [**mapIdentityApiAccountConfirmEmail**](SplitzBackendApi.md#mapidentityapiaccountconfirmemail)   | **GET** /account/confirmEmail             |             |

## accountForgotPasswordPost

> accountForgotPasswordPost(forgotPasswordRequest)

### Example

```ts
import {
  Configuration,
  SplitzBackendApi,
} from '';
import type { AccountForgotPasswordPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SplitzBackendApi();

  const body = {
    // ForgotPasswordRequest
    forgotPasswordRequest: ...,
  } satisfies AccountForgotPasswordPostRequest;

  try {
    const data = await api.accountForgotPasswordPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                      | Type                                              | Description | Notes |
| ------------------------- | ------------------------------------------------- | ----------- | ----- |
| **forgotPasswordRequest** | [ForgotPasswordRequest](ForgotPasswordRequest.md) |             |       |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/problem+json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     | OK          | -                |
| **400**     | Bad Request | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## accountLoginPost

> AccessTokenResponse accountLoginPost(loginRequest, useCookies, useSessionCookies)

### Example

```ts
import {
  Configuration,
  SplitzBackendApi,
} from '';
import type { AccountLoginPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SplitzBackendApi();

  const body = {
    // LoginRequest
    loginRequest: ...,
    // boolean (optional)
    useCookies: true,
    // boolean (optional)
    useSessionCookies: true,
  } satisfies AccountLoginPostRequest;

  try {
    const data = await api.accountLoginPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                  | Type                            | Description | Notes                                |
| --------------------- | ------------------------------- | ----------- | ------------------------------------ |
| **loginRequest**      | [LoginRequest](LoginRequest.md) |             |                                      |
| **useCookies**        | `boolean`                       |             | [Optional] [Defaults to `undefined`] |
| **useSessionCookies** | `boolean`                       |             | [Optional] [Defaults to `undefined`] |

### Return type

[**AccessTokenResponse**](AccessTokenResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     | OK          | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## accountManage2faPost

> TwoFactorResponse accountManage2faPost(twoFactorRequest)

### Example

```ts
import {
  Configuration,
  SplitzBackendApi,
} from '';
import type { AccountManage2faPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SplitzBackendApi();

  const body = {
    // TwoFactorRequest
    twoFactorRequest: ...,
  } satisfies AccountManage2faPostRequest;

  try {
    const data = await api.accountManage2faPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                 | Type                                    | Description | Notes |
| -------------------- | --------------------------------------- | ----------- | ----- |
| **twoFactorRequest** | [TwoFactorRequest](TwoFactorRequest.md) |             |       |

### Return type

[**TwoFactorResponse**](TwoFactorResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     | OK          | -                |
| **400**     | Bad Request | -                |
| **404**     | Not Found   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## accountManageInfoGet

> InfoResponse accountManageInfoGet()

### Example

```ts
import { Configuration, SplitzBackendApi } from "";
import type { AccountManageInfoGetRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SplitzBackendApi();

  try {
    const data = await api.accountManageInfoGet();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**InfoResponse**](InfoResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     | OK          | -                |
| **400**     | Bad Request | -                |
| **404**     | Not Found   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## accountManageInfoPost

> InfoResponse accountManageInfoPost(infoRequest)

### Example

```ts
import {
  Configuration,
  SplitzBackendApi,
} from '';
import type { AccountManageInfoPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SplitzBackendApi();

  const body = {
    // InfoRequest
    infoRequest: ...,
  } satisfies AccountManageInfoPostRequest;

  try {
    const data = await api.accountManageInfoPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name            | Type                          | Description | Notes |
| --------------- | ----------------------------- | ----------- | ----- |
| **infoRequest** | [InfoRequest](InfoRequest.md) |             |       |

### Return type

[**InfoResponse**](InfoResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     | OK          | -                |
| **400**     | Bad Request | -                |
| **404**     | Not Found   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## accountRefreshPost

> AccessTokenResponse accountRefreshPost(refreshRequest)

### Example

```ts
import {
  Configuration,
  SplitzBackendApi,
} from '';
import type { AccountRefreshPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SplitzBackendApi();

  const body = {
    // RefreshRequest
    refreshRequest: ...,
  } satisfies AccountRefreshPostRequest;

  try {
    const data = await api.accountRefreshPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name               | Type                                | Description | Notes |
| ------------------ | ----------------------------------- | ----------- | ----- |
| **refreshRequest** | [RefreshRequest](RefreshRequest.md) |             |       |

### Return type

[**AccessTokenResponse**](AccessTokenResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     | OK          | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## accountRegisterPost

> accountRegisterPost(registerRequest)

### Example

```ts
import {
  Configuration,
  SplitzBackendApi,
} from '';
import type { AccountRegisterPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SplitzBackendApi();

  const body = {
    // RegisterRequest
    registerRequest: ...,
  } satisfies AccountRegisterPostRequest;

  try {
    const data = await api.accountRegisterPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                | Type                                  | Description | Notes |
| ------------------- | ------------------------------------- | ----------- | ----- |
| **registerRequest** | [RegisterRequest](RegisterRequest.md) |             |       |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/problem+json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     | OK          | -                |
| **400**     | Bad Request | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## accountResendConfirmationEmailPost

> accountResendConfirmationEmailPost(resendConfirmationEmailRequest)

### Example

```ts
import {
  Configuration,
  SplitzBackendApi,
} from '';
import type { AccountResendConfirmationEmailPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SplitzBackendApi();

  const body = {
    // ResendConfirmationEmailRequest
    resendConfirmationEmailRequest: ...,
  } satisfies AccountResendConfirmationEmailPostRequest;

  try {
    const data = await api.accountResendConfirmationEmailPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                               | Type                                                                | Description | Notes |
| ---------------------------------- | ------------------------------------------------------------------- | ----------- | ----- |
| **resendConfirmationEmailRequest** | [ResendConfirmationEmailRequest](ResendConfirmationEmailRequest.md) |             |       |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     | OK          | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## accountResetPasswordPost

> accountResetPasswordPost(resetPasswordRequest)

### Example

```ts
import {
  Configuration,
  SplitzBackendApi,
} from '';
import type { AccountResetPasswordPostRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SplitzBackendApi();

  const body = {
    // ResetPasswordRequest
    resetPasswordRequest: ...,
  } satisfies AccountResetPasswordPostRequest;

  try {
    const data = await api.accountResetPasswordPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                     | Type                                            | Description | Notes |
| ------------------------ | ----------------------------------------------- | ----------- | ----- |
| **resetPasswordRequest** | [ResetPasswordRequest](ResetPasswordRequest.md) |             |       |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/problem+json`

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     | OK          | -                |
| **400**     | Bad Request | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## mapIdentityApiAccountConfirmEmail

> mapIdentityApiAccountConfirmEmail(userId, code, changedEmail)

### Example

```ts
import { Configuration, SplitzBackendApi } from "";
import type { MapIdentityApiAccountConfirmEmailRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SplitzBackendApi();

  const body = {
    // string
    userId: userId_example,
    // string
    code: code_example,
    // string (optional)
    changedEmail: changedEmail_example
  } satisfies MapIdentityApiAccountConfirmEmailRequest;

  try {
    const data = await api.mapIdentityApiAccountConfirmEmail(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name             | Type     | Description | Notes                                |
| ---------------- | -------- | ----------- | ------------------------------------ |
| **userId**       | `string` |             | [Defaults to `undefined`]            |
| **code**         | `string` |             | [Defaults to `undefined`]            |
| **changedEmail** | `string` |             | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined

### HTTP response details

| Status code | Description | Response headers |
| ----------- | ----------- | ---------------- |
| **200**     | OK          | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
