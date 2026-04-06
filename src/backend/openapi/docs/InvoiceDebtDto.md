
# InvoiceDebtDto


## Properties

Name | Type
------------ | -------------
`invoiceId` | string
`fromUser` | [SplitzUserReducedDto](SplitzUserReducedDto.md)
`toUser` | [SplitzUserReducedDto](SplitzUserReducedDto.md)
`amount` | string

## Example

```typescript
import type { InvoiceDebtDto } from ''

// TODO: Update the object below with actual values
const example = {
  "invoiceId": null,
  "fromUser": null,
  "toUser": null,
  "amount": null,
} satisfies InvoiceDebtDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as InvoiceDebtDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


