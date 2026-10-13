
# GroupInviteDto


## Properties

Name | Type
------------ | -------------
`groupInviteId` | string
`group` | [GroupReducedDto](GroupReducedDto.md)
`invitedUser` | [SplitzUserReducedDto](SplitzUserReducedDto.md)
`invitedByUser` | [SplitzUserReducedDto](SplitzUserReducedDto.md)
`status` | [RequestStatus](RequestStatus.md)
`createTime` | Date

## Example

```typescript
import type { GroupInviteDto } from ''

// TODO: Update the object below with actual values
const example = {
  "groupInviteId": null,
  "group": null,
  "invitedUser": null,
  "invitedByUser": null,
  "status": null,
  "createTime": null,
} satisfies GroupInviteDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GroupInviteDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


