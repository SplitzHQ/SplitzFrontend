# TwoFactorRequest

## Properties

| Name                 | Type    |
| -------------------- | ------- |
| `enable`             | boolean |
| `twoFactorCode`      | string  |
| `resetSharedKey`     | boolean |
| `resetRecoveryCodes` | boolean |
| `forgetMachine`      | boolean |

## Example

```typescript
import type { TwoFactorRequest } from "";

// TODO: Update the object below with actual values
const example = {
  enable: null,
  twoFactorCode: null,
  resetSharedKey: null,
  resetRecoveryCodes: null,
  forgetMachine: null
} satisfies TwoFactorRequest;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TwoFactorRequest;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
