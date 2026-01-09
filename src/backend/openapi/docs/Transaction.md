# Transaction

## Properties

| Name              | Type                                                     |
| ----------------- | -------------------------------------------------------- |
| `transactionId`   | string                                                   |
| `groupId`         | string                                                   |
| `name`            | string                                                   |
| `icon`            | string                                                   |
| `createTime`      | Date                                                     |
| `transactionTime` | Date                                                     |
| `amount`          | string                                                   |
| `currency`        | string                                                   |
| `tags`            | [Array&lt;Tag&gt;](Tag.md)                               |
| `geoCoordinate`   | string                                                   |
| `photo`           | string                                                   |
| `group`           | [Group](Group.md)                                        |
| `balances`        | [Array&lt;TransactionBalance&gt;](TransactionBalance.md) |

## Example

```typescript
import type { Transaction } from "";

// TODO: Update the object below with actual values
const example = {
  transactionId: null,
  groupId: null,
  name: null,
  icon: null,
  createTime: null,
  transactionTime: null,
  amount: null,
  currency: null,
  tags: null,
  geoCoordinate: null,
  photo: null,
  group: null,
  balances: null
} satisfies Transaction;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Transaction;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
