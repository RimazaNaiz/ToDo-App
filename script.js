document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('btnAdd');
    const taskList = document.getElementById('task-list');
    const emptyImage = document.querySelector('.empty-image');
    const todosContainer = document.querySelector('.todos-container');
    const progressBar = document.getElementById('progress');
    const progressNumbers = document.getElementById('numbers');
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        if (body.classList.contains('dark-theme')) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    });
    
    const toggleEmptyState = () => {
        const emptyState = document.querySelector('.empty-state');
        if (taskList.children.length === 0) {
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
        }
    };
    
    const updateProgress = () => {
        const totalTasks = taskList.children.length;
        const completedTasks = taskList.querySelectorAll('.checkbox:checked').length;
        
        progressBar.style.width = totalTasks ? `${(completedTasks / totalTasks) * 100}%` : '0%';
        progressNumbers.textContent = `${completedTasks} / ${totalTasks}`;
        

        if (completedTasks === totalTasks && totalTasks > 0) {
            progressNumbers.style.color = 'var(--secondary-color)';
            progressNumbers.style.boxShadow = '0 0 15px var(--secondary-color)';
        } else {
            progressNumbers.style.color = 'var(--text-color)';
            progressNumbers.style.boxShadow = 'none';
        }
        

        saveTasks();
    };
    
    const saveTasks = () => {
        tasks = [];
        document.querySelectorAll('#task-list li').forEach(li => {
            tasks.push({
                text: li.querySelector('span').textContent,
                completed: li.querySelector('.checkbox').checked
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };
    
    const loadTasks = () => {
        tasks.forEach(task => {
            addTask(task.text, task.completed, false);
        });
        toggleEmptyState();
        updateProgress();
    };
    
    const addTask = (text, completed = false, save = true) => {
        const taskText = text || taskInput.value.trim();
        if (!taskText) {
            return;
        }
        
        const li = document.createElement('li');
        li.setAttribute('draggable', 'true');
        li.innerHTML = `
            <input type="checkbox" class="checkbox" ${completed ? 'checked' : ''} />
            <span>${taskText}</span>
            <div class="task-buttons">
                <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        
        const checkbox = li.querySelector('.checkbox');
        const span = li.querySelector('span');
        const editBtn = li.querySelector('.edit-btn');
        
        if (completed) {
            li.classList.add('completed');
            editBtn.disabled = true;
            editBtn.style.opacity = '0.5';
            editBtn.style.pointerEvents = 'none';
        }
        
        
        checkbox.addEventListener('change', () => {
            const isChecked = checkbox.checked;
            li.classList.toggle('completed', isChecked);
            editBtn.disabled = isChecked;
            editBtn.style.opacity = isChecked ? '0.5' : '1';
            editBtn.style.pointerEvents = isChecked ? 'none' : 'auto';
            updateProgress();
        });

        span.addEventListener('click', () => {
            if (!checkbox.checked) {
                const newText = prompt('Edit your task:', span.textContent);
                if (newText !== null && newText.trim() !== '') {
                    span.textContent = newText.trim();
                    updateProgress();
                }
            }
        });
        
        editBtn.addEventListener('click', () => {
            if (!checkbox.checked) {
                const newText = prompt('Edit your task:', span.textContent);
                if (newText !== null && newText.trim() !== '') {
                    span.textContent = newText.trim();
                    updateProgress();
                }
            }
        });
        
    
        li.querySelector('.delete-btn').addEventListener('click', () => {
            li.style.animation = 'fadeIn 0.3s ease reverse';
            setTimeout(() => {
                li.remove();
                toggleEmptyState();
                updateProgress();
            }, 300);
        });
        
    
        li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', ''); // Necessary for Firefox
            li.classList.add('dragging');
        });
        
        li.addEventListener('dragend', () => {
            li.classList.remove('dragging');
            updateProgress();
        });
        
        taskList.appendChild(li);
        taskInput.value = '';
        toggleEmptyState();
        
        if (save) {
            updateProgress();
        }
    };
    

    taskList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(taskList, e.clientY);
        const draggable = document.querySelector('.dragging');
        if (afterElement == null) {
            taskList.appendChild(draggable);
        } else {
            taskList.insertBefore(draggable, afterElement);
        }
    });
    
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
   
    addTaskBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addTask();
    });
    
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask();
        }
    });
    

    loadTasks();
});