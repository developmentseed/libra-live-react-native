# Getting Started

1. Follow [this guide](https://medium.com/@itsHabib/integrate-an-amazon-lex-chatbot-into-a-react-native-app-1536883ccbed#33fa) to create a Cognito identity pool that will give your app access to AWS Lex

1. Copy `.env.sample` to `.env` and fill in the respective values, including the Cognito identity pool ID you just created

1. Follow the "Building Projects with Native Code" steps on the ["Getting Started" guide](https://facebook.github.io/react-native/docs/getting-started.html) for React Native to install dependencies for native development for your target platform (iOS, Android)

1. Run `yarn install`

1. [Run the app](#running-the-app)

# Running the app

1. Start the JS code packager

`yarn start`

This process needs to remain running while you are developing the app, so it may be best to run in a separate terminal window/tab/pane.

2. Run the app

iOS

`yarn run react-native run-ios`

Android

`yarn run react-native run-android`

# React Native

[`react-native.md`](react-native.md) contains the default project documentation. For further information, see the [official project website](https://facebook.github.io/react-native).