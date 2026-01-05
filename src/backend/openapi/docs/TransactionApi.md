# TransactionApi

All URIs are relative to _http://localhost_

| Method                                                       | HTTP request                         | Description           |
| ------------------------------------------------------------ | ------------------------------------ | --------------------- |
| [**addTransaction**](TransactionApi.md#addtransaction)       | **POST** /transaction                | Add a transaction     |
| [**deleteTransaction**](TransactionApi.md#deletetransaction) | **DELETE** /transaction/{id}         | Delete a transaction  |
| [**getTransaction**](TransactionApi.md#gettransaction)       | **GET** /transaction/{id}            | Get transaction by id |
| [**updateTransaction**](TransactionApi.md#updatetransaction) | **PUT** /transaction/{transactionId} | Update a transaction  |

## addTransaction

> TransactionDto addTransaction(transactionInputDto)

Add a transaction

### Example

```ts
import {
  Configuration,
  TransactionApi,
} from '';
import type { AddTransactionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: Bearer
    apiKey: "YOUR API KEY",
  });
  const api = new TransactionApi(config);

  const body = {
    // TransactionInputDto |  (optional)
    transactionInputDto: ...,
  } satisfies AddTransactionRequest;

  try {
    const data = await api.addTransaction(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                    | Type                                          | Description | Notes      |
| ----------------------- | --------------------------------------------- | ----------- | ---------- |
| **transactionInputDto** | [TransactionInputDto](TransactionInputDto.md) |             | [Optional] |

### Return type

[**TransactionDto**](TransactionDto.md)

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

## deleteTransaction

> deleteTransaction(id)

Delete a transaction

### Example

```ts
import {
  Configuration,
  TransactionApi,
} from '';
import type { DeleteTransactionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: Bearer
    apiKey: "YOUR API KEY",
  });
  const api = new TransactionApi(config);

  const body = {
    // string |
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DeleteTransactionRequest;

  try {
    const data = await api.deleteTransaction(body);
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

## getTransaction

> TransactionDto getTransaction(id)

Get transaction by id

### Example

```ts
import {
  Configuration,
  TransactionApi,
} from '';
import type { GetTransactionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: Bearer
    apiKey: "YOUR API KEY",
  });
  const api = new TransactionApi(config);

  const body = {
    // string |
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetTransactionRequest;

  try {
    const data = await api.getTransaction(body);
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

[**TransactionDto**](TransactionDto.md)

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

## updateTransaction

> updateTransaction(transactionId, transactionInputDto)

Update a transaction

### Example

```ts
import {
  Configuration,
  TransactionApi,
} from '';
import type { UpdateTransactionRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: Bearer
    apiKey: "YOUR API KEY",
  });
  const api = new TransactionApi(config);

  const body = {
    // string |
    transactionId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // TransactionInputDto |  (optional)
    transactionInputDto: ...,
  } satisfies UpdateTransactionRequest;

  try {
    const data = await api.updateTransaction(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name                    | Type                                          | Description | Notes                     |
| ----------------------- | --------------------------------------------- | ----------- | ------------------------- |
| **transactionId**       | `string`                                      |             | [Defaults to `undefined`] |
| **transactionInputDto** | [TransactionInputDto](TransactionInputDto.md) |             | [Optional]                |

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
