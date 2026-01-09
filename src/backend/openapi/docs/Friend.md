# Friend

## Properties

| Name           | Type                        |
| -------------- | --------------------------- |
| `userId`       | string                      |
| `user`         | [SplitzUser](SplitzUser.md) |
| `friendUserId` | string                      |
| `friendUser`   | [SplitzUser](SplitzUser.md) |
| `remark`       | string                      |

## Example

```typescript
import type { Friend } from "";

// TODO: Update the object below with actual values
const example = {
  userId: null,
  user: null,
  friendUserId: null,
  friendUser: null,
  remark: null
} satisfies Friend;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Friend;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
