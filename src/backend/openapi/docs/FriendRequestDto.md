
# FriendRequestDto


## Properties

Name | Type
------------ | -------------
`friendRequestId` | string
`fromUser` | [SplitzUserReducedDto](SplitzUserReducedDto.md)
`toUser` | [SplitzUserReducedDto](SplitzUserReducedDto.md)
`remark` | string
`status` | [RequestStatus](RequestStatus.md)
`createTime` | Date

## Example

```typescript
import type { FriendRequestDto } from ''

// TODO: Update the object below with actual values
const example = {
  "friendRequestId": null,
  "fromUser": null,
  "toUser": null,
  "remark": null,
  "status": null,
  "createTime": null,
} satisfies FriendRequestDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as FriendRequestDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


