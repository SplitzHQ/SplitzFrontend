
# GroupBalanceSummaryDto

The current user\'s net balance and suggested payments for one currency.

## Properties

Name | Type
------------ | -------------
`currency` | string
`totalBalance` | string
`memberBalances` | [Array&lt;GroupMemberTransferDto&gt;](GroupMemberTransferDto.md)

## Example

```typescript
import type { GroupBalanceSummaryDto } from ''

// TODO: Update the object below with actual values
const example = {
  "currency": null,
  "totalBalance": null,
  "memberBalances": null,
} satisfies GroupBalanceSummaryDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GroupBalanceSummaryDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


