
# InvoiceSettlementDto


## Properties

Name | Type
------------ | -------------
`invoiceSettlementId` | string
`invoiceId` | string
`fromUser` | [SplitzUserReducedDto](SplitzUserReducedDto.md)
`toUser` | [SplitzUserReducedDto](SplitzUserReducedDto.md)
`amount` | string
`recordedBy` | [SplitzUserReducedDto](SplitzUserReducedDto.md)
`recordedTime` | Date

## Example

```typescript
import type { InvoiceSettlementDto } from ''

// TODO: Update the object below with actual values
const example = {
  "invoiceSettlementId": null,
  "invoiceId": null,
  "fromUser": null,
  "toUser": null,
  "amount": null,
  "recordedBy": null,
  "recordedTime": null,
} satisfies InvoiceSettlementDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as InvoiceSettlementDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


