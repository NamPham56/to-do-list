import React, { useEffect, useState } from 'react';
import {
    View,
    TextInput,
    FlatList,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Todo } from '../types/todo';
import TodoItem from '../components/TodoItem';
import { getTodos, addTodo, updateTodo, deleteTodo } from '../api/todoApi';

const TodoListScreen: React.FC = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTodos = async () => {
        try {
            const data = await getTodos();
            setTodos(data);
        } catch {
            Alert.alert('Lỗi', 'Không thể tải danh sách công việc 😥');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    const handleAdd = async () => {
        if (!text.trim()) return;
        const newTodo = { title: text, completed: false };
        const created = await addTodo(newTodo);
        setTodos([...todos, created]);
        setText('');
    };

    const handleToggle = async (id: number) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;
        const updated = await updateTodo(id, { completed: !todo.completed });
        setTodos(todos.map(t => (t.id === id ? updated : t)));
    };

    const handleDelete = async (id: number) => {
        await deleteTodo(id);
        setTodos(todos.filter(t => t.id !== id));
    };

    if (loading)
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
            </View>
        );

    const remainingTasks = todos.filter(t => !t.completed).length;

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>✨ To-Do List Pro</Text>
            <Text style={styles.subtitle}>
                {remainingTasks > 0
                    ? `${remainingTasks} công việc chưa hoàn thành`
                    : 'Tất cả đã xong 🎉'}
            </Text>

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

            <FlatList
                data={todos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TodoItem item={item} onToggle={handleToggle} onDelete={handleDelete} />
                )}
                contentContainerStyle={{ paddingVertical: 10 }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', padding: 16 },
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
});

export default TodoListScreen;
