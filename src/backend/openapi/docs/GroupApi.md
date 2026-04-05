# GroupApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**addGroupMember**](GroupApi.md#addgroupmember) | **POST** /group/{groupId}/members | Add members to a group |
| [**createGroup**](GroupApi.md#creategroup) | **POST** /group | Create a new group |
| [**createGroupJoinLink**](GroupApi.md#creategroupjoinlink) | **POST** /group/{groupId}/join-link | create a join link for a group |
| [**deleteGroup**](GroupApi.md#deletegroup) | **DELETE** /group/{groupId} | Delete a group. |
| [**getGroup**](GroupApi.md#getgroup) | **GET** /group/{groupId} | Get the group info |
| [**getGroupInfoByLink**](GroupApi.md#getgroupinfobylink) | **GET** /group/join/{joinLinkId} | get group info from join link |
| [**getGroupTransactions**](GroupApi.md#getgrouptransactions) | **GET** /group/{groupId}/transactions | Get the group transactions |
| [**getGroups**](GroupApi.md#getgroups) | **GET** /group | Get the current user\&#39;s groups |
| [**joinGroupByLink**](GroupApi.md#joingroupbylink) | **POST** /group/join/{joinLinkId} | join a group by a join link |
| [**updateGroup**](GroupApi.md#updategroup) | **PUT** /group/{groupId} | Update group info |
| [**uploadGroupAvatar**](GroupApi.md#uploadgroupavatar) | **POST** /group/{groupId}/avatar | Upload a group avatar image. |



## addGroupMember

> GroupDto addGroupMember(groupId, requestBody)

Add members to a group

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { AddGroupMemberRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GroupApi(config);

  const body = {
    // string | group id
    groupId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // Array<string> | list of user ids (optional)
    requestBody: ...,
  } satisfies AddGroupMemberRequest;

  try {
    const data = await api.addGroupMember(body);
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
| **groupId** | `string` | group id | [Defaults to `undefined`] |
| **requestBody** | `Array<string>` | list of user ids | [Optional] |

### Return type

[**GroupDto**](GroupDto.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`, `text/json`, `application/*+json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |
| **201** | Created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createGroup

> GroupDto createGroup(groupInputDto)

Create a new group

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { CreateGroupRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GroupApi(config);

  const body = {
    // GroupInputDto | group info (optional)
    groupInputDto: ...,
  } satisfies CreateGroupRequest;

  try {
    const data = await api.createGroup(body);
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
| **groupInputDto** | [GroupInputDto](GroupInputDto.md) | group info | [Optional] |

### Return type

[**GroupDto**](GroupDto.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`, `text/json`, `application/*+json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **401** | Unauthorized |  -  |
| **201** | Created |  -  |
| **409** | Conflict |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## createGroupJoinLink

> GroupJoinLinkDto createGroupJoinLink(groupId)

create a join link for a group

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { CreateGroupJoinLinkRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GroupApi(config);

  const body = {
    // string | group id
    groupId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies CreateGroupJoinLinkRequest;

  try {
    const data = await api.createGroupJoinLink(body);
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
| **groupId** | `string` | group id | [Defaults to `undefined`] |

### Return type

[**GroupJoinLinkDto**](GroupJoinLinkDto.md)

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
| **404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteGroup

> deleteGroup(groupId)

Delete a group.

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { DeleteGroupRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GroupApi(config);

  const body = {
    // string
    groupId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DeleteGroupRequest;

  try {
    const data = await api.deleteGroup(body);
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
| **groupId** | `string` |  | [Defaults to `undefined`] |

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


## getGroup

> GroupDto getGroup(groupId)

Get the group info

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { GetGroupRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GroupApi(config);

  const body = {
    // string
    groupId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetGroupRequest;

  try {
    const data = await api.getGroup(body);
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
| **groupId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**GroupDto**](GroupDto.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getGroupInfoByLink

> GroupReducedDto getGroupInfoByLink(joinLinkId)

get group info from join link

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { GetGroupInfoByLinkRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GroupApi(config);

  const body = {
    // string | join link id
    joinLinkId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetGroupInfoByLinkRequest;

  try {
    const data = await api.getGroupInfoByLink(body);
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
| **joinLinkId** | `string` | join link id | [Defaults to `undefined`] |

### Return type

[**GroupReducedDto**](GroupReducedDto.md)

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
| **404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getGroupTransactions

> Array&lt;TransactionDto&gt; getGroupTransactions(groupId)

Get the group transactions

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { GetGroupTransactionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GroupApi(config);

  const body = {
    // string | 
    groupId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetGroupTransactionsRequest;

  try {
    const data = await api.getGroupTransactions(body);
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
| **groupId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**Array&lt;TransactionDto&gt;**](TransactionDto.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getGroups

> Array&lt;GroupDto&gt; getGroups()

Get the current user\&#39;s groups

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { GetGroupsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GroupApi(config);

  try {
    const data = await api.getGroups();
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

[**Array&lt;GroupDto&gt;**](GroupDto.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **401** | Unauthorized |  -  |
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## joinGroupByLink

> GroupDto joinGroupByLink(joinLinkId)

join a group by a join link

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { JoinGroupByLinkRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GroupApi(config);

  const body = {
    // string | join link id
    joinLinkId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies JoinGroupByLinkRequest;

  try {
    const data = await api.joinGroupByLink(body);
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
| **joinLinkId** | `string` | join link id | [Defaults to `undefined`] |

### Return type

[**GroupDto**](GroupDto.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateGroup

> GroupDto updateGroup(groupId, groupInputDto)

Update group info

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { UpdateGroupRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GroupApi(config);

  const body = {
    // string | Group Id
    groupId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // GroupInputDto | group info (optional)
    groupInputDto: ...,
  } satisfies UpdateGroupRequest;

  try {
    const data = await api.updateGroup(body);
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
| **groupId** | `string` | Group Id | [Defaults to `undefined`] |
| **groupInputDto** | [GroupInputDto](GroupInputDto.md) | group info | [Optional] |

### Return type

[**GroupDto**](GroupDto.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`, `text/json`, `application/*+json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |
| **201** | Created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## uploadGroupAvatar

> UploadImageResult uploadGroupAvatar(groupId, file)

Upload a group avatar image.

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { UploadGroupAvatarRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GroupApi(config);

  const body = {
    // string
    groupId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // Blob (optional)
    file: BINARY_DATA_HERE,
  } satisfies UploadGroupAvatarRequest;

  try {
    const data = await api.uploadGroupAvatar(body);
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
| **groupId** | `string` |  | [Defaults to `undefined`] |
| **file** | `Blob` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**UploadImageResult**](UploadImageResult.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |
| **400** | Bad Request |  -  |
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

