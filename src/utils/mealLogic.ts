export interface Meal {
  day: string;
  slot: string;
  name_hindi: string;
  notes_hindi?: string;
}

export type SlotType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export const SLOTS: SlotType[] = ['breakfast', 'lunch', 'snack', 'dinner'];

export const SLOT_TIMES: Record<SlotType, { start: number; end: number }> = {
  breakfast: { start: 0, end: 10 },
  lunch: { start: 10, end: 14 },
  snack: { start: 14, end: 17 },
  dinner: { start: 17, end: 24 },
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function getSlotByTime(hour: number): SlotType {
  if (hour < 10) return 'breakfast';
  if (hour < 14) return 'lunch';
  if (hour < 17) return 'snack';
  return 'dinner';
}

export function getCurrentDayName(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();
  return days[today];
}

export function getCurrentMeal(meals: Meal[]): Meal | null {
  const now = new Date();
  const currentDay = getCurrentDayName();
  const currentSlot = getSlotByTime(now.getHours());

  const meal = meals.find(m => m.day === currentDay && m.slot === currentSlot);
  return meal || null;
}

interface MealPosition {
  dayIndex: number;
  slotIndex: number;
}

function getMealPosition(meals: Meal[], day: string, slot: string): MealPosition | null {
  for (let dayIdx = 0; dayIdx < DAYS.length; dayIdx++) {
    for (let slotIdx = 0; slotIdx < SLOTS.length; slotIdx++) {
      const meal = meals.find(m => m.day === DAYS[dayIdx] && m.slot === SLOTS[slotIdx]);
      if (meal && meal.day === day && meal.slot === slot) {
        return { dayIndex: dayIdx, slotIndex: slotIdx };
      }
    }
  }
  return null;
}

function findNextMealPosition(meals: Meal[], currentDay: string, currentSlot: string): { day: string; slot: string } | null {
  const uniqueDays = Array.from(new Set(meals.map(m => m.day)));
  const currentDayIdx = uniqueDays.findIndex(d => d === currentDay);
  const currentSlotIdx = SLOTS.findIndex(s => s === currentSlot);

  if (currentDayIdx === -1) {
    // Current day not in meal plan, go to first day, first slot
    const firstMeal = meals[0];
    return { day: firstMeal.day, slot: firstMeal.slot };
  }

  // Try next slot in current day
  for (let slotIdx = currentSlotIdx + 1; slotIdx < SLOTS.length; slotIdx++) {
    const meal = meals.find(m => m.day === currentDay && m.slot === SLOTS[slotIdx]);
    if (meal) {
      return { day: currentDay, slot: SLOTS[slotIdx] };
    }
  }

  // Go to next day, first slot
  for (let dayIdx = currentDayIdx + 1; dayIdx < uniqueDays.length; dayIdx++) {
    for (let slotIdx = 0; slotIdx < SLOTS.length; slotIdx++) {
      const meal = meals.find(m => m.day === uniqueDays[dayIdx] && m.slot === SLOTS[slotIdx]);
      if (meal) {
        return { day: uniqueDays[dayIdx], slot: SLOTS[slotIdx] };
      }
    }
  }

  // Wrap to first day
  const firstMeal = meals[0];
  return { day: firstMeal.day, slot: firstMeal.slot };
}

export function getNextMeal(meals: Meal[], currentDay: string, currentSlot: string): Meal | null {
  const nextPos = findNextMealPosition(meals, currentDay, currentSlot);
  if (!nextPos) return null;

  const nextMeal = meals.find(m => m.day === nextPos.day && m.slot === nextPos.slot);
  return nextMeal || null;
}

export function formatSlotLabel(slot: string): string {
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}
