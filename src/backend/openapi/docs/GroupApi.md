# GroupApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**acceptGroupInvite**](GroupApi.md#acceptgroupinvite) | **POST** /group/invite/{inviteId}/accept | Accept a group invite and join the group. |
| [**createGroup**](GroupApi.md#creategroup) | **POST** /group | Create a new group. The creator joins immediately; every other user in MembersId receives an invite. |
| [**createGroupJoinLink**](GroupApi.md#creategroupjoinlink) | **POST** /group/{groupId}/join-link | create a join link for a group |
| [**deleteGroup**](GroupApi.md#deletegroup) | **DELETE** /group/{groupId} | Delete a group. |
| [**getGroup**](GroupApi.md#getgroup) | **GET** /group/{groupId} | Get the group info |
| [**getGroupInfoByLink**](GroupApi.md#getgroupinfobylink) | **GET** /group/join/{joinLinkId} | get group info from join link |
| [**getGroupInvites**](GroupApi.md#getgroupinvites) | **GET** /group/{groupId}/invites | Pending invites for a group, so members can see who has not answered yet. |
| [**getGroupInvoices**](GroupApi.md#getgroupinvoices) | **GET** /group/{groupId}/invoices | Get the group invoices |
| [**getGroupTransactions**](GroupApi.md#getgrouptransactions) | **GET** /group/{groupId}/transactions | Get the group transactions |
| [**getGroups**](GroupApi.md#getgroups) | **GET** /group | Get the current user\&#39;s groups |
| [**getMyGroupInvites**](GroupApi.md#getmygroupinvites) | **GET** /group/invites | Pending invites addressed to the current user. |
| [**ignoreGroupInvite**](GroupApi.md#ignoregroupinvite) | **POST** /group/invite/{inviteId}/ignore | Ignore a group invite. The inviter is not told. |
| [**inviteGroupMembers**](GroupApi.md#invitegroupmembers) | **POST** /group/{groupId}/invites | Invite friends to a group. Each invited user gets a request notification and joins only after accepting.  Users who are not friends of the inviter, are already members, or already have a pending invite are skipped. |
| [**joinGroupByLink**](GroupApi.md#joingroupbylink) | **POST** /group/join/{joinLinkId} | join a group by a join link |
| [**updateGroup**](GroupApi.md#updategroup) | **PUT** /group/{groupId} | Update group info |
| [**uploadGroupAvatar**](GroupApi.md#uploadgroupavatar) | **POST** /group/{groupId}/avatar | Upload a group avatar image. |



## acceptGroupInvite

> GroupDto acceptGroupInvite(inviteId)

Accept a group invite and join the group.

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { AcceptGroupInviteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GroupApi(config);

  const body = {
    // string
    inviteId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies AcceptGroupInviteRequest;

  try {
    const data = await api.acceptGroupInvite(body);
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
| **inviteId** | `string` |  | [Defaults to `undefined`] |

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


## createGroup

> GroupDto createGroup(groupInputDto)

Create a new group. The creator joins immediately; every other user in MembersId receives an invite.

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


## getGroupInvites

> Array&lt;GroupInviteDto&gt; getGroupInvites(groupId)

Pending invites for a group, so members can see who has not answered yet.

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { GetGroupInvitesRequest } from '';

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
  } satisfies GetGroupInvitesRequest;

  try {
    const data = await api.getGroupInvites(body);
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

[**Array&lt;GroupInviteDto&gt;**](GroupInviteDto.md)

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


## getGroupInvoices

> Array&lt;InvoiceReducedDto&gt; getGroupInvoices(groupId)

Get the group invoices

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { GetGroupInvoicesRequest } from '';

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
  } satisfies GetGroupInvoicesRequest;

  try {
    const data = await api.getGroupInvoices(body);
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

[**Array&lt;InvoiceReducedDto&gt;**](InvoiceReducedDto.md)

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


## getMyGroupInvites

> Array&lt;GroupInviteDto&gt; getMyGroupInvites()

Pending invites addressed to the current user.

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { GetMyGroupInvitesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GroupApi(config);

  try {
    const data = await api.getMyGroupInvites();
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

[**Array&lt;GroupInviteDto&gt;**](GroupInviteDto.md)

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


## ignoreGroupInvite

> ignoreGroupInvite(inviteId)

Ignore a group invite. The inviter is not told.

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { IgnoreGroupInviteRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new GroupApi(config);

  const body = {
    // string
    inviteId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies IgnoreGroupInviteRequest;

  try {
    const data = await api.ignoreGroupInvite(body);
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
| **inviteId** | `string` |  | [Defaults to `undefined`] |

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


## inviteGroupMembers

> Array&lt;GroupInviteDto&gt; inviteGroupMembers(groupId, requestBody)

Invite friends to a group. Each invited user gets a request notification and joins only after accepting.  Users who are not friends of the inviter, are already members, or already have a pending invite are skipped.

### Example

```ts
import {
  Configuration,
  GroupApi,
} from '';
import type { InviteGroupMembersRequest } from '';

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
  } satisfies InviteGroupMembersRequest;

  try {
    const data = await api.inviteGroupMembers(body);
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

[**Array&lt;GroupInviteDto&gt;**](GroupInviteDto.md)

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
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |
| **400** | Bad Request |  -  |
| **200** | OK |  -  |
| **429** | Too Many Requests |  * Retry-After - delta-seconds or HTTP-date <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

