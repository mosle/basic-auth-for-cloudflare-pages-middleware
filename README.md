Basic Authentication for cloudflare pages middleware

## Installation

```sh
npm install --save basic-auth-for-cloudflare-pages-middleware
```

```sh
yarn add basic-auth-for-cloudflare-pages-middleware
```

## Usage

### add "functions/\_middleware.js"

directory structure:

```
├── ...
├── functions
| └── _middleware.js
└── ...
```

### edit "functions/\_middleware.js"

like

```js
// ---
// filename: functions/_middleware.js
// ---
import { createBasicAuthHandler } from "basic-auth-for-cloudflare-pages-middleware";
export const onRequest = [
  createBasicAuthHandler({ name: "test", password: "test" }),
];
```

see https://developers.cloudflare.com/pages/platform/functions
