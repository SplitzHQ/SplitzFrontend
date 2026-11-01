
# GroupMemberTransferDto

A suggested payment involving the current user and another group member.

## Properties

Name | Type
------------ | -------------
`userId` | string
`name` | string
`amount` | string
`currency` | string

## Example

```typescript
import type { GroupMemberTransferDto } from ''

// TODO: Update the object below with actual values
const example = {
  "userId": null,
  "name": null,
  "amount": null,
  "currency": null,
} satisfies GroupMemberTransferDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GroupMemberTransferDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


