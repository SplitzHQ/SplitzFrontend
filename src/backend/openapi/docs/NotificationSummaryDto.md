
# NotificationSummaryDto

Unread counts per category, for badges.

## Properties

Name | Type
------------ | -------------
`unreadRequests` | number
`unreadActivity` | number
`pendingRequests` | number

## Example

```typescript
import type { NotificationSummaryDto } from ''

// TODO: Update the object below with actual values
const example = {
  "unreadRequests": null,
  "unreadActivity": null,
  "pendingRequests": null,
} satisfies NotificationSummaryDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NotificationSummaryDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


