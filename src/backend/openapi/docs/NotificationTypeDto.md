
# NotificationTypeDto

Describes one notification type so the client can render a settings list.

## Properties

Name | Type
------------ | -------------
`type` | string
`category` | [NotificationCategory](NotificationCategory.md)
`priority` | [NotificationPriority](NotificationPriority.md)
`configurable` | boolean

## Example

```typescript
import type { NotificationTypeDto } from ''

// TODO: Update the object below with actual values
const example = {
  "type": null,
  "category": null,
  "priority": null,
  "configurable": null,
} satisfies NotificationTypeDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NotificationTypeDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


