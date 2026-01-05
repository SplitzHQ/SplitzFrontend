# TransactionDraftBalanceDto

## Properties

| Name                 | Type                                            |
| -------------------- | ----------------------------------------------- |
| `transactionDraftId` | string                                          |
| `userId`             | string                                          |
| `balance`            | string                                          |
| `user`               | [SplitzUserReducedDto](SplitzUserReducedDto.md) |

## Example

```typescript
import type { TransactionDraftBalanceDto } from "";

// TODO: Update the object below with actual values
const example = {
  transactionDraftId: null,
  userId: null,
  balance: null,
  user: null
} satisfies TransactionDraftBalanceDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TransactionDraftBalanceDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
