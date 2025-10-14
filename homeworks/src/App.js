import React, { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import './App.css';


export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");
  const [lang, setLang] = useState("ru");

  // Локализация
  const translations = {
    ru: {
      title: "Список задач",
      newTaskPlaceholder: "Введите задачу...",
      searchPlaceholder: "Поиск по задачам...",
      add: "Добавить",
      all: "Все",
      active: "Активные",
      done: "Завершённые",
      sortDate: "По дате",
      sortPriority: "По приоритету",
      high: "Высокий",
      medium: "Средний",
      low: "Низкий",
      noTasks: "Нет задач",
      lang: "Язык",
    },
    en: {
      title: "Todo List",
      newTaskPlaceholder: "Enter a task...",
      searchPlaceholder: "Search tasks...",
      add: "Add",
      all: "All",
      active: "Active",
      done: "Completed",
      sortDate: "By date",
      sortPriority: "By priority",
      high: "High",
      medium: "Medium",
      low: "Low",
      noTasks: "No tasks yet",
      lang: "Language",
    },
  };

  const t = translations[lang];

  // === localStorage ===
  useEffect(() => {
    try {
      const data = localStorage.getItem("tasks");
      if (data) setTasks(JSON.parse(data));
    } catch {
      console.warn("Ошибка загрузки данных из localStorage");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  // === Добавление задачи ===
  function addTask() {
    const trimmed = text.trim();
    if (!trimmed) return;

    const duplicate = tasks.find(t => t.text.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      alert(lang === "ru" ? "Такая задача уже есть!" : "Task already exists!");
      return;
    }

    const newTask = {
      id: nanoid(),
      text: trimmed,
      completed: false,
      priority,
      date: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setText("");
  }

  // === Изменение состояния ===
  function toggleTask(id) {
    setTasks(tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }

  function deleteTask(id) {
    setTasks(tasks.filter(t => t.id !== id));
  }

  // === Фильтрация, поиск и сортировка ===
  const visibleTasks = tasks
    .filter(t => {
      if (filter === "active") return !t.completed;
      if (filter === "done") return t.completed;
      return true;
    })
    .filter(t => t.text.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "priority") {
        const order = { high: 3, medium: 2, low: 1 };
        return order[b.priority] - order[a.priority];
      }
      return new Date(b.date) - new Date(a.date);
    });

  return (
    <div className="todo-container">
      <h2>{t.title}</h2>

      <div className="todo-input">
        <input
          type="text"
          placeholder={t.newTaskPlaceholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="high">{t.high}</option>
          <option value="medium">{t.medium}</option>
          <option value="low">{t.low}</option>
        </select>
        <button onClick={addTask}>{t.add}</button>
      </div>

      <div className="todo-filters">
        <button onClick={() => setFilter("all")}>{t.all}</button>
        <button onClick={() => setFilter("active")}>{t.active}</button>
        <button onClick={() => setFilter("done")}>{t.done}</button>
      </div>

      <div className="todo-controls">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date">{t.sortDate}</option>
            <option value="priority">{t.sortPriority}</option>
          </select>
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="ru">Рус</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>

      <ul className="todo-list">
        {visibleTasks.length ? (
          visibleTasks.map((task) => (
            <li key={task.id} className={task.completed ? "done" : ""}>
              <span onClick={() => toggleTask(task.id)}>
                {task.text} <em>({t[task.priority]})</em>
              </span>
              <button onClick={() => deleteTask(task.id)}>✕</button>
            </li>
          ))
        ) : (
          <p className="no-tasks">{t.noTasks}</p>
        )}
      </ul>
    </div>
  );
}
