import { useThemedStyles } from '../hooks/useThemedStyles';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontSize } from '../theme';
 
// ── Screens ───────────────────────────────────────────────────────────────────
import { DriverRouteScreen }      from '../screens/Driver/DriverRouteScreen';
import { DriverNavigationScreen } from '../screens/Driver/DriverNavigationScreen';
import { DriverDeliveryScreen }   from '../screens/Driver/DriverDeliveryScreen';
import { DriverOccurrenceScreen } from '../screens/Driver/DriverOccurrenceScreen';
import { DriverSummaryScreen }    from '../screens/Driver/DriverSummaryScreen';
import { DriverHistoryScreen }  from '../screens/Driver/DriverHistoryScreen';
import { ProfileScreen }  from '../screens/Driver/DriverProfile';
import { PrivacyScreen } from '@/screens/Settings/PrivacyTermScreen';
import { ContactScreen } from '@/screens/Settings/ContactScreen';
import { DriverSettingsScreen } from '@/screens/Driver/DriverSettingsScreen';
 
// ── Param Lists ───────────────────────────────────────────────────────────────
export type DriverRouteStackParamList = {
  DriverRoute:      undefined;
  DriverNavigation: { ponto: any; index: number };
  DriverDelivery:   { ponto: any };
  DriverOccurrence: { ponto: any };
  DriverSummary:    undefined;
  DriverHistory:    undefined; 
  Privacy:          undefined;
  Contact:          undefined;
  ProfileScreen:   undefined;
  
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
  const tb = useThemedStyles(buildTabStyles);
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
const buildTabStyles = (c: import('../theme').ColorPalette) => ({
  bar:         { flexDirection: 'row', backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.border, paddingBottom: 12, paddingTop: 8 },
  tab:         { flex: 1, alignItems: 'center', gap: 4 },
  label:       { fontSize: FontSize.xs, color: c.muted, fontWeight: '500' },
  labelActive: { color: c.green, fontWeight: '800' },
  indicator:   { width: 24, height: 3, backgroundColor: c.green, borderRadius: 2 },
});
