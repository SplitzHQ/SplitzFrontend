# SplitzUserDto

## Properties

| Name       | Type                                               |
| ---------- | -------------------------------------------------- |
| `id`       | string                                             |
| `userName` | string                                             |
| `email`    | string                                             |
| `photo`    | string                                             |
| `friends`  | [Array&lt;FriendDto&gt;](FriendDto.md)             |
| `groups`   | [Array&lt;GroupReducedDto&gt;](GroupReducedDto.md) |
| `balances` | [Array&lt;GroupBalanceDto&gt;](GroupBalanceDto.md) |

## Example

```typescript
import type { SplitzUserDto } from "";

// TODO: Update the object below with actual values
const example = {
  id: null,
  userName: null,
  email: null,
  photo: null,
  friends: null,
  groups: null,
  balances: null
} satisfies SplitzUserDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SplitzUserDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
