# Altheajs Hackathon Workshop

This website was used for the Althea-L1 IFI Hackathon workshop to demonstrate the use of altheajs.

## Project Setup

First, [install Node.js with `npm` and `npx`](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

Next, run the following commands to initialize the project

* `npx create-react-app <project_name>` - creates a basic React application
* `cd <project_name>`

Due to some esoteric issues with create-react-app we need to manually install some backwards compatibility features for older browsers with react-app-rewired:

* `npm i --save-dev crypto-browserify stream-browserify assert stream-http https-browserify os-browserify url buffer process react-app-rewired`
* Configure the project to use `react-app-rewired` instead of `react-scripts` for start, build, and test:

```
// package.json
...
  "scripts": {
    "start": "react-app-rewired start",
    "build": "react-app-rewired build",
    "test": "react-app-rewired test",
    ...
  }
...
```

* Add a `config-overrides.js` file in the project root dir with the following contents:

```js
const webpack = require('webpack');

module.exports = function override(config) {
    const fallback = config.resolve.fallback || {};
    Object.assign(fallback, {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "assert": require.resolve("assert"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "os": require.resolve("os-browserify"),
        "url": require.resolve("url"),
    })
    config.resolve.fallback = fallback;

    config.plugins = (config.plugins || []).concat([
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        })
    ])

    // Fix the issue with replacing 'process/browser' above
    config.module.rules.unshift({ test: /\.m?js$/, resolve: { fullySpecified: false, }, });

    // Ignore warnings about source map files
    config.ignoreWarnings = [/Failed to parse source map/];

    return config;
}
```

Next, test that the configuration works by running `npm start` and opening `http://localhost:3000` in a browser.

## Dependencies

For this workshop I used the following dependencies:

* `npm i styled-components @althea-net/address-converter @althea-net/eip712 @althea-net/proto  @althea-net/provider @althea-net/transactions @ethersproject/hash @ethersproject/signing-key`

`styled-components` makes the Tabs work, the `@althea-net/*` packages are used for interacting with Althea-L1, and the `@ethersproject/*` packages are helpful when interacting with MetaMask.