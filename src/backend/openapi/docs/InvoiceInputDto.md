
# InvoiceInputDto


## Properties

Name | Type
------------ | -------------
`groupId` | string
`name` | string
`currency` | string
`transactionIds` | Array&lt;string&gt;

## Example

```typescript
import type { InvoiceInputDto } from ''

// TODO: Update the object below with actual values
const example = {
  "groupId": null,
  "name": null,
  "currency": null,
  "transactionIds": null,
} satisfies InvoiceInputDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as InvoiceInputDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


