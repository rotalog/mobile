
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSize } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { DriverNavigator } from './DriverNavigator';

// ── Screens ───────────────────────────────────────────────────────────────────
import { LoginScreen, RecoverScreen, RegisterScreen } from '../screens/Auth/AuthScreens';
import { HomeScreen }     from '../screens/Home/HomeScreen';
import { CatalogScreen }  from '../screens/Catalog/CatalogScreen';
import { CartScreen }     from '../screens/Cart/CartScreen';
import { HistoryScreen }  from '../screens/History/HistoryScreen';
import { SearchScreen }   from '../screens/Search/SearchScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { ProfileScreen }  from '../screens/Settings/ProfileScreen';
import { PrivacyScreen }  from '../screens/Settings/PrivacyTermScreen';
import { ContactScreen }  from '../screens/Settings/ContactScreen';
import { DeliveryScreen } from '../screens/Delivery/DeliveryScreen';
import { ProductScreen }  from '../screens/Product/ProductScreen';
import { SupplierScreen } from '../screens/Supplier/SupplierScreen';
import { PaymentScreen }  from '../screens/Payment/PaymentScreen';


// ── Param Lists ───────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login:    undefined;
  Recover:  undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Catalog:  undefined;
  Product:  { produto: any };
  Supplier: { fornecedor: any };
  Search:   undefined;
  History:  undefined;
  Payment:  { total: number; orderId: string };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  Profile:      undefined;
  Privacy:      undefined;
  Contact:      undefined;
  History:      undefined;
};

// ── Stacks ────────────────────────────────────────────────────────────────────
const AuthStack     = createNativeStackNavigator<AuthStackParamList>();
const HomeStack     = createNativeStackNavigator<HomeStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const Tab           = createBottomTabNavigator();
const Root          = createNativeStackNavigator();

// ── Auth Flow ─────────────────────────────────────────────────────────────────
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login"    component={LoginScreen} />
      <AuthStack.Screen name="Recover"  component={RecoverScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// ── Home Stack ────────────────────────────────────────────────────────────────
function HomeNavigator() {
  const { addToCart } = useCart();
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Catalog"  children={(props) => <CatalogScreen  {...props} addToCart={addToCart} />} />
      <HomeStack.Screen name="Product"  children={(props) => <ProductScreen  {...props} addToCart={addToCart} />} />
      <HomeStack.Screen name="Supplier" children={(props) => <SupplierScreen {...props} addToCart={addToCart} />} />
      <HomeStack.Screen name="Search"   children={(props) => <SearchScreen   {...props} addToCart={addToCart} />} />
      <HomeStack.Screen name="Payment"  component={PaymentScreen} />
    </HomeStack.Navigator>
  );
}

// ── Settings Stack ────────────────────────────────────────────────────────────
function SettingsNavigator() {
  const { logout } = useAuth();
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" children={(props) => <SettingsScreen {...props} logout={logout} />} />
      <SettingsStack.Screen name="Profile"      component={ProfileScreen} />
      <SettingsStack.Screen name="Privacy"      component={PrivacyScreen} />
      <SettingsStack.Screen name="Contact"      component={ContactScreen} />
      <SettingsStack.Screen name="History" component={HistoryScreen} />
    </SettingsStack.Navigator>
  );
}

// ── Custom Tab Bar ────────────────────────────────────────────────────────────
const TABS = [
  { name: 'HomeTab',     icon: '⌂',  label: 'Home'     },
  { name: 'DeliveryTab', icon: '🗺',  label: 'Entrega'  },
  { name: 'CartTab',     icon: '🛒', label: 'Carrinho' },
  { name: 'SettingsTab', icon: '⚙',  label: 'Config'   },
];

function CustomTabBar({ state, navigation }: any) {
  const { count } = useCart();
  return (
    <View style={tb.bar}>
      {state.routes.map((route: any, index: number) => {
        const isActive = state.index === index;
        const tab = TABS[index];
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={tb.tab}
          >
            <View>
              <Text style={{ fontSize: 22 }}>{tab.icon}</Text>
              {tab.name === 'CartTab' && count > 0 && (
                <View style={tb.badge}>
                  <Text style={tb.badgeTxt}>{count}</Text>
                </View>
              )}
            </View>
            <Text style={[tb.label, isActive && tb.labelActive]}>{tab.label}</Text>
            {isActive && <View style={tb.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Main Tabs ─────────────────────────────────────────────────────────────────
function MainNavigator() {
  const { cart, updateQty, total } = useCart();

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="HomeTab"     component={HomeNavigator} />
      <Tab.Screen name="DeliveryTab" component={DeliveryScreen} />
      <Tab.Screen name="CartTab"     children={(props) => <CartScreen {...props} cart={cart} updateQty={updateQty} total={total} />} />
      <Tab.Screen name="SettingsTab" component={SettingsNavigator} />
    </Tab.Navigator>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export function AppNavigator() {
  const { user, perfil } = useAuth();
  

  return (
   <NavigationContainer>
      <Root.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Root.Screen name="Auth" component={AuthNavigator} />
        ) : perfil === 'DRIVER' ? (
          <Root.Screen name="Driver" component={DriverNavigator} />
        ) : (
          <Root.Screen name="Main" component={MainNavigator} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
}
// ── Styles ────────────────────────────────────────────────────────────────────
const tb = StyleSheet.create({
  bar:         { flexDirection: 'row', backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, paddingBottom: 12, paddingTop: 8 },
  tab:         { flex: 1, alignItems: 'center', gap: 4 },
  label:       { fontSize: FontSize.xs, color: Colors.muted, fontWeight: '500' },
  labelActive: { color: Colors.green, fontWeight: '800' },
  indicator:   { width: 24, height: 3, backgroundColor: Colors.green, borderRadius: 2 },
  badge:       { position: 'absolute', top: -4, right: -6, backgroundColor: Colors.green, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  badgeTxt:    { color: '#0A0C0E', fontSize: 9, fontWeight: '900' },
});