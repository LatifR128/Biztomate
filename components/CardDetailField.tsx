import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, Platform } from 'react-native';
import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface CardDetailFieldProps {
  label: string;
  value: string;
  onUpdate: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

export default function CardDetailField({
  label,
  value,
  onUpdate,
  placeholder = 'Add information',
  multiline = false
}: CardDetailFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<TextInput>(null);
  
  // Update edit value when prop value changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);
  
  const handleSave = () => {
    onUpdate(editValue);
    setIsEditing(false);
    Keyboard.dismiss();
  };
  
  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    Keyboard.dismiss();
  };
  
  const handleStartEdit = () => {
    setIsEditing(true);
    // Small delay to ensure the input is rendered before focusing
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };
  
  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' && !multiline) {
      handleSave();
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              multiline && styles.multilineInput
            ]}
            value={editValue}
            onChangeText={setEditValue}
            placeholder={placeholder}
            multiline={multiline}
            autoFocus={false}
            returnKeyType={multiline ? 'default' : 'done'}
            onSubmitEditing={multiline ? undefined : handleSave}
            onKeyPress={handleKeyPress}
            blurOnSubmit={!multiline}
            enablesReturnKeyAutomatically={true}
            textAlignVertical={multiline ? 'top' : 'center'}
            maxLength={multiline ? 500 : 100}
          />
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton]} 
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark" size={16} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.valueContainer}>
          {value ? (
            <Text 
              style={styles.value}
              numberOfLines={multiline ? 0 : 1}
            >
              {value}
            </Text>
          ) : (
            <Text style={styles.placeholder}>{placeholder}</Text>
          )}
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleStartEdit}
            activeOpacity={0.7}
          >
            <Ionicons name="create" size={16} color={Colors.light.primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  value: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  placeholder: {
    fontSize: 16,
    color: Colors.light.disabled,
  },
  editButton: {
    padding: 4,
  },
  editContainer: {
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 8,
    padding: 10,
    color: Colors.light.text,
    backgroundColor: 'white',
    minHeight: 44,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
    paddingBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: Colors.light.success,
  },
  cancelButton: {
    backgroundColor: Colors.light.error,
  },
});