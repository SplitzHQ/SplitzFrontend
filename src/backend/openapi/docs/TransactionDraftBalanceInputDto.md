# TransactionDraftBalanceInputDto

## Properties

| Name                 | Type   |
| -------------------- | ------ |
| `transactionDraftId` | string |
| `userId`             | string |
| `balance`            | string |

## Example

```typescript
import type { TransactionDraftBalanceInputDto } from "";

// TODO: Update the object below with actual values
const example = {
  transactionDraftId: null,
  userId: null,
  balance: null
} satisfies TransactionDraftBalanceInputDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TransactionDraftBalanceInputDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
