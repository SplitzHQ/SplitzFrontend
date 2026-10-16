# ReceiptRecognitionApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**clearReceiptRecognitionSettings**](ReceiptRecognitionApi.md#clearreceiptrecognitionsettings) | **DELETE** /receiptrecognition/settings | Remove the current user\&#39;s custom provider and its stored key. |
| [**getReceiptRecognition**](ReceiptRecognitionApi.md#getreceiptrecognition) | **GET** /receiptrecognition/{id} | Get one of the current user\&#39;s recognitions. |
| [**getReceiptRecognitionSettings**](ReceiptRecognitionApi.md#getreceiptrecognitionsettings) | **GET** /receiptrecognition/settings | Recognition availability and the current user\&#39;s custom provider. The API key is never returned. |
| [**recognizeReceipt**](ReceiptRecognitionApi.md#recognizereceipt) | **POST** /receiptrecognition | Recognize an expense from one or more photos of the same receipt.  The images and the model reply are kept; the parsed fields are returned for the client to prefill.  A model failure is reported in the body with status &#x60;Failed&#x60;, not as an HTTP error. |
| [**updateReceiptRecognitionSettings**](ReceiptRecognitionApi.md#updatereceiptrecognitionsettings) | **PUT** /receiptrecognition/settings | Save the current user\&#39;s custom provider. Leaving &#x60;apiKey&#x60; empty keeps the stored key.  Returns 400 with a reason when the provider is turned on but incomplete. |



## clearReceiptRecognitionSettings

> clearReceiptRecognitionSettings()

Remove the current user\&#39;s custom provider and its stored key.

### Example

```ts
import {
  Configuration,
  ReceiptRecognitionApi,
} from '';
import type { ClearReceiptRecognitionSettingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ReceiptRecognitionApi(config);

  try {
    const data = await api.clearReceiptRecognitionSettings();
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


## getReceiptRecognition

> ReceiptRecognitionDto getReceiptRecognition(id)

Get one of the current user\&#39;s recognitions.

### Example

```ts
import {
  Configuration,
  ReceiptRecognitionApi,
} from '';
import type { GetReceiptRecognitionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ReceiptRecognitionApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetReceiptRecognitionRequest;

  try {
    const data = await api.getReceiptRecognition(body);
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

[**ReceiptRecognitionDto**](ReceiptRecognitionDto.md)

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


## getReceiptRecognitionSettings

> ReceiptRecognitionSettingsDto getReceiptRecognitionSettings()

Recognition availability and the current user\&#39;s custom provider. The API key is never returned.

### Example

```ts
import {
  Configuration,
  ReceiptRecognitionApi,
} from '';
import type { GetReceiptRecognitionSettingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ReceiptRecognitionApi(config);

  try {
    const data = await api.getReceiptRecognitionSettings();
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

[**ReceiptRecognitionSettingsDto**](ReceiptRecognitionSettingsDto.md)

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


## recognizeReceipt

> ReceiptRecognitionDto recognizeReceipt(files, categories)

Recognize an expense from one or more photos of the same receipt.  The images and the model reply are kept; the parsed fields are returned for the client to prefill.  A model failure is reported in the body with status &#x60;Failed&#x60;, not as an HTTP error.

### Example

```ts
import {
  Configuration,
  ReceiptRecognitionApi,
} from '';
import type { RecognizeReceiptRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ReceiptRecognitionApi(config);

  const body = {
    // Array<Blob> | One or more photos of the same receipt.
    files: [new Blob(['example file content'], { type: 'application/octet-stream' })],
    // Array<string> | Category keys the client understands. When given, the model is asked to pick one of them and  any other answer is dropped. (optional)
    categories: ...,
  } satisfies RecognizeReceiptRequest;

  try {
    const data = await api.recognizeReceipt(body);
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
| **files** | `Array<Blob>` | One or more photos of the same receipt. | |
| **categories** | `Array<string>` | Category keys the client understands. When given, the model is asked to pick one of them and  any other answer is dropped. | [Optional] |

### Return type

[**ReceiptRecognitionDto**](ReceiptRecognitionDto.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **400** | Bad Request |  -  |
| **401** | Unauthorized |  -  |
| **429** | Too Many Requests |  * Retry-After - delta-seconds or HTTP-date <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## updateReceiptRecognitionSettings

> ReceiptRecognitionSettingsDto updateReceiptRecognitionSettings(receiptRecognitionSettingsInputDto)

Save the current user\&#39;s custom provider. Leaving &#x60;apiKey&#x60; empty keeps the stored key.  Returns 400 with a reason when the provider is turned on but incomplete.

### Example

```ts
import {
  Configuration,
  ReceiptRecognitionApi,
} from '';
import type { UpdateReceiptRecognitionSettingsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ReceiptRecognitionApi(config);

  const body = {
    // ReceiptRecognitionSettingsInputDto (optional)
    receiptRecognitionSettingsInputDto: ...,
  } satisfies UpdateReceiptRecognitionSettingsRequest;

  try {
    const data = await api.updateReceiptRecognitionSettings(body);
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
| **receiptRecognitionSettingsInputDto** | [ReceiptRecognitionSettingsInputDto](ReceiptRecognitionSettingsInputDto.md) |  | [Optional] |

### Return type

[**ReceiptRecognitionSettingsDto**](ReceiptRecognitionSettingsDto.md)

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

