
# LLMSettingsDto

Provider availability and the user\'s settings. The API key is represented by a flag.

## Properties

Name | Type
------------ | -------------
`serverProviderAvailable` | boolean
`customProviderAllowed` | boolean
`customProviderEnabled` | boolean
`endpoint` | string
`model` | string
`hasApiKey` | boolean
`available` | boolean

## Example

```typescript
import type { LLMSettingsDto } from ''

// TODO: Update the object below with actual values
const example = {
  "serverProviderAvailable": null,
  "customProviderAllowed": null,
  "customProviderEnabled": null,
  "endpoint": null,
  "model": null,
  "hasApiKey": null,
  "available": null,
} satisfies LLMSettingsDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as LLMSettingsDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


