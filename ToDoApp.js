import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Check, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import './App.css';

const TodoApp = () => {
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [inputText, setInputText] = useState('');
  const [purpose, setPurpose] = useState('');
  const [category, setCategory] = useState('personal');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [expandedTodo, setExpandedTodo] = useState(null);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
    checkReminders();
  }, [todos]);

  useEffect(() => {
    const intervalId = setInterval(checkReminders, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const checkReminders = () => {
    const now = new Date();
    todos.forEach(todo => {
      if (todo.reminder && !todo.reminderShown) {
        const reminderTime = new Date(todo.reminder);
        if (reminderTime <= now) {
          showNotification(todo);
          setTodos(prevTodos => 
            prevTodos.map(t => 
              t.id === todo.id ? { ...t, reminderShown: true } : t
            )
          );
        }
      }
    });
  };

  const showNotification = (todo) => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Todo Reminder", {
          body: todo.text,
          icon: "/favicon.ico"
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            showNotification(todo);
          }
        });
      }
    }
  };

  const addTodo = () => {
    if (inputText.trim()) {
      const reminder = reminderDate && reminderTime 
        ? new Date(`${reminderDate}T${reminderTime}`).toISOString()
        : null;

      const newTodo = {
        id: Date.now(),
        text: inputText,
        purpose: purpose,
        completed: false,
        category: category,
        reminder: reminder,
        reminderShown: false
      };
      setTodos([...todos, newTodo]);
      resetForm();
    }
  };

  const resetForm = () => {
    setInputText('');
    setPurpose('');
    setReminderDate('');
    setReminderTime('');
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
    if (expandedTodo === id) setExpandedTodo(null);
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setInputText(todo.text);
    setPurpose(todo.purpose);
    setCategory(todo.category);
    if (todo.reminder) {
      const reminderDate = new Date(todo.reminder);
      setReminderDate(reminderDate.toISOString().split('T')[0]);
      setReminderTime(reminderDate.toTimeString().slice(0, 5));
    }
  };

  const updateTodo = () => {
    if (inputText.trim()) {
      const reminder = reminderDate && reminderTime 
        ? new Date(`${reminderDate}T${reminderTime}`).toISOString()
        : null;

      setTodos(todos.map(todo =>
        todo.id === editingId ? { 
          ...todo, 
          text: inputText,
          purpose: purpose,
          category: category,
          reminder: reminder,
          reminderShown: false
        } : todo
      ));
      setEditingId(null);
      resetForm();
    }
  };

  const toggleExpand = (id) => {
    setExpandedTodo(expandedTodo === id ? null : id);
  };

  const formatReminderTime = (isoString) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="todo-container">
      <div className="todo-wrapper">
        <h1 className="todo-title">Todo App</h1>
        
        {/* Input Section */}
        <div className="input-section">
          <div className="input-row">
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="category-select"
            >
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="shopping">Shopping</option>
            </select>
            
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Add a new todo..."
              className="todo-input"
            />
          </div>

          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Add purpose or description (optional)"
            className="purpose-input"
          />

          <div className="reminder-inputs">
            <input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="date-input"
            />
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="time-input"
            />
          </div>
          
          {editingId ? (
            <button onClick={updateTodo} className="update-btn">
              <Check className="btn-icon" />
              Update Todo
            </button>
          ) : (
            <button onClick={addTodo} className="add-btn">
              <Plus className="btn-icon" />
              Add Todo
            </button>
          )}
        </div>

        {/* Todo List */}
        <div className="todo-list">
          {todos.map(todo => (
            <div
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <div className="todo-item-header">
                <div className="todo-item-content">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleComplete(todo.id)}
                    className="todo-checkbox"
                  />
                  <span className={`todo-text ${todo.completed ? 'completed-text' : ''}`}>
                    {todo.text}
                  </span>
                  {todo.reminder && (
                    <Bell className="reminder-icon" />
                  )}
                  <span className="category-tag">
                    {todo.category}
                  </span>
                </div>
                
                <div className="todo-actions">
                  <button
                    onClick={() => toggleExpand(todo.id)}
                    className="action-btn"
                  >
                    {expandedTodo === todo.id ? 
                      <ChevronUp className="action-icon" /> : 
                      <ChevronDown className="action-icon" />
                    }
                  </button>
                  {editingId !== todo.id && (
                    <button
                      onClick={() => startEditing(todo)}
                      className="action-btn edit"
                    >
                      <Edit className="action-icon" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="action-btn delete"
                  >
                    <Trash2 className="action-icon" />
                  </button>
                </div>
              </div>

              {expandedTodo === todo.id && (
                <div className="todo-details">
                  <p className="purpose-text">
                    <span className="detail-label">Purpose: </span>
                    {todo.purpose || 'No purpose added'}
                  </p>
                  {todo.reminder && (
                    <p className="reminder-text">
                      <span className="detail-label">Reminder: </span>
                      {formatReminderTime(todo.reminder)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {todos.length === 0 && (
          <div className="empty-state">
            No todos yet. Add one above!
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoApp;