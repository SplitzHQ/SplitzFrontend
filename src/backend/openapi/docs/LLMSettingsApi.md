# LLMSettingsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**clearLLMSettings**](LLMSettingsApi.md#clearllmsettings) | **DELETE** /llmsettings | Remove the current user\&#39;s custom provider and its stored key. |
| [**getLLMSettings**](LLMSettingsApi.md#getllmsettings) | **GET** /llmsettings | AI provider availability and the current user\&#39;s custom provider. The API key is never returned. |
| [**updateLLMSettings**](LLMSettingsApi.md#updatellmsettings) | **PUT** /llmsettings | Save the current user\&#39;s custom provider. Leaving &#x60;apiKey&#x60; empty keeps the stored key.  Returns 400 with a reason when the provider is turned on but incomplete. |



## clearLLMSettings

> clearLLMSettings()

Remove the current user\&#39;s custom provider and its stored key.

### Example

```ts
import {
  Configuration,
  LLMSettingsApi,
} from '';
import type { ClearLLMSettingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new LLMSettingsApi(config);

  try {
    const data = await api.clearLLMSettings();
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


## getLLMSettings

> LLMSettingsDto getLLMSettings()

AI provider availability and the current user\&#39;s custom provider. The API key is never returned.

### Example

```ts
import {
  Configuration,
  LLMSettingsApi,
} from '';
import type { GetLLMSettingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new LLMSettingsApi(config);

  try {
    const data = await api.getLLMSettings();
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

[**LLMSettingsDto**](LLMSettingsDto.md)

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


## updateLLMSettings

> LLMSettingsDto updateLLMSettings(lLMSettingsInputDto)

Save the current user\&#39;s custom provider. Leaving &#x60;apiKey&#x60; empty keeps the stored key.  Returns 400 with a reason when the provider is turned on but incomplete.

### Example

```ts
import {
  Configuration,
  LLMSettingsApi,
} from '';
import type { UpdateLLMSettingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new LLMSettingsApi(config);

  const body = {
    // LLMSettingsInputDto (optional)
    lLMSettingsInputDto: ...,
  } satisfies UpdateLLMSettingsRequest;

  try {
    const data = await api.updateLLMSettings(body);
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
| **lLMSettingsInputDto** | [LLMSettingsInputDto](LLMSettingsInputDto.md) |  | [Optional] |

### Return type

[**LLMSettingsDto**](LLMSettingsDto.md)

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

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

