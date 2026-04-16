import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Dimensions,
  FlatList,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/colors';
import { useMeals } from '../hooks/useMeals';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import {
  getCurrentDayName,
  getSlotByTime,
  getNextMeal,
  formatSlotLabel,
  getCurrentMeal,
  Meal,
} from '../utils/mealLogic';

const GITHUB_URL = 'https://raw.githubusercontent.com/dishaponganti/whats_cooking/main/meal_plan.xlsx';

interface CurrentMealState {
  meal: Meal | null;
  day: string;
  slot: string;
}

interface DayInfo {
  name: string;
  date: string;
  dayOfWeek: string;
}

// Helper function to get date for a given day name
function getDateForDay(dayName: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const currentDayIndex = today.getDay();
  const targetDayIndex = days.indexOf(dayName);
  
  let daysOffset = targetDayIndex - currentDayIndex;
  if (daysOffset < 0) daysOffset += 7;
  
  const date = new Date(today);
  date.setDate(today.getDate() + daysOffset);
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function HomeScreen() {
  const { meals, loading, error, isOffline, refresh } = useMeals(GITHUB_URL);
  const [mealOverride, setMealOverride] = useState<CurrentMealState | null>(null);
  const { isSpeaking, speak } = useTextToSpeech();

  // Fallback mock data for testing
  const mockMeals: Meal[] = [
    { day: 'Monday', slot: 'breakfast', name_hindi: 'पनीर डोसा' },
    { day: 'Monday', slot: 'lunch', name_hindi: 'आलू मेथी और रोटी' },
    { day: 'Monday', slot: 'snack', name_hindi: 'आटे का हलवा' },
    { day: 'Monday', slot: 'dinner', name_hindi: 'राइस और प्याज़ की दाल' },
  ];

  const displayMeals = meals || mockMeals;

  const currentMealState = useMemo<CurrentMealState | null>(() => {
    if (!displayMeals) return null;

    if (mealOverride) return mealOverride;

    const currentDay = getCurrentDayName();
    const currentSlot = getSlotByTime(new Date().getHours());
    const meal = getCurrentMeal(displayMeals);

    return {
      meal: meal || null,
      day: currentDay,
      slot: currentSlot,
    };
  }, [displayMeals, mealOverride]);

  const handleNextMeal = () => {
    if (!displayMeals || !currentMealState) return;

    const nextMeal = getNextMeal(displayMeals, currentMealState.day, currentMealState.slot);
    if (nextMeal) {
      setMealOverride({
        meal: nextMeal,
        day: nextMeal.day,
        slot: nextMeal.slot,
      });
    }
  };

  const handleReset = () => {
    setMealOverride(null);
  };

  const handleSpeak = async (mealName: string) => {
    await speak(mealName);
  };

  if (loading && !meals) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your meal plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !meals) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!meals || !currentMealState) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>No meal plan available</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
      >
        {/* Offline Badge */}
        {isOffline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineBadgeText}>📡 Offline Mode</Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>What's Cooking?</Text>
        </View>

        {/* Week Calendar */}
        {displayMeals && displayMeals.length > 0 && (
          <WeekCalendar 
            meals={displayMeals}
            currentDay={currentMealState?.day || getCurrentDayName()}
            nextMeal={currentMealState?.meal}
            nextMealDay={currentMealState?.day}
            nextMealSlot={currentMealState?.slot}
          />
        )}

        {/* Meals Section */}
        {currentMealState?.meal && (
          <View style={styles.mealsContainer}>
            {/* Current Meal */}
            <View style={styles.mealPair}>
              <View style={[styles.mealBadge, styles.currentBadge]}>
                <Text style={styles.mealBadgeText}>NOW</Text>
              </View>
              <TouchableOpacity
                style={[styles.mealDisplay, styles.currentMealDisplay]}
                onPress={() => handleSpeak(currentMealState.meal!.name_hindi)}
                activeOpacity={0.7}
              >
                <View style={styles.mealContentWrapper}>
                  <View style={styles.mealContentLeft}>
                    <Text style={styles.mealSlot}>
                      {formatSlotLabel(currentMealState.slot)}
                    </Text>
                    <Text style={styles.mealNameLarge}>{currentMealState.meal.name_hindi}</Text>
                    {currentMealState.meal.notes_hindi && (
                      <Text style={styles.mealNotes}>💡 {currentMealState.meal.notes_hindi}</Text>
                    )}
                  </View>
                  <View style={[styles.speakerIcon, isSpeaking && styles.speakerIconActive]}>
                    <Text style={styles.speakerText}>{isSpeaking ? '🔊' : '🔉'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Next Meal */}
            {(() => {
              const nextMeal = getNextMeal(meals, currentMealState.day, currentMealState.slot);
              return nextMeal ? (
                <View style={styles.mealPair}>
                  <View style={[styles.mealBadge, styles.nextBadge]}>
                    <Text style={styles.mealBadgeText}>NEXT</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.mealDisplay, styles.nextMealDisplay]}
                    onPress={() => handleSpeak(nextMeal.name_hindi)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.mealContentWrapper}>
                      <View style={styles.mealContentLeft}>
                        <Text style={styles.mealSlot}>
                          {formatSlotLabel(nextMeal.slot)}
                        </Text>
                        <Text style={styles.mealNameLarge}>{nextMeal.name_hindi}</Text>
                        {nextMeal.notes_hindi && (
                          <Text style={styles.mealNotes}>💡 {nextMeal.notes_hindi}</Text>
                        )}
                      </View>
                      <View style={[styles.speakerIcon, isSpeaking && styles.speakerIconActive]}>
                        <Text style={styles.speakerText}>{isSpeaking ? '🔊' : '🔉'}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : null;
            })()}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleNextMeal}
          >
            <Text style={styles.buttonText}>अगला आहार</Text>
            <Text style={styles.buttonSubtext}>Next Meal</Text>
          </TouchableOpacity>

          {mealOverride && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleReset}
            >
              <Text style={styles.secondaryButtonText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refresh}
          disabled={loading}
        >
          <Text style={styles.refreshButtonText}>
            {loading ? '⟲ Refreshing...' : '⟳ Refresh'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Week Calendar Component
interface WeekCalendarProps {
  meals: Meal[];
  currentDay: string;
  nextMeal: Meal | null;
  nextMealDay: string | undefined;
  nextMealSlot: string | undefined;
}

const SLOTS = ['breakfast', 'lunch', 'snack', 'dinner'];
const SLOT_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snack: 'Snack',
  dinner: 'Dinner',
};

function WeekCalendar({ meals, currentDay, nextMeal, nextMealDay, nextMealSlot }: WeekCalendarProps) {
  const uniqueDays = Array.from(new Set(meals.map(m => m.day)));
  
  return (
    <View style={styles.weekCalendarContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        {uniqueDays.map((day) => (
          <DayColumn
            key={day}
            day={day}
            meals={meals.filter(m => m.day === day)}
            isCurrentDay={day === currentDay}
            isUpcomingMealDay={day === nextMealDay}
            upcomingSlot={nextMealSlot}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface DayColumnProps {
  day: string;
  meals: Meal[];
  isCurrentDay: boolean;
  isUpcomingMealDay: boolean | undefined;
  upcomingSlot: string | undefined;
}

function DayColumn({ day, meals, isCurrentDay, isUpcomingMealDay, upcomingSlot }: DayColumnProps) {
  const dateStr = getDateForDay(day);
  
  return (
    <View style={styles.dayColumn}>
      <View style={[styles.dayHeader, isCurrentDay && styles.dayHeaderCurrent]}>
        <Text style={[styles.dayName, isCurrentDay && styles.dayNameCurrent]}>
          {day.slice(0, 3)}
        </Text>
        <Text style={[styles.dayDate, isCurrentDay && styles.dayDateCurrent]}>
          {dateStr}
        </Text>
      </View>
      
      <View style={styles.calendarGrid}>
        {SLOTS.map((slot, index) => {
          const meal = meals.find(m => m.slot === slot);
          const isUpcomingMeal = isUpcomingMealDay && slot === upcomingSlot;
          
          return (
            <View
              key={slot}
              style={[
                styles.calendarCell,
                index === 0 && styles.calendarCellTop,
                index === SLOTS.length - 1 && styles.calendarCellBottom,
                isUpcomingMeal && styles.calendarCellUpcoming,
              ]}
            >
              <Text style={styles.calendarSlotName}>{SLOT_LABELS[slot]}</Text>
              <Text numberOfLines={2} style={styles.calendarMealName}>
                {meal ? meal.name_hindi : '—'}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: Dimensions.get('window').height - 100,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  errorIcon: {
    fontSize: 48,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  retryButtonText: {
    ...Typography.subheading,
    color: Colors.surface,
  },

  /* Offline Badge */
  offlineBadge: {
    backgroundColor: Colors.warning,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  offlineBadgeText: {
    ...Typography.label,
    color: Colors.surface,
    fontWeight: '600',
  },

  /* Header */
  header: {
    marginBottom: Spacing.lg,
  },
  appTitle: {
    ...Typography.large,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },

  /* Week Calendar */
  weekCalendarContainer: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  dayColumn: {
    marginRight: Spacing.lg,
    alignItems: 'center',
  },
  dayHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  dayHeaderCurrent: {
    backgroundColor: Colors.primary,
  },
  dayName: {
    ...Typography.heading,
    color: Colors.text.primary,
    fontWeight: '700',
  },
  dayNameCurrent: {
    color: Colors.surface,
  },
  dayDate: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  dayDateCurrent: {
    color: Colors.surface,
  },
  calendarGrid: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    minWidth: 140,
  },
  calendarCell: {
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    minHeight: 75,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  calendarCellTop: {
    borderTopWidth: 0,
  },
  calendarCellBottom: {
    borderBottomWidth: 0,
  },
  calendarCellUpcoming: {
    backgroundColor: '#ecfdf5',
    borderBottomColor: Colors.primary,
  },
  calendarSlotName: {
    ...Typography.label,
    color: Colors.text.secondary,
    fontWeight: '600',
    fontSize: 9,
  },
  calendarMealName: {
    ...Typography.bodySm,
    color: Colors.text.primary,
    marginTop: Spacing.xs,
    textAlign: 'center',
    fontWeight: '600',
    minHeight: 45,
  },

  /* Current Meal Section */
  currentMealSection: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.text.secondary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Meal Card */
  mealCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mealCardTop: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  slotLabel: {
    ...Typography.label,
    color: Colors.surface,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mealCardContent: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  mealName: {
    ...Typography.large,
    color: Colors.text.primary,
    lineHeight: 44,
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  notesContainer: {
    backgroundColor: Colors.background,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  notesLabel: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  notesText: {
    ...Typography.bodySm,
    color: Colors.text.primary,
    lineHeight: 20,
  },

  /* Meals Container - New Design */
  mealsContainer: {
    marginBottom: Spacing.xl,
  },
  mealPair: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: Spacing.lg,
  },
  mealBadge: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
  },
  currentBadge: {
    backgroundColor: Colors.primary,
  },
  nextBadge: {
    backgroundColor: Colors.secondary,
  },
  mealBadgeText: {
    ...Typography.label,
    color: Colors.surface,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
  },
  mealDisplay: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  currentMealDisplay: {
    backgroundColor: Colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  nextMealDisplay: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
  },
  mealContentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealContentLeft: {
    flex: 1,
  },
  speakerIcon: {
    marginLeft: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
  },
  speakerIconActive: {
    backgroundColor: Colors.primary,
  },
  speakerText: {
    fontSize: 28,
  },
  mealSlot: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  mealNameLarge: {
    ...Typography.large,
    color: Colors.text.primary,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  mealNotes: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    lineHeight: 18,
    marginTop: Spacing.xs,
  },

  /* Next Meal Section */
  nextMealSection: {
    marginBottom: Spacing.lg,
  },
  nextMealCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderLeftWidth: 5,
    borderLeftColor: Colors.secondary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  nextMealContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  nextMealFormat: {
    ...Typography.subheading,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  nextMealName: {
    ...Typography.subheading,
    color: Colors.primary,
    fontWeight: '700',
    marginLeft: 0,
  },

  /* Buttons */
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  buttonText: {
    ...Typography.heading,
    color: Colors.surface,
    fontWeight: '700',
  },
  buttonSubtext: {
    ...Typography.bodySm,
    color: Colors.surface,
    marginTop: Spacing.xs,
  },
  secondaryButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },

  /* Refresh Button */
  refreshButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  refreshButtonText: {
    ...Typography.body,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
});
