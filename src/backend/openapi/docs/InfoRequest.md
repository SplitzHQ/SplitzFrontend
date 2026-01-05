# InfoRequest

## Properties

| Name          | Type   |
| ------------- | ------ |
| `newEmail`    | string |
| `newPassword` | string |
| `oldPassword` | string |

## Example

```typescript
import type { InfoRequest } from "";

// TODO: Update the object below with actual values
const example = {
  newEmail: null,
  newPassword: null,
  oldPassword: null
} satisfies InfoRequest;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as InfoRequest;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
