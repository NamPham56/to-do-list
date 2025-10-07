import React, { useEffect, useState } from 'react';
import {
    View,
    TextInput,
    FlatList,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, useTheme, Provider as PaperProvider, Button, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Todo } from '../types/todo';
import TodoItem from '../components/TodoItem';
import { getTodos, addTodo, updateTodo, deleteTodo } from '../api/todoApi';

const STORAGE_KEY = '@todo_list';

const TodoListScreen: React.FC = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [text, setText] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const { colors } = useTheme();

    const fetchTodos = async () => {
        try {
            const data = await getTodos();
            setTodos(data);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
            // Nếu không load được thì lấy dữ liệu cục bộ
            const localData = await AsyncStorage.getItem(STORAGE_KEY);
            if (localData) setTodos(JSON.parse(localData));
            else Alert.alert('Lỗi', 'Không thể tải danh sách công việc 😥');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    const handleAdd = async () => {
        if (!text.trim()) return;
        const newTodo = { title: text.trim(), completed: false };
        const created = await addTodo(newTodo);
        const updatedList = [...todos, created];
        setTodos(updatedList);
        setText('');
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    };

    const handleToggle = async (id: number) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;
        const updated = await updateTodo(id, { completed: !todo.completed });
        const updatedList = todos.map(t => (t.id === id ? updated : t));
        setTodos(updatedList);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    };

    const handleDelete = async (id: number) => {
        await deleteTodo(id);
        const updatedList = todos.filter(t => t.id !== id);
        setTodos(updatedList);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    };

    const handleMarkAllDone = async () => {
        const updatedList = todos.map(t => ({ ...t, completed: true }));
        setTodos(updatedList);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
        Alert.alert('🎉 Hoàn tất', 'Tất cả công việc đã hoàn thành!');
    };

    const filteredTodos = todos.filter(t => {
        if (filter === 'active') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
    }).filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

    const remainingTasks = todos.filter(t => !t.completed).length;

    if (loading)
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
            </View>
        );

    return (
        <PaperProvider>
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={styles.title}>✨ To-Do List Pro</Text>
                <Text style={styles.subtitle}>
                    {remainingTasks > 0
                        ? `${remainingTasks} công việc chưa hoàn thành`
                        : 'Tất cả đã xong 🎉'}
                </Text>

                {/* Ô tìm kiếm */}
                <View style={styles.searchWrapper}>
                    <Icon name="search" size={22} color="#888" />
                    <TextInput
                        style={styles.input}
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor="#999"
                    />
                </View>

                {/* Ô thêm công việc */}
                <View style={styles.inputRow}>
                    <View style={styles.inputWrapper}>
                        <Icon name="edit" size={22} color="#888" style={{ marginRight: 8 }} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập công việc..."
                            value={text}
                            onChangeText={setText}
                            placeholderTextColor="#999"
                        />
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                        <Icon name="add-task" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Nút lọc */}
                <View style={styles.filterRow}>
                    <Chip
                        selected={filter === 'all'}
                        onPress={() => setFilter('all')}
                        style={styles.chip}>
                        Tất cả
                    </Chip>
                    <Chip
                        selected={filter === 'active'}
                        onPress={() => setFilter('active')}
                        style={styles.chip}>
                        Chưa xong
                    </Chip>
                    <Chip
                        selected={filter === 'completed'}
                        onPress={() => setFilter('completed')}
                        style={styles.chip}>
                        Đã xong
                    </Chip>
                </View>

                {/* Danh sách công việc */}
                <FlatList
                    data={filteredTodos}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TodoItem item={item} onToggle={handleToggle} onDelete={handleDelete} />
                    )}
                    contentContainerStyle={{ paddingVertical: 10 }}
                />

                {/* Nút hoàn thành tất cả */}
                {todos.length > 0 && (
                    <Button
                        mode="contained"
                        icon="check-all"
                        onPress={handleMarkAllDone}
                        style={{ marginTop: 10, backgroundColor: '#007AFF' }}>
                        Hoàn thành tất cả
                    </Button>
                )}
            </SafeAreaView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 4, color: '#333' },
    subtitle: { textAlign: 'center', color: '#666', marginBottom: 16 },
    inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        elevation: 2,
    },
    input: { flex: 1, fontSize: 16, color: '#333' },
    addButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 10,
        marginLeft: 10,
        elevation: 2,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        elevation: 2,
        marginBottom: 10,
    },
    filterRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
    chip: { backgroundColor: '#f0f0f0' },
});

export default TodoListScreen;
