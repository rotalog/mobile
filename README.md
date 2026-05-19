# RotaLog 🚚

App de distribuição B2C — Fornecedores oferecem produtos (carnes, cimento, grãos etc.) e compradores realizam pedidos e acompanham a entrega.

---

## Stack

| Ferramenta | Motivo |
|---|---|
| **Expo (Managed Workflow)** | Setup rápido, sem config nativa |
| **TypeScript** | Tipagem segura em todo o projeto |
| **React Navigation v6** | Stack + Bottom Tabs |
| **react-native-maps** | Mapa de acompanhamento de entrega |

---

## Estrutura

```
src/
├── theme/          → Cores, fontes, espaçamentos (design tokens)
├── components/
│   ├── ui/         → Button, Input, Badge, Avatar, Rating, Divider
│   └── layout/     → TopBar
├── screens/
│   ├── Auth/       → Login, Recuperação, Cadastro
│   ├── Home/       → Home com listagem de fornecedores
│   └── AllScreens  → Catálogo, Carrinho, Histórico, Busca,
│                     Entrega, Produto, Fornecedor, Config, Perfil
├── hooks/
│   ├── useCart.ts  → Lógica do carrinho (add, remove, qty, total)
│   └── useAuth.ts  → Login, cadastro, logout, recuperação
├── data/
│   └── mock.ts     → Dados de exemplo (substituir por API)
└── navigation/
    └── AppNavigator.tsx → Stack Auth + Bottom Tab Navigator
```

---

## Como rodar

```bash
# 1. Clone / extraia o projeto
cd RotaLog

# 2. Instale as dependências
npm install

# 3. Inicie o servidor Expo
npx expo start

# 4. Escaneie o QR com o app Expo Go no celular
#    ou pressione 'a' para Android / 'i' para iOS (simulador)
```

---

## Próximos passos

- [ ] Integrar API real (substituir `src/data/mock.ts`)
- [ ] Autenticação com token JWT (`useAuth.ts`)
- [ ] Mapa real com `react-native-maps` na tela de Entrega
- [ ] Push notifications com `expo-notifications`
- [ ] App do entregador (novo projeto ou flavor)
- [ ] Pagamento in-app (Stripe / MercadoPago SDK)
