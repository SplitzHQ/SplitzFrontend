# Group

## Properties

| Name               | Type                                         |
| ------------------ | -------------------------------------------- |
| `groupId`          | string                                       |
| `name`             | string                                       |
| `photo`            | string                                       |
| `members`          | [Array&lt;SplitzUser&gt;](SplitzUser.md)     |
| `membersIdHash`    | string                                       |
| `transactions`     | [Array&lt;Transaction&gt;](Transaction.md)   |
| `balances`         | [Array&lt;GroupBalance&gt;](GroupBalance.md) |
| `transactionCount` | number                                       |
| `lastActivityTime` | Date                                         |

## Example

```typescript
import type { Group } from "";

// TODO: Update the object below with actual values
const example = {
  groupId: null,
  name: null,
  photo: null,
  members: null,
  membersIdHash: null,
  transactions: null,
  balances: null,
  transactionCount: null,
  lastActivityTime: null
} satisfies Group;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Group;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
