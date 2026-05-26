# RotaLog Mobile

Aplicativo mobile do RotaLog para compradores, fornecedores e entregadores.

## Stack

- Expo 51 / React Native 0.74
- TypeScript
- React Navigation v6
- Jest + Testing Library
- Android e iOS nativos gerados para o runtime mobile

## Como rodar

```bash
npm install
npm start
```

Com o Metro aberto, use:

```bash
npm run android
npm run ios
npm run web
```

## Testes

```bash
npm test
npx tsc --noEmit
```

## Estrutura

```text
src/
  App.tsx
  components/
  context/
  navigation/
  screens/
  services/
  theme/
```

O arquivo `App.tsx` na raiz apenas reexporta `src/App.tsx`, mantendo o bootstrap nativo separado da aplicacao.
