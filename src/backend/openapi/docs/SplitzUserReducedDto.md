# SplitzUserReducedDto

## Properties

| Name       | Type   |
| ---------- | ------ |
| `id`       | string |
| `userName` | string |
| `photo`    | string |

## Example

```typescript
import type { SplitzUserReducedDto } from "";

// TODO: Update the object below with actual values
const example = {
  id: null,
  userName: null,
  photo: null
} satisfies SplitzUserReducedDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SplitzUserReducedDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
