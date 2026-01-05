# SplitzUserUpdateViewModel

## Properties

| Name       | Type   |
| ---------- | ------ |
| `userName` | string |
| `photo`    | string |

## Example

```typescript
import type { SplitzUserUpdateViewModel } from "";

// TODO: Update the object below with actual values
const example = {
  userName: null,
  photo: null
} satisfies SplitzUserUpdateViewModel;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SplitzUserUpdateViewModel;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
