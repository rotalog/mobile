# Configuracao de EAS Build

Este documento resume as alteracoes preparadas para permitir builds do app Rotalog pelo EAS.

## Alteracoes realizadas

- Adicionado `eas.json` com perfis de build `development`, `preview` e `production`.
- Configurado `cli.version` para exigir EAS CLI `>= 19.0.0`.
- Configurado `appVersionSource` como `remote`.
- Adicionado `extra.eas.projectId` em `app.json` para vincular o app ao projeto EAS.
- Atualizadas permissoes Android em `app.json` usando os nomes completos `android.permission.*`.
- Adicionada permissao `android.permission.RECORD_AUDIO`.

## Perfis de build

- `development`: usa development client e distribuicao interna.
- `preview`: usa distribuicao interna.
- `production`: incrementa a versao automaticamente.

## Observacoes

- O app continua usando os plugins `expo-location` e `expo-image-picker`.
- As descricoes de uso de localizacao, fotos e camera para iOS foram mantidas em `app.json`.
