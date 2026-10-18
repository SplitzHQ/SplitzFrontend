# ReceiptApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getReceipt**](ReceiptApi.md#getreceipt) | **GET** /receipt/{id} | Get user receipt by ID. |
| [**getReceiptRecognitionCapabilities**](ReceiptApi.md#getreceiptrecognitioncapabilities) | **GET** /receipt/capabilities | Get receipt recognition availability and image limits for the current user. |
| [**recognizeReceipt**](ReceiptApi.md#recognizereceipt) | **POST** /receipt | Recognize an expense from one or more photos of the same receipt.  The images and the model reply are kept; the parsed fields are returned for the client to prefill.  A model failure is reported in the body with status &#x60;Failed&#x60;, not as an HTTP error. |



## getReceipt

> ReceiptDto getReceipt(id)

Get user receipt by ID.

### Example

```ts
import {
  Configuration,
  ReceiptApi,
} from '';
import type { GetReceiptRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ReceiptApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetReceiptRequest;

  try {
    const data = await api.getReceipt(body);
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

[**ReceiptDto**](ReceiptDto.md)

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


## getReceiptRecognitionCapabilities

> ReceiptRecognitionCapabilitiesDto getReceiptRecognitionCapabilities()

Get receipt recognition availability and image limits for the current user.

### Example

```ts
import {
  Configuration,
  ReceiptApi,
} from '';
import type { GetReceiptRecognitionCapabilitiesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ReceiptApi(config);

  try {
    const data = await api.getReceiptRecognitionCapabilities();
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

[**ReceiptRecognitionCapabilitiesDto**](ReceiptRecognitionCapabilitiesDto.md)

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

> ReceiptDto recognizeReceipt(files, categories)

Recognize an expense from one or more photos of the same receipt.  The images and the model reply are kept; the parsed fields are returned for the client to prefill.  A model failure is reported in the body with status &#x60;Failed&#x60;, not as an HTTP error.

### Example

```ts
import {
  Configuration,
  ReceiptApi,
} from '';
import type { RecognizeReceiptRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ReceiptApi(config);

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

[**ReceiptDto**](ReceiptDto.md)

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

