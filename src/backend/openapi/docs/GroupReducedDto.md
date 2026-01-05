# GroupReducedDto

## Properties

| Name      | Type   |
| --------- | ------ |
| `groupId` | string |
| `name`    | string |
| `photo`   | string |

## Example

```typescript
import type { GroupReducedDto } from "";

// TODO: Update the object below with actual values
const example = {
  groupId: null,
  name: null,
  photo: null
} satisfies GroupReducedDto;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GroupReducedDto;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
