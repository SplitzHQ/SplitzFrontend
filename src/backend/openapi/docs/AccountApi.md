# AccountApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**acceptFriendRequest**](AccountApi.md#acceptfriendrequest) | **POST** /account/friend/request/{requestId}/accept | Accept a friend request. Creates the friendship in both directions and tells the sender. |
| [**cancelFriendRequest**](AccountApi.md#cancelfriendrequest) | **DELETE** /account/friend/request/{requestId} | Cancel a friend request the current user sent. |
| [**getFriendRequests**](AccountApi.md#getfriendrequests) | **GET** /account/friend/request | Pending friend requests sent to and by the current user. |
| [**getUserInfo**](AccountApi.md#getuserinfo) | **GET** /account | Get the current user\&#39;s information |
| [**ignoreFriendRequest**](AccountApi.md#ignorefriendrequest) | **POST** /account/friend/request/{requestId}/ignore | Ignore a friend request. The sender is not told. |
| [**removeFriend**](AccountApi.md#removefriend) | **DELETE** /account/friend/{id} | Remove a friend. Friendship is mutual, so both directions are removed. |
| [**sendFriendRequest**](AccountApi.md#sendfriendrequestoperation) | **POST** /account/friend/request | Send a friend request. The other user becomes a friend only after they accept.  If they already sent a request to the current user, both requests are accepted at once. |
| [**updateFriendRemark**](AccountApi.md#updatefriendremark) | **PATCH** /account/friend/{id} | Update the remark of a friend |
| [**updateUserInfo**](AccountApi.md#updateuserinfo) | **PATCH** /account | Update the current user\&#39;s username and photo |
| [**uploadUserAvatar**](AccountApi.md#uploaduseravatar) | **POST** /account/avatar | Upload the current user\&#39;s avatar image. |



## acceptFriendRequest

> acceptFriendRequest(requestId, body)

Accept a friend request. Creates the friendship in both directions and tells the sender.

### Example

```ts
import {
  Configuration,
  AccountApi,
} from '';
import type { AcceptFriendRequestRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AccountApi(config);

  const body = {
    // string | friend request id
    requestId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | nickname the current user wants for the new friend (optional)
    body: body_example,
  } satisfies AcceptFriendRequestRequest;

  try {
    const data = await api.acceptFriendRequest(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestId** | `string` | friend request id | [Defaults to `undefined`] |
| **body** | `string` | nickname the current user wants for the new friend | [Optional] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`, `text/json`, `application/*+json`
- **Accept**: `text/plain`, `application/json`, `text/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | No Content |  -  |
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## cancelFriendRequest

> cancelFriendRequest(requestId)

Cancel a friend request the current user sent.

### Example

```ts
import {
  Configuration,
  AccountApi,
} from '';
import type { CancelFriendRequestRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AccountApi(config);

  const body = {
    // string
    requestId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies CancelFriendRequestRequest;

  try {
    const data = await api.cancelFriendRequest(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestId** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/plain`, `application/json`, `text/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | No Content |  -  |
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getFriendRequests

> FriendRequestListDto getFriendRequests()

Pending friend requests sent to and by the current user.

### Example

```ts
import {
  Configuration,
  AccountApi,
} from '';
import type { GetFriendRequestsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AccountApi(config);

  try {
    const data = await api.getFriendRequests();
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

[**FriendRequestListDto**](FriendRequestListDto.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getUserInfo

> SplitzUserDto getUserInfo()

Get the current user\&#39;s information

### Example

```ts
import {
  Configuration,
  AccountApi,
} from '';
import type { GetUserInfoRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
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
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## ignoreFriendRequest

> ignoreFriendRequest(requestId)

Ignore a friend request. The sender is not told.

### Example

```ts
import {
  Configuration,
  AccountApi,
} from '';
import type { IgnoreFriendRequestRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AccountApi(config);

  const body = {
    // string
    requestId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies IgnoreFriendRequestRequest;

  try {
    const data = await api.ignoreFriendRequest(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **requestId** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/plain`, `application/json`, `text/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | No Content |  -  |
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeFriend

> removeFriend(id)

Remove a friend. Friendship is mutual, so both directions are removed.

### Example

```ts
import {
  Configuration,
  AccountApi,
} from '';
import type { RemoveFriendRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AccountApi(config);

  const body = {
    // string | friend\'s id
    id: id_example,
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


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` | friend\&#39;s id | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/plain`, `application/json`, `text/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | No Content |  -  |
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## sendFriendRequest

> FriendRequestDto sendFriendRequest(sendFriendRequestRequest)

Send a friend request. The other user becomes a friend only after they accept.  If they already sent a request to the current user, both requests are accepted at once.

### Example

```ts
import {
  Configuration,
  AccountApi,
} from '';
import type { SendFriendRequestOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AccountApi(config);

  const body = {
    // SendFriendRequestRequest | Recipient\'s friendId and optional nickname. (optional)
    sendFriendRequestRequest: ...,
  } satisfies SendFriendRequestOperationRequest;

  try {
    const data = await api.sendFriendRequest(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **sendFriendRequestRequest** | [SendFriendRequestRequest](SendFriendRequestRequest.md) | Recipient\&#39;s friendId and optional nickname. | [Optional] |

### Return type

[**FriendRequestDto**](FriendRequestDto.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`, `text/json`, `application/*+json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **400** | Bad Request |  -  |
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateFriendRemark

> updateFriendRemark(id, remark)

Update the remark of a friend

### Example

```ts
import {
  Configuration,
  AccountApi,
} from '';
import type { UpdateFriendRemarkRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AccountApi(config);

  const body = {
    // string | friend\'s id
    id: id_example,
    // string | friend\'s new remark (optional)
    remark: remark_example,
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


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` | friend\&#39;s id | [Defaults to `undefined`] |
| **remark** | `string` | friend\&#39;s new remark | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `text/plain`, `application/json`, `text/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | No Content |  -  |
| **400** | Bad Request |  -  |
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |

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
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
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


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **splitzUserUpdateViewModel** | [SplitzUserUpdateViewModel](SplitzUserUpdateViewModel.md) | user info | [Optional] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`, `text/json`, `application/*+json`
- **Accept**: `text/plain`, `application/json`, `text/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | No Content |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## uploadUserAvatar

> UploadImageResult uploadUserAvatar(file)

Upload the current user\&#39;s avatar image.

### Example

```ts
import {
  Configuration,
  AccountApi,
} from '';
import type { UploadUserAvatarRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AccountApi(config);

  const body = {
    // Blob (optional)
    file: BINARY_DATA_HERE,
  } satisfies UploadUserAvatarRequest;

  try {
    const data = await api.uploadUserAvatar(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **file** | `Blob` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**UploadImageResult**](UploadImageResult.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **401** | Unauthorized |  -  |
| **400** | Bad Request |  -  |
| **200** | OK |  -  |
| **429** | Too Many Requests |  * Retry-After - delta-seconds or HTTP-date <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

