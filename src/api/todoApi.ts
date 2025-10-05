import { Todo } from '../types/todo';

const API_URL = 'http://192.168.1.222:3000/todos'; // Dùng 10.0.2.2 cho Android Emulator

export const getTodos = async (): Promise<Todo[]> => {
    const res = await fetch(API_URL);
    return res.json();
};

export const addTodo = async (todo: Omit<Todo, 'id'>): Promise<Todo> => {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo),
    });
    return res.json();
};

export const updateTodo = async (id: number, todo: Partial<Todo>): Promise<Todo> => {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo),
    });
    return res.json();
};

export const deleteTodo = async (id: number): Promise<void> => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
};
