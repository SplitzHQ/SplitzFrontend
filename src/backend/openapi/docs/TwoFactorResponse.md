# TwoFactorResponse

## Properties

| Name                  | Type                |
| --------------------- | ------------------- |
| `sharedKey`           | string              |
| `recoveryCodesLeft`   | number              |
| `recoveryCodes`       | Array&lt;string&gt; |
| `isTwoFactorEnabled`  | boolean             |
| `isMachineRemembered` | boolean             |

## Example

```typescript
import type { TwoFactorResponse } from "";

// TODO: Update the object below with actual values
const example = {
  sharedKey: null,
  recoveryCodesLeft: null,
  recoveryCodes: null,
  isTwoFactorEnabled: null,
  isMachineRemembered: null
} satisfies TwoFactorResponse;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TwoFactorResponse;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
