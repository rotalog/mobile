import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSize } from '../theme';
 
// ── Screens ───────────────────────────────────────────────────────────────────
import { DriverRouteScreen }      from '../screens/Driver/DriverRouteScreen';
import { DriverNavigationScreen } from '../screens/Driver/DriverNavigationScreen';
import { DriverDeliveryScreen }   from '../screens/Driver/DriverDeliveryScreen';
import { DriverOccurrenceScreen } from '../screens/Driver/DriverOccurrenceScreen';
import { DriverSummaryScreen }    from '../screens/Driver/DriverSummaryScreen';
import { DriverHistoryScreen }  from '../screens/Driver/DriverHistoryScreen';
import { ProfileScreen }  from '../screens/Driver/DriverProfile';
import { PrivacyScreen } from '../screens/Settings/PrivacyTermScreen';
import { ContactScreen } from '../screens/Settings/ContactScreen';
import { DriverSettingsScreen } from '../screens/Driver/DriverSettingsScreen';
 
// ── Param Lists ───────────────────────────────────────────────────────────────
export type DriverRouteStackParamList = {
  DriverRoute: undefined;
  DriverNavigation: { ponto: any; index: number; routeId?: string };
  DriverDelivery: { ponto: any; routeId?: string };
  DriverOccurrence: { ponto: any; routeId?: string };
  DriverSummary: { routeId?: string } | undefined;
  DriverHistory: undefined;
  Privacy: undefined;
  Contact: undefined;
  ProfileScreen: undefined;
};
 
// ── Stacks ────────────────────────────────────────────────────────────────────
const DriverStack = createNativeStackNavigator<DriverRouteStackParamList>();
const DriverTab   = createBottomTabNavigator();
 
// ── Route Stack ───────────────────────────────────────────────────────────────
function DriverRouteNavigator() {
  return (
    <DriverStack.Navigator screenOptions={{ headerShown: false }}>
      <DriverStack.Screen name="DriverRoute"      component={DriverRouteScreen} />
      <DriverStack.Screen name="DriverNavigation" component={DriverNavigationScreen} />
      <DriverStack.Screen name="DriverDelivery"   component={DriverDeliveryScreen} />
      <DriverStack.Screen name="DriverOccurrence" component={DriverOccurrenceScreen} />
      <DriverStack.Screen name="DriverSummary"    component={DriverSummaryScreen} />
      <DriverStack.Screen name="DriverHistory" component={DriverHistoryScreen} />
      <DriverStack.Screen name="Privacy" component={PrivacyScreen} />
      <DriverStack.Screen name="Contact" component={ContactScreen} />
      <DriverStack.Screen name="ProfileScreen" component={ProfileScreen} />
      
    </DriverStack.Navigator>
  );
}
 
// ── Custom Tab Bar ────────────────────────────────────────────────────────────
const DRIVER_TABS = [
  { name: 'DriverRouteTab',   icon: '🗺️', label: 'Mapa'      },
  { name: 'DriverDeliveryTab',icon: '📦', label: 'Entregas'  },
  { name: 'DriverProfileTab', icon: '⚙️', label: 'Configurações'    },
];
 
function DriverTabBar({ state, navigation }: any) {
  return (
    <View style={tb.bar}>
      {state.routes.map((route: any, index: number) => {
        const isActive = state.index === index;
        const tab = DRIVER_TABS[index];
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={tb.tab}
          >
            <Text style={{ fontSize: 22 }}>{tab.icon}</Text>
            <Text style={[tb.label, isActive && tb.labelActive]}>{tab.label}</Text>
            {isActive && <View style={tb.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
 




// ── Driver Navigator (Tab) ────────────────────────────────────────────────────
export function DriverNavigator() {
  return (
    <DriverTab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <DriverTabBar {...props} />}
    >
      <DriverTab.Screen name="DriverRouteTab"    component={DriverRouteNavigator} />
      <DriverTab.Screen name="DriverDeliveryTab" component={DriverHistoryScreen} />
      <DriverTab.Screen name="DriverProfileTab" component={DriverSettingsScreen} />
    </DriverTab.Navigator>
  );
}
 
// ── Styles ────────────────────────────────────────────────────────────────────
const tb = StyleSheet.create({
  bar:         { flexDirection: 'row', backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, paddingBottom: 12, paddingTop: 8 },
  tab:         { flex: 1, alignItems: 'center', gap: 4 },
  label:       { fontSize: FontSize.xs, color: Colors.muted, fontWeight: '500' },
  labelActive: { color: Colors.green, fontWeight: '800' },
  indicator:   { width: 24, height: 3, backgroundColor: Colors.green, borderRadius: 2 },
});
