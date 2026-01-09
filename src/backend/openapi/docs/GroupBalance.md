# GroupBalance

## Properties

| Name       | Type                        |
| ---------- | --------------------------- |
| `groupId`  | string                      |
| `group`    | [Group](Group.md)           |
| `userId`   | string                      |
| `user`     | [SplitzUser](SplitzUser.md) |
| `balance`  | string                      |
| `currency` | string                      |

## Example

```typescript
import type { GroupBalance } from "";

// TODO: Update the object below with actual values
const example = {
  groupId: null,
  group: null,
  userId: null,
  user: null,
  balance: null,
  currency: null
} satisfies GroupBalance;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GroupBalance;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
