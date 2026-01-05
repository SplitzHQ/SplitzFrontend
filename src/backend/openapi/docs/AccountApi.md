# AccountApi

All URIs are relative to _http://localhost_

| Method                                                     | HTTP request                    | Description                                       |
| ---------------------------------------------------------- | ------------------------------- | ------------------------------------------------- |
| [**addFriend**](AccountApi.md#addfriend)                   | **POST** /account/friend/{id}   | Add a friend to the current user                  |
| [**getUserInfo**](AccountApi.md#getuserinfo)               | **GET** /account                | Get the current user\&#39;s information           |
| [**removeFriend**](AccountApi.md#removefriend)             | **DELETE** /account/friend/{id} | Remove a friend from the current user             |
| [**updateFriendRemark**](AccountApi.md#updatefriendremark) | **PATCH** /account/friend/{id}  | Update the remark of a friend                     |
| [**updateUserInfo**](AccountApi.md#updateuserinfo)         | **PATCH** /account              | Update the current user\&#39;s username and photo |

## addFriend

> addFriend(id, body)

Add a friend to the current user

### Example

```ts
import { Configuration, AccountApi } from "";
import type { AddFriendRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: Bearer
    apiKey: "YOUR API KEY"
  });
  const api = new AccountApi(config);

  const body = {
    // string | friend\'s id
    id: id_example,
    // string | friend\'s remark (optional)
    body: body_example
  } satisfies AddFriendRequest;

  try {
    const data = await api.addFriend(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name     | Type     | Description          | Notes                     |
| -------- | -------- | -------------------- | ------------------------- |
| **id**   | `string` | friend\&#39;s id     | [Defaults to `undefined`] |
| **body** | `string` | friend\&#39;s remark | [Optional]                |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`, `text/json`, `application/*+json`
- **Accept**: `text/plain`, `application/json`, `text/json`

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **204**     | No Content   | -                |
| **401**     | Unauthorized | -                |
| **404**     | Not Found    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getUserInfo

> SplitzUserDto getUserInfo()

Get the current user\&#39;s information

### Example

```ts
import { Configuration, AccountApi } from "";
import type { GetUserInfoRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: Bearer
    apiKey: "YOUR API KEY"
  });
  const api = new AccountApi(config);

  try {
    const data = await api.getUserInfo();
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

[**SplitzUserDto**](SplitzUserDto.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **200**     | OK           | -                |
| **401**     | Unauthorized | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## removeFriend

> removeFriend(id)

Remove a friend from the current user

### Example

```ts
import { Configuration, AccountApi } from "";
import type { RemoveFriendRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: Bearer
    apiKey: "YOUR API KEY"
  });
  const api = new AccountApi(config);

  const body = {
    // string | friend\'s id
    id: id_example
  } satisfies RemoveFriendRequest;

  try {
    const data = await api.removeFriend(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name   | Type     | Description      | Notes                     |
| ------ | -------- | ---------------- | ------------------------- |
| **id** | `string` | friend\&#39;s id | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/plain`, `application/json`, `text/json`

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **204**     | No Content   | -                |
| **401**     | Unauthorized | -                |
| **404**     | Not Found    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateFriendRemark

> updateFriendRemark(id, remark)

Update the remark of a friend

### Example

```ts
import { Configuration, AccountApi } from "";
import type { UpdateFriendRemarkRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: Bearer
    apiKey: "YOUR API KEY"
  });
  const api = new AccountApi(config);

  const body = {
    // string | friend\'s id
    id: id_example,
    // string | friend\'s new remark (optional)
    remark: remark_example
  } satisfies UpdateFriendRemarkRequest;

  try {
    const data = await api.updateFriendRemark(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name       | Type     | Description              | Notes                                |
| ---------- | -------- | ------------------------ | ------------------------------------ |
| **id**     | `string` | friend\&#39;s id         | [Defaults to `undefined`]            |
| **remark** | `string` | friend\&#39;s new remark | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/plain`, `application/json`, `text/json`

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **204**     | No Content   | -                |
| **400**     | Bad Request  | -                |
| **401**     | Unauthorized | -                |
| **404**     | Not Found    | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateUserInfo

> updateUserInfo(splitzUserUpdateViewModel)

Update the current user\&#39;s username and photo

### Example

```ts
import {
  Configuration,
  AccountApi,
} from '';
import type { UpdateUserInfoRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: Bearer
    apiKey: "YOUR API KEY",
  });
  const api = new AccountApi(config);

  const body = {
    // SplitzUserUpdateViewModel | user info (optional)
    splitzUserUpdateViewModel: ...,
  } satisfies UpdateUserInfoRequest;

  try {
    const data = await api.updateUserInfo(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                          | Type                                                      | Description | Notes      |
| ----------------------------- | --------------------------------------------------------- | ----------- | ---------- |
| **splitzUserUpdateViewModel** | [SplitzUserUpdateViewModel](SplitzUserUpdateViewModel.md) | user info   | [Optional] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`, `text/json`, `application/*+json`
- **Accept**: `text/plain`, `application/json`, `text/json`

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **204**     | No Content   | -                |
| **401**     | Unauthorized | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
