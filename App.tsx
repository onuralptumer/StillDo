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
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT, TabBar } from './src/components/TabBar';
import { IconButton } from './src/components/controls';
import { GearIcon } from './src/components/icons';
import { Kicker, Lead } from './src/components/primitives';
import { useDatabase } from './src/db/useDatabase';
import { ThemeProvider } from './src/components/ThemeContext';
import { DetailScreen } from './src/screens/DetailScreen';
import { InboxScreen } from './src/screens/InboxScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { SweepScreen } from './src/screens/SweepScreen';
import { TodayScreen } from './src/screens/TodayScreen';
import { dark, font, light, space } from './src/theme';
import type { Screen } from './src/types';
import { useStilldo } from './src/useStilldo';
import { useSweepAlarm } from './src/useSweepAlarm';
import { buildSnapshot } from './src/widgets/snapshot';
import { useDeepLink } from './src/widgets/useDeepLink';
import { useWidgetSync } from './src/widgets/useWidgetSync';

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    // Held at the wordmark's old height so the page below does not jump when
    // the gear is absent — during the intro, which hides it.
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // The gutter the wordmark sat in, less the mark's own padding, so the
    // gear's edge lands where the last letter did.
    paddingHorizontal: 26,
    paddingBottom: 2,
  },
  scroll: { flex: 1 },
  // The bar floats over the page, so the page has to be able to scroll clear
  // of it rather than end behind it.
  scrollBody: { paddingBottom: TAB_BAR_HEIGHT + 28 },
  floating: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  centre: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 30,
    gap: 14,
  },
  fault: {
    paddingHorizontal: space.gutter,
    paddingBottom: 10,
  },
  faultText: {
    fontFamily: font.medium,
    fontSize: 10,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
});

function AppContent() {
  const { db, error: openError } = useDatabase();
  const s = useStilldo(db);
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
  // The intro owns the whole frame: no tabs to wander off into mid-sentence.
  const onboarding = s.ready && s.settings.onboarded !== 'yes';

  // The prompt belongs at the moment you reach for the thing, and the last
  // pane of the intro is where the sweep time gets chosen — so ask as soon
  // as that is done, rather than over the top of it.
  const alarm = useSweepAlarm(s.settings.sweepTime, s.ready && !onboarding);

  /*
    The home- and lock-screen widgets run in their own process and cannot open
    the app's database, so they are given a summary of it instead — rewritten
    here whenever what they show changes. Nothing is published until the first
    read has landed, or a cold start would blank them before filling them in.
  */
  const snapshot = useMemo(
    () =>
      s.ready
        ? buildSnapshot({
            dueTasks: s.dueTasks,
            tasks: s.tasks,
            settings: s.settings,
          })
        : null,
    [s.ready, s.dueTasks, s.tasks, s.settings],
  );
  useWidgetSync(snapshot);
  // And the way back in: the URL a widget was tapped with.
  useDeepLink(s.actions.follow);

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
          {/*
            Settings is not one of the app's three places, so it is not a tab.
            It sits up here instead, quiet until it is the screen you are on —
            and is gone during the intro, which owns the whole frame for the
            same reason the tabs are hidden there.
          */}
          {!onboarding && (
            <IconButton
              icon={GearIcon}
              label="Settings"
              variant={s.screen === 'settings' ? 'primary' : 'ghost'}
              onPress={() => s.actions.go('settings')}
            />
          )}
        </View>

        {openError ? (
          <View style={styles.centre}>
            <Kicker>ThinkLighter could not open its store</Kicker>
            <Lead>{openError}</Lead>
          </View>
        ) : !s.ready ? (
          // A blank hold rather than a spinner: the first read is a local file
          // and lands in a frame or two.
          <View style={styles.scroll} />
        ) : onboarding ? (
          <OnboardingScreen s={s} />
        ) : (
          <KeyboardAvoidingView
            style={styles.scroll}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView
              ref={scroller}
              style={styles.scroll}
              contentContainerStyle={styles.scrollBody}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag">
              {s.screen === 'today' && <TodayScreen s={s} />}
              {s.screen === 'inbox' && <InboxScreen s={s} />}
              {s.screen === 'detail' && <DetailScreen s={s} />}
              {s.screen === 'sweep' && <SweepScreen s={s} />}
              {s.screen === 'settings' && (
                <SettingsScreen s={s} alarm={alarm} />
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        )}

        <View
          pointerEvents="box-none"
          style={[styles.floating, { bottom: Math.max(insets.bottom, 12) }]}>
          {!!(s.dbError || alarm.error) && (
            <View style={styles.fault}>
              <Text style={[styles.faultText, { color: c.accent }]}>
                {s.dbError
                  ? `Not saved — ${s.dbError}`
                  : `Sweep alarm — ${alarm.error}`}
              </Text>
            </View>
          )}
          {!onboarding && (
            <TabBar active={activeTab} onSelect={s.actions.go} />
          )}
        </View>
      </View>
    </ThemeProvider>
  );
}

export default function App() {
  // The provider holds its children back until the native view reports insets,
  // and that event never lands under the bridgeless runtime — it is dispatched
  // through `RCTEventEmitter`, which is not registered there, so the app tree
  // below never mounted at all. The metrics read at launch are the same
  // numbers, so hand them over up front rather than wait for an event that is
  // not coming.
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppContent />
    </SafeAreaProvider>
  );
}
