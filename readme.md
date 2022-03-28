# @romain-faust/upload-file-firebase

## Installation

_With [NPM](https://www.npmjs.com/)_:

```bash
npm install @romain-faust/upload-file-firebase
```

_With [Yarn](https://classic.yarnpkg.com/)_:

```bash
yarn add @romain-faust/upload-file-firebase
```

_With [PNPM](https://pnpm.io/)_:

```bash
pnpm add @romain-faust/upload-file-firebase
```

## Usage

<!-- prettier-ignore -->
```ts
import { buildUploadFile } from '@romain-faust/upload-file-firebase'

const uploadFile = buildUploadFile(firebaseStorage)

const downloadURL$ = uploadFile('path/to/the/file', file).pipe(
    last((snapshot) => snapshot.hasOwnProperty('downloadURL')),
    map((snapshot) => snapshot.downloadURL as string),
)
const progress$ = uploadFile('path/to/the/file', file).pipe(
    map((snapshot) => (snapshot.bytesTransferred / snapshot.totalBytes) * 100),
    map((percentage) => `${percentage.toFixed(2)}%`),
)
```

## License

[MIT](./license.md)
