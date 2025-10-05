import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Todo } from '../types/todo';

interface Props {
    item: Todo;
    onToggle: (id: number) => void;
    onDelete: (id: number) => void;
}

const TodoItem: React.FC<Props> = ({ item, onToggle, onDelete }) => {
    return (
        <View style={styles.item}>
            <TouchableOpacity style={styles.left} onPress={() => onToggle(item.id)}>
                <Icon
                    name={item.completed ? 'check-circle' : 'radio-button-unchecked'}
                    size={24}
                    color={item.completed ? '#4CAF50' : '#aaa'}
                />
                <Text style={[styles.text, item.completed && styles.completed]}>
                    {item.title}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item.id)}>
                <Icon name="delete" size={24} color="#FF3B30" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        elevation: 2,
    },
    left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    text: { fontSize: 16, color: '#333', marginLeft: 10, flexShrink: 1 },
    completed: { textDecorationLine: 'line-through', color: '#aaa' },
});

export default TodoItem;
