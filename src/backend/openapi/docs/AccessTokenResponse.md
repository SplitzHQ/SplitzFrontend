# AccessTokenResponse

## Properties

| Name           | Type   |
| -------------- | ------ |
| `tokenType`    | string |
| `accessToken`  | string |
| `expiresIn`    | number |
| `refreshToken` | string |

## Example

```typescript
import type { AccessTokenResponse } from "";

// TODO: Update the object below with actual values
const example = {
  tokenType: null,
  accessToken: null,
  expiresIn: null,
  refreshToken: null
} satisfies AccessTokenResponse;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AccessTokenResponse;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
