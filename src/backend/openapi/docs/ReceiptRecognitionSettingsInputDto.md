
# ReceiptRecognitionSettingsInputDto

Body for saving the custom provider.

## Properties

Name | Type
------------ | -------------
`enabled` | boolean
`endpoint` | string
`model` | string
`apiKey` | string

## Example

```typescript
import type { ReceiptRecognitionSettingsInputDto } from ''

// TODO: Update the object below with actual values
const example = {
  "enabled": null,
  "endpoint": null,
  "model": null,
  "apiKey": null,
} satisfies ReceiptRecognitionSettingsInputDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReceiptRecognitionSettingsInputDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


