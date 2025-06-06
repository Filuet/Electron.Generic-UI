# Step-by-Step Guide: Creating an Electron App with Vite

## Prerequisites

- Node.js installed recommended version node LTS ( 22.16.0)
- pnpm recommended version (10.9.0)

---

Check Versions ---->

1. node version --> node -v
2. npm version --> npm -v
3. typescript (globally) --> tsc -version
4.

## Method 1: Electron + Vite (Recommended Modern Approach)

### 1. Create a Vite project

```bash
pnpm create vite@latest my-electron-app --template react-ts

cd my-electron-app
pnpm install
pnpm run dev
```

### Note:--->

1.  To run the application you need to include the certifications

### To Package and bundle it to an exe file

1. Step one to copy the below code and paste it in the package.json after dependencies object

```javascript
"build": {
"appId": "Generic-UI",
"productName": "Generic UI",
"directories": {
"buildResources": "resources",
"output": "release"
},
"files": [
"out",
"dist-electron",
"node_modules",
"package.json"
],
"win": {
"target": "nsis",
"icons": "build/icon.ico"
},
"nsis": {
"oneClick": false,
"perMachine": false,
"allowToChangeInstallationDirectory": true
}
},

```

2. Run the below command

```javascript
pnpm run build:win
```

above will bundle the whole app in a exe file and you can find it inside the release folder you can share it and install it , It will work as a native desktop application
