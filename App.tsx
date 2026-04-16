import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import HomeScreen from './src/screens/HomeScreen';
import GroceryListScreen from './src/screens/GroceryListScreen';
import { Colors, Spacing, BorderRadius, Typography } from './src/constants/colors';
import { TouchableOpacity, Text } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

type TabName = 'meals' | 'grocery';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('meals');
  
  useEffect(() => {
    async function prepare() {
      try {
        // Simulate minimal setup time
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>
        {activeTab === 'meals' && <HomeScreen />}
        {activeTab === 'grocery' && <GroceryListScreen />}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'meals' && styles.tabActive]}
          onPress={() => setActiveTab('meals')}
        >
          <Text style={[styles.tabIcon, activeTab === 'meals' && styles.tabIconActive]}>🍽️</Text>
          <Text style={[styles.tabLabel, activeTab === 'meals' && styles.tabLabelActive]}>Meals</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'grocery' && styles.tabActive]}
          onPress={() => setActiveTab('grocery')}
        >
          <Text style={[styles.tabIcon, activeTab === 'grocery' && styles.tabIconActive]}>🛒</Text>
          <Text style={[styles.tabLabel, activeTab === 'grocery' && styles.tabLabelActive]}>Grocery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  tabIconActive: {
    fontSize: 28,
  },
  tabLabel: {
    ...Typography.label,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: Colors.primary,
  },
});
