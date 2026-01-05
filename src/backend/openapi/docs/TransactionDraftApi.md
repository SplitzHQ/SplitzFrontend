# TransactionDraftApi

All URIs are relative to _http://localhost_

| Method                                                                      | HTTP request                              | Description           |
| --------------------------------------------------------------------------- | ----------------------------------------- | --------------------- |
| [**addTransactionDraft**](TransactionDraftApi.md#addtransactiondraft)       | **POST** /transactiondraft                | Add a transaction     |
| [**deleteTransactionDraft**](TransactionDraftApi.md#deletetransactiondraft) | **DELETE** /transactiondraft/{id}         | Delete a transaction  |
| [**getTransactionDraft**](TransactionDraftApi.md#gettransactiondraft)       | **GET** /transactiondraft/{id}            | Get transaction by id |
| [**updateTransactionDraft**](TransactionDraftApi.md#updatetransactiondraft) | **PUT** /transactiondraft/{transactionId} | Update a transaction  |

## addTransactionDraft

> TransactionDraftDto addTransactionDraft(transactionDraftInputDto)

Add a transaction

### Example

```ts
import {
  Configuration,
  TransactionDraftApi,
} from '';
import type { AddTransactionDraftRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: Bearer
    apiKey: "YOUR API KEY",
  });
  const api = new TransactionDraftApi(config);

  const body = {
    // TransactionDraftInputDto |  (optional)
    transactionDraftInputDto: ...,
  } satisfies AddTransactionDraftRequest;

  try {
    const data = await api.addTransactionDraft(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                         | Type                                                    | Description | Notes      |
| ---------------------------- | ------------------------------------------------------- | ----------- | ---------- |
| **transactionDraftInputDto** | [TransactionDraftInputDto](TransactionDraftInputDto.md) |             | [Optional] |

### Return type

[**TransactionDraftDto**](TransactionDraftDto.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`, `text/json`, `application/*+json`
- **Accept**: `application/json`

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **400**     | Bad Request  | -                |
| **401**     | Unauthorized | -                |
| **201**     | Created      | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## deleteTransactionDraft

> deleteTransactionDraft(id)

Delete a transaction

### Example

```ts
import {
  Configuration,
  TransactionDraftApi,
} from '';
import type { DeleteTransactionDraftRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: Bearer
    apiKey: "YOUR API KEY",
  });
  const api = new TransactionDraftApi(config);

  const body = {
    // string |
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DeleteTransactionDraftRequest;

  try {
    const data = await api.deleteTransactionDraft(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name   | Type     | Description | Notes                     |
| ------ | -------- | ----------- | ------------------------- |
| **id** | `string` |             | [Defaults to `undefined`] |

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
| **400**     | Bad Request  | -                |
| **401**     | Unauthorized | -                |
| **404**     | Not Found    | -                |
| **204**     | No Content   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getTransactionDraft

> TransactionDraftDto getTransactionDraft(id)

Get transaction by id

### Example

```ts
import {
  Configuration,
  TransactionDraftApi,
} from '';
import type { GetTransactionDraftRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: Bearer
    apiKey: "YOUR API KEY",
  });
  const api = new TransactionDraftApi(config);

  const body = {
    // string |
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetTransactionDraftRequest;

  try {
    const data = await api.getTransactionDraft(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name   | Type     | Description | Notes                     |
| ------ | -------- | ----------- | ------------------------- |
| **id** | `string` |             | [Defaults to `undefined`] |

### Return type

[**TransactionDraftDto**](TransactionDraftDto.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description  | Response headers |
| ----------- | ------------ | ---------------- |
| **401**     | Unauthorized | -                |
| **404**     | Not Found    | -                |
| **200**     | OK           | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## updateTransactionDraft

> updateTransactionDraft(transactionId, transactionDraftId, transactionDraftInputDto)

Update a transaction

### Example

```ts
import {
  Configuration,
  TransactionDraftApi,
} from '';
import type { UpdateTransactionDraftRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: Bearer
    apiKey: "YOUR API KEY",
  });
  const api = new TransactionDraftApi(config);

  const body = {
    // string
    transactionId: transactionId_example,
    // string |  (optional)
    transactionDraftId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // TransactionDraftInputDto |  (optional)
    transactionDraftInputDto: ...,
  } satisfies UpdateTransactionDraftRequest;

  try {
    const data = await api.updateTransactionDraft(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                         | Type                                                    | Description | Notes                                |
| ---------------------------- | ------------------------------------------------------- | ----------- | ------------------------------------ |
| **transactionId**            | `string`                                                |             | [Defaults to `undefined`]            |
| **transactionDraftId**       | `string`                                                |             | [Optional] [Defaults to `undefined`] |
| **transactionDraftInputDto** | [TransactionDraftInputDto](TransactionDraftInputDto.md) |             | [Optional]                           |

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
| **400**     | Bad Request  | -                |
| **401**     | Unauthorized | -                |
| **404**     | Not Found    | -                |
| **204**     | No Content   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
