import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  FlatList,
  TextInput,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/colors';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface GroceryItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function GroceryListScreen() {
  const { isListening, transcript, error, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([]);
  const [manualInput, setManualInput] = useState('');

  const addItemsFromTranscript = () => {
    if (!transcript.trim()) return;

    // Split by common delimiters and create items
    const items = transcript
      .split(/[,।\n]+/)
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);

    const newItems = items.map((item: string) => ({
      id: Math.random().toString(36).substr(2, 9),
      text: item,
      completed: false,
    }));

    setGroceryItems([...groceryItems, ...newItems]);
    resetTranscript();
  };

  const addManualItem = () => {
    if (!manualInput.trim()) return;

    const newItem: GroceryItem = {
      id: Math.random().toString(36).substr(2, 9),
      text: manualInput.trim(),
      completed: false,
    };

    setGroceryItems([...groceryItems, newItem]);
    setManualInput('');
  };

  const toggleItem = (id: string) => {
    setGroceryItems(
      groceryItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setGroceryItems(groceryItems.filter((item) => item.id !== id));
  };

  const clearList = () => {
    setGroceryItems([]);
  };

  const completedCount = groceryItems.filter((item) => item.completed).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>🛒 Grocery List</Text>
          <Text style={styles.subtitle}>
            {groceryItems.length} items • {completedCount} completed
          </Text>
        </View>

        {/* Speech Input Section */}
        <View style={styles.speechSection}>
          <Text style={styles.sectionLabel}>Voice Input</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              🎤 Speech recognition requires a development build. Use the text input below for now, or build with EAS.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPress={isListening ? stopListening : startListening}
            disabled={true}
          >
            <Text style={styles.micIcon}>{isListening ? '🎤' : '🎙️'}</Text>
            <Text style={styles.micButtonText}>{isListening ? 'Stop' : 'Speak (Unavailable)'}</Text>
          </TouchableOpacity>

          {transcript && (
            <View style={styles.transcriptBox}>
              <Text style={styles.transcriptLabel}>Recognized:</Text>
              <Text style={styles.transcriptText}>{transcript}</Text>
              <View style={styles.transcriptActions}>
                <TouchableOpacity
                  style={[styles.smallButton, styles.addButton]}
                  onPress={addItemsFromTranscript}
                >
                  <Text style={styles.smallButtonText}>✓ Add Items</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.smallButton, styles.clearButton]}
                  onPress={resetTranscript}
                >
                  <Text style={styles.smallButtonText}>✕ Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Manual Input Section */}
        <View style={styles.manualSection}>
          <Text style={styles.sectionLabel}>Or Type Item</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="e.g., 1kg aata, 2 onions..."
              placeholderTextColor={Colors.text.secondary}
              value={manualInput}
              onChangeText={setManualInput}
              editable={!isListening}
            />
            <TouchableOpacity
              style={[styles.addIconButton, !manualInput.trim() && styles.addIconButtonDisabled]}
              onPress={addManualItem}
              disabled={!manualInput.trim()}
            >
              <Text style={styles.addIconText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Grocery Items List */}
        {groceryItems.length > 0 && (
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionLabel}>Items</Text>
              {groceryItems.length > 0 && (
                <TouchableOpacity onPress={clearList}>
                  <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={groceryItems}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.itemRow}>
                  <TouchableOpacity
                    style={styles.checkBox}
                    onPress={() => toggleItem(item.id)}
                  >
                    {item.completed ? (
                      <Text style={styles.checkBoxChecked}>✓</Text>
                    ) : (
                      <View />
                    )}
                  </TouchableOpacity>

                  <Text
                    style={[
                      styles.itemText,
                      item.completed && styles.itemTextCompleted,
                    ]}
                  >
                    {item.text}
                  </Text>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteItem(item.id)}
                  >
                    <Text style={styles.deleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        )}

        {groceryItems.length === 0 && !transcript && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>Tap the mic or type to add items</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  header: {
    marginBottom: Spacing.xl,
  },
  appTitle: {
    ...Typography.large,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
  },

  /* Speech Section */
  speechSection: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.text.secondary,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Info Box */
  infoBox: {
    backgroundColor: '#dbeafe',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
    marginBottom: Spacing.md,
  },
  infoText: {
    ...Typography.bodySm,
    color: '#1e40af',
    fontWeight: '500',
    lineHeight: 18,
  },
  micButton: {
    backgroundColor: Colors.secondary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.md,
    opacity: 0.5,
  },
  micButtonActive: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    opacity: 1,
  },
  micIcon: {
    fontSize: 32,
  },
  micButtonText: {
    ...Typography.heading,
    color: Colors.surface,
    fontWeight: '700',
  },

  /* Transcript Box */
  transcriptBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.secondary,
    marginBottom: Spacing.md,
  },
  transcriptLabel: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  transcriptText: {
    ...Typography.body,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  transcriptActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  /* Error Box */
  errorBox: {
    backgroundColor: '#fee2e2',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: '#991b1b',
    fontWeight: '600',
  },
  smallButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: Colors.primary,
  },
  clearButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  smallButtonText: {
    ...Typography.bodySm,
    color: Colors.text.primary,
    fontWeight: '600',
  },

  /* Manual Input Section */
  manualSection: {
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addIconButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconButtonDisabled: {
    backgroundColor: Colors.border,
  },
  addIconText: {
    fontSize: 24,
    color: Colors.surface,
    fontWeight: '700',
  },

  /* List Section */
  listSection: {
    marginBottom: Spacing.xl,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  clearAllText: {
    ...Typography.bodySm,
    color: Colors.error,
    fontWeight: '600',
  },

  /* Item Row */
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  checkBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkBoxChecked: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  itemText: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
  },
  itemTextCompleted: {
    color: Colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    paddingHorizontal: Spacing.sm,
  },
  deleteText: {
    color: Colors.error,
    fontSize: 18,
    fontWeight: '700',
  },

  /* Empty State */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
