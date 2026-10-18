
# ReceiptDto

Receipt details returned after recognition or when fetching a stored receipt.

## Properties

Name | Type
------------ | -------------
`receiptId` | string
`createTime` | Date
`images` | Array&lt;string&gt;
`model` | string
`usedCustomProvider` | boolean
`status` | [ReceiptRecognitionStatus](ReceiptRecognitionStatus.md)
`rawResponse` | string
`error` | string
`name` | string
`merchant` | string
`amount` | string
`currency` | string
`transactionTime` | Date
`category` | string
`location` | string
`notes` | string
`transactionId` | string

## Example

```typescript
import type { ReceiptDto } from ''

// TODO: Update the object below with actual values
const example = {
  "receiptId": null,
  "createTime": null,
  "images": null,
  "model": null,
  "usedCustomProvider": null,
  "status": null,
  "rawResponse": null,
  "error": null,
  "name": null,
  "merchant": null,
  "amount": null,
  "currency": null,
  "transactionTime": null,
  "category": null,
  "location": null,
  "notes": null,
  "transactionId": null,
} satisfies ReceiptDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReceiptDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


