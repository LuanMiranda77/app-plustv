# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
comando para debug na tv
ares-inspect --device minha-lg --app com.plustv.iptv

add in android
antes colocas esta tag -> android:usesCleartextTraffic="true"
caminho android/app/src/main/AndroidManifest.xml
exemplo:
<application
    android:usesCleartextTraffic="true"

colocar outra tag iniciar a tela em  -> android:screenOrientation="landscape"
exemplo:
<activity
    android:name=".MainActivity"
    android:screenOrientation="landscape"

colocar tag fullscreen ->  android:theme="@style/Theme.App.Fullscreen"
<activity
    android:name=".MainActivity"
    android:theme="@style/Theme.App.Fullscreen"
    
caminho android/app/src/main/res/values/themes.xml
<style name="Theme.App.Fullscreen" parent="Theme.AppCompat.Light.NoActionBar">
    <item name="android:windowFullscreen">true</item>
    <item name="android:windowNoTitle">true</item>
</style>

______________________________________________________________

# 5. No Android Studio — gerar o APK
```
Menu → Build → Build Bundle(s) / APK(s) → Build APK(s)
```

Aguardar o build. Quando terminar aparece uma notificação:
```
APK(s) generated → locate
```

O APK fica em:
```
android/app/build/outputs/apk/debug/app-debug.apk
```
