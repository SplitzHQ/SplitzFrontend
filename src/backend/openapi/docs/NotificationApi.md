# NotificationApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**dismissAllNotifications**](NotificationApi.md#dismissallnotifications) | **POST** /notification/dismiss-all | Dismiss all activity notifications for the current user. Requests stay until they are accepted or ignored. |
| [**dismissNotification**](NotificationApi.md#dismissnotification) | **PATCH** /notification/{id}/dismiss | Dismiss a notification |
| [**getNotificationPreferences**](NotificationApi.md#getnotificationpreferences) | **GET** /notification/preferences | The current user\&#39;s notification preferences. Only explicit settings are returned;  a type without a row is enabled. |
| [**getNotificationSummary**](NotificationApi.md#getnotificationsummary) | **GET** /notification/summary | Unread and pending counts, for badges on the bell and the avatar. |
| [**getNotificationTypes**](NotificationApi.md#getnotificationtypes) | **GET** /notification/types | All notification types with their category, priority and whether they can be turned off. |
| [**getNotifications**](NotificationApi.md#getnotifications) | **GET** /notification | List notifications for the current user, newest first. Returns undismissed notifications by default. |
| [**markAllNotificationsRead**](NotificationApi.md#markallnotificationsread) | **POST** /notification/read-all | Mark every undismissed notification as read, optionally only within one category. |
| [**markNotificationRead**](NotificationApi.md#marknotificationread) | **PATCH** /notification/{id}/read | Mark a notification as read |
| [**resetGroupNotificationPreferences**](NotificationApi.md#resetgroupnotificationpreferences) | **DELETE** /notification/preferences/group/{groupId} | Remove every override for one group so it follows the global settings again. |
| [**resetNotificationPreference**](NotificationApi.md#resetnotificationpreference) | **DELETE** /notification/preferences | Remove a preference so the type falls back to its default (or to the global setting for a group override). |
| [**setNotificationPreference**](NotificationApi.md#setnotificationpreference) | **PUT** /notification/preferences | Create or update one preference. Pass a group ID to override the global setting for that group. |



## dismissAllNotifications

> dismissAllNotifications()

Dismiss all activity notifications for the current user. Requests stay until they are accepted or ignored.

### Example

```ts
import {
  Configuration,
  NotificationApi,
} from '';
import type { DismissAllNotificationsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationApi(config);

  try {
    const data = await api.dismissAllNotifications();
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

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## dismissNotification

> dismissNotification(id)

Dismiss a notification

### Example

```ts
import {
  Configuration,
  NotificationApi,
} from '';
import type { DismissNotificationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DismissNotificationRequest;

  try {
    const data = await api.dismissNotification(body);
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
| **id** | `string` |  | [Defaults to `undefined`] |

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


## getNotificationPreferences

> Array&lt;NotificationPreferenceDto&gt; getNotificationPreferences(groupId)

The current user\&#39;s notification preferences. Only explicit settings are returned;  a type without a row is enabled.

### Example

```ts
import {
  Configuration,
  NotificationApi,
} from '';
import type { GetNotificationPreferencesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationApi(config);

  const body = {
    // string | When set, returns only the overrides for that group. (optional)
    groupId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetNotificationPreferencesRequest;

  try {
    const data = await api.getNotificationPreferences(body);
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
| **groupId** | `string` | When set, returns only the overrides for that group. | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;NotificationPreferenceDto&gt;**](NotificationPreferenceDto.md)

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


## getNotificationSummary

> NotificationSummaryDto getNotificationSummary()

Unread and pending counts, for badges on the bell and the avatar.

### Example

```ts
import {
  Configuration,
  NotificationApi,
} from '';
import type { GetNotificationSummaryRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationApi(config);

  try {
    const data = await api.getNotificationSummary();
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

[**NotificationSummaryDto**](NotificationSummaryDto.md)

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


## getNotificationTypes

> Array&lt;NotificationTypeDto&gt; getNotificationTypes()

All notification types with their category, priority and whether they can be turned off.

### Example

```ts
import {
  Configuration,
  NotificationApi,
} from '';
import type { GetNotificationTypesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationApi(config);

  try {
    const data = await api.getNotificationTypes();
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

[**Array&lt;NotificationTypeDto&gt;**](NotificationTypeDto.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getNotifications

> Array&lt;NotificationDto&gt; getNotifications(category, includeDismissed, limit)

List notifications for the current user, newest first. Returns undismissed notifications by default.

### Example

```ts
import {
  Configuration,
  NotificationApi,
} from '';
import type { GetNotificationsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationApi(config);

  const body = {
    // NotificationCategory | Only return notifications in this category. (optional)
    category: ...,
    // boolean | If true, includes dismissed notifications. (optional)
    includeDismissed: true,
    // number | Maximum number of notifications to return (1-200). (optional)
    limit: 56,
  } satisfies GetNotificationsRequest;

  try {
    const data = await api.getNotifications(body);
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
| **category** | `NotificationCategory` | Only return notifications in this category. | [Optional] [Defaults to `undefined`] [Enum: Request, Activity] |
| **includeDismissed** | `boolean` | If true, includes dismissed notifications. | [Optional] [Defaults to `false`] |
| **limit** | `number` | Maximum number of notifications to return (1-200). | [Optional] [Defaults to `100`] |

### Return type

[**Array&lt;NotificationDto&gt;**](NotificationDto.md)

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


## markAllNotificationsRead

> markAllNotificationsRead(category)

Mark every undismissed notification as read, optionally only within one category.

### Example

```ts
import {
  Configuration,
  NotificationApi,
} from '';
import type { MarkAllNotificationsReadRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationApi(config);

  const body = {
    // NotificationCategory | Where a notification is surfaced in the client.  Requests need a user decision (accept / ignore) and are shown on the avatar.  Activity is informational and is shown behind the bell button. (optional)
    category: ...,
  } satisfies MarkAllNotificationsReadRequest;

  try {
    const data = await api.markAllNotificationsRead(body);
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
| **category** | `NotificationCategory` | Where a notification is surfaced in the client.  Requests need a user decision (accept / ignore) and are shown on the avatar.  Activity is informational and is shown behind the bell button. | [Optional] [Defaults to `undefined`] [Enum: Request, Activity] |

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

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## markNotificationRead

> markNotificationRead(id)

Mark a notification as read

### Example

```ts
import {
  Configuration,
  NotificationApi,
} from '';
import type { MarkNotificationReadRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies MarkNotificationReadRequest;

  try {
    const data = await api.markNotificationRead(body);
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
| **id** | `string` |  | [Defaults to `undefined`] |

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


## resetGroupNotificationPreferences

> resetGroupNotificationPreferences(groupId)

Remove every override for one group so it follows the global settings again.

### Example

```ts
import {
  Configuration,
  NotificationApi,
} from '';
import type { ResetGroupNotificationPreferencesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationApi(config);

  const body = {
    // string
    groupId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies ResetGroupNotificationPreferencesRequest;

  try {
    const data = await api.resetGroupNotificationPreferences(body);
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

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## resetNotificationPreference

> resetNotificationPreference(type, groupId)

Remove a preference so the type falls back to its default (or to the global setting for a group override).

### Example

```ts
import {
  Configuration,
  NotificationApi,
} from '';
import type { ResetNotificationPreferenceRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationApi(config);

  const body = {
    // string | Notification type. (optional)
    type: type_example,
    // string | Group override to remove, or null for the global setting. (optional)
    groupId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies ResetNotificationPreferenceRequest;

  try {
    const data = await api.resetNotificationPreference(body);
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
| **type** | `string` | Notification type. | [Optional] [Defaults to `undefined`] |
| **groupId** | `string` | Group override to remove, or null for the global setting. | [Optional] [Defaults to `undefined`] |

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

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setNotificationPreference

> NotificationPreferenceDto setNotificationPreference(notificationPreferenceInputDto)

Create or update one preference. Pass a group ID to override the global setting for that group.

### Example

```ts
import {
  Configuration,
  NotificationApi,
} from '';
import type { SetNotificationPreferenceRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationApi(config);

  const body = {
    // NotificationPreferenceInputDto (optional)
    notificationPreferenceInputDto: ...,
  } satisfies SetNotificationPreferenceRequest;

  try {
    const data = await api.setNotificationPreference(body);
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
| **notificationPreferenceInputDto** | [NotificationPreferenceInputDto](NotificationPreferenceInputDto.md) |  | [Optional] |

### Return type

[**NotificationPreferenceDto**](NotificationPreferenceDto.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`, `text/json`, `application/*+json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **400** | Bad Request |  -  |
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

