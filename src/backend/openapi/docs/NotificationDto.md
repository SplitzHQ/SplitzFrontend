
# NotificationDto


## Properties

Name | Type
------------ | -------------
`notificationId` | string
`type` | string
`referenceId` | string
`data` | any
`isRead` | boolean
`isDismissed` | boolean
`createTime` | Date

## Example

```typescript
import type { NotificationDto } from ''

// TODO: Update the object below with actual values
const example = {
  "notificationId": null,
  "type": null,
  "referenceId": null,
  "data": null,
  "isRead": null,
  "isDismissed": null,
  "createTime": null,
} satisfies NotificationDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NotificationDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


