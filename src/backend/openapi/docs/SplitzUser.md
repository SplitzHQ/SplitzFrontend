# SplitzUser

## Properties

| Name                   | Type                                         |
| ---------------------- | -------------------------------------------- |
| `id`                   | string                                       |
| `userName`             | string                                       |
| `normalizedUserName`   | string                                       |
| `email`                | string                                       |
| `normalizedEmail`      | string                                       |
| `emailConfirmed`       | boolean                                      |
| `passwordHash`         | string                                       |
| `securityStamp`        | string                                       |
| `concurrencyStamp`     | string                                       |
| `phoneNumber`          | string                                       |
| `phoneNumberConfirmed` | boolean                                      |
| `twoFactorEnabled`     | boolean                                      |
| `lockoutEnd`           | Date                                         |
| `lockoutEnabled`       | boolean                                      |
| `accessFailedCount`    | number                                       |
| `photo`                | string                                       |
| `friends`              | [Array&lt;Friend&gt;](Friend.md)             |
| `groups`               | [Array&lt;Group&gt;](Group.md)               |
| `balances`             | [Array&lt;GroupBalance&gt;](GroupBalance.md) |

## Example

```typescript
import type { SplitzUser } from "";

// TODO: Update the object below with actual values
const example = {
  id: null,
  userName: null,
  normalizedUserName: null,
  email: null,
  normalizedEmail: null,
  emailConfirmed: null,
  passwordHash: null,
  securityStamp: null,
  concurrencyStamp: null,
  phoneNumber: null,
  phoneNumberConfirmed: null,
  twoFactorEnabled: null,
  lockoutEnd: null,
  lockoutEnabled: null,
  accessFailedCount: null,
  photo: null,
  friends: null,
  groups: null,
  balances: null
} satisfies SplitzUser;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SplitzUser;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
