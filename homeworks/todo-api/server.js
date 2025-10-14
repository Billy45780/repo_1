const express = require('express');
const app = express();
app.use(express.json());

let tasks = [
  { id: 1, title: 'Купить хлеб', completed: false },
  { id: 2, title: 'Сделать домашку по REST API', completed: false }
];

// 1. Получить список всех задач
app.get('/tasks', (req, res) => {
  res.status(200).json(tasks);
});

// 2. Получить задачу по id
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.status(200).json(task);
});

// 3. Создать новую задачу
app.post('/tasks', (req, res) => {
  const { title, description, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const newTask = {
    id: tasks.length + 1,
    title,
    description: description || '',
    dueDate: dueDate || null,
    completed: false,
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

// 4. Обновить задачу (отметить как выполненную)
app.patch('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });

  Object.assign(task, req.body);
  res.status(200).json(task);
});

// 5. Удалить задачу
app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Task not found' });

  tasks.splice(index, 1);
  res.status(204).send();
});

app.listen(3000, () => console.log('✅ To-Do API running on http://localhost:3000'));
