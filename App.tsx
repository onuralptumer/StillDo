/**
 * Stilldo — a forgetfulness tracker.
 *
 * Ported from the Claude Design canvas `Stilldo.dc.html`.
 *
 * @format
 */

import React, { useEffect, useMemo, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  type ScrollViewInstance,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { TabBar } from './src/components/TabBar';
import { ThemeProvider } from './src/components/ThemeContext';
import { DetailScreen } from './src/screens/DetailScreen';
import { InboxScreen } from './src/screens/InboxScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SweepScreen } from './src/screens/SweepScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { dark, font, light } from './src/theme';
import type { Screen } from './src/types';
import { useStilldo } from './src/useStilldo';

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingHorizontal: 30,
    paddingBottom: 8,
  },
  wordmark: {
    fontFamily: font.medium,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scroll: { flex: 1 },
});

function AppContent() {
  const s = useStilldo();
  const insets = useSafeAreaInsets();
  const system = useColorScheme();

  const scheme =
    s.settings.appearance === 'System'
      ? system === 'light'
        ? 'light'
        : 'dark'
      : s.settings.appearance.toLowerCase();
  const c = useMemo(() => (scheme === 'light' ? light : dark), [scheme]);

  const scroller = useRef<ScrollViewInstance>(null);
  // Each screen is its own document; land at the top of every one.
  useEffect(() => {
    scroller.current?.scrollTo({ y: 0, animated: false });
  }, [s.screen, s.detailId]);

  const activeTab: Screen = s.screen === 'detail' ? s.prev : s.screen;

  return (
    <ThemeProvider palette={c}>
      <StatusBar
        barStyle={scheme === 'light' ? 'dark-content' : 'light-content'}
      />
      <View
        style={[
          styles.root,
          { backgroundColor: c.bg, paddingTop: insets.top },
        ]}>
        <View style={styles.header}>
          <Text style={[styles.wordmark, { color: c.mute }]}>Stilldo</Text>
        </View>

        <KeyboardAvoidingView
          style={styles.scroll}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            ref={scroller}
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            {s.screen === 'today' && <TodayScreen s={s} />}
            {s.screen === 'inbox' && <InboxScreen s={s} />}
            {s.screen === 'detail' && <DetailScreen s={s} />}
            {s.screen === 'sweep' && <SweepScreen s={s} />}
            {s.screen === 'settings' && <SettingsScreen s={s} />}
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
          <TabBar active={activeTab} onSelect={s.actions.go} />
        </View>
      </View>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
