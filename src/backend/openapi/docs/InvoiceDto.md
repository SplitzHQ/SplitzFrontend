
# InvoiceDto


## Properties

Name | Type
------------ | -------------
`invoiceId` | string
`groupId` | string
`name` | string
`currency` | string
`createdBy` | [SplitzUserReducedDto](SplitzUserReducedDto.md)
`createTime` | Date
`status` | [InvoiceStatus](InvoiceStatus.md)
`transactions` | [Array&lt;TransactionDto&gt;](TransactionDto.md)
`debts` | [Array&lt;InvoiceDebtDto&gt;](InvoiceDebtDto.md)
`settlements` | [Array&lt;InvoiceSettlementDto&gt;](InvoiceSettlementDto.md)

## Example

```typescript
import type { InvoiceDto } from ''

// TODO: Update the object below with actual values
const example = {
  "invoiceId": null,
  "groupId": null,
  "name": null,
  "currency": null,
  "createdBy": null,
  "createTime": null,
  "status": null,
  "transactions": null,
  "debts": null,
  "settlements": null,
} satisfies InvoiceDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as InvoiceDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


