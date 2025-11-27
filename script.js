// Retrieve todo from local storage and initialize an empty array
let todo = JSON.parse(localStorage.getItem("todo")) || [];

// DOM elements
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const todoCount = document.getElementById("todoCount");
const completedCount = document.getElementById("completedCount");
const addButton = document.getElementById("btn");
const deleteButton = document.getElementById("deleteButton");
const dueDateInput = document.getElementById("dueDate");
const categorySelect = document.getElementById("category");
const errorMessage = document.getElementById("error-message");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const taskListContainer = document.getElementById("taskListContainer");

// Initialize application
document.addEventListener("DOMContentLoaded", function() {
    // Show loading state initially
    showLoadingState();
    
    // Simulate loading delay
    setTimeout(() => {
        initializeApp();
    }, 1000);
});

function initializeApp() {
    addButton.addEventListener("click", addTask);
    todoInput.addEventListener("keydown", function(event) {
        if(event.key === 'Enter') {
            event.preventDefault();
            addTask();
        }
    });
    deleteButton.addEventListener("click", deleteAllTasks);
    
    // Load and display tasks
    loadTasks();
}

function showLoadingState() {
    loadingState.classList.add("show");
    emptyState.classList.remove("show");
    taskListContainer.parentElement.classList.remove("show");
}

function hideLoadingState() {
    loadingState.classList.remove("show");
}

function showEmptyState() {
    emptyState.classList.add("show");
    taskListContainer.parentElement.classList.remove("show");
}

function showTaskList() {
    emptyState.classList.remove("show");
    taskListContainer.parentElement.classList.add("show");
}

function loadTasks() {
    // Simulate loading from storage
    setTimeout(() => {
        // Display tasks
        displayTasks();
        
        hideLoadingState();
        
        if (todo.length === 0) {
            showEmptyState();
        } else {
            showTaskList();
        }
    }, 500);
}

function addTask() {
    const newTask = todoInput.value.trim();
    const dueDate = dueDateInput.value;
    const category = categorySelect.value;
    
    if (!validateInput(newTask)) {
        return;
    }
    
    const task = {
        id: Date.now(),
        text: newTask,
        completed: false,
        dueDate: dueDate,
        category: category,
        createdAt: new Date().toISOString()
    };
    
    todo.push(task);
    saveToLocalStorage();
    todoInput.value = "";
    
    displayTasks();
    showTaskList();
}

function displayTasks() {
    todoList.innerHTML = "";
    
    for (let i = 0; i < todo.length; i++) {
        const item = todo[i];
        const div = document.createElement("div");
        div.className = `todo-item ${item.completed ? 'completed' : ''}`;
        div.setAttribute('data-id', item.id);
        
        const category = item.category || "personal";
        const categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);
        
        const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !item.completed;
        const dueDateText = item.dueDate ? 
            formatDateDisplay(item.dueDate) : 
            'No due date';
        
        div.innerHTML = `
            <div class="todo-checkbox-container">
                <input 
                    type="checkbox" 
                    class="todo-checkbox"
                    ${item.completed ? 'checked' : ''}
                    onchange="toggleTaskCompletion(${i})"
                />
                <span class="checkmark"></span>
            </div>
            <div class="todo-content">
                <div class="task-header">
                    <div class="task-title-section">
                        <p class="todo-text">${item.text}</p>
                    </div>
                </div>
                <div class="todo-meta">
                    <span class="category-badge category-${category}">
                        ${categoryDisplay}
                    </span>
                    <span class="due-date ${isOverdue ? 'overdue' : ''}">
                        ${dueDateText}
                        ${isOverdue ? ' (miss!)' : ''}
                    </span>
                </div>
            </div>
            <div class="todo-actions">
                <button class="delete-btn" onclick="deleteTask(${i})" title="Delete task">
                    <svg class="delete-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>
            </div>
        `;
        
        todoList.appendChild(div);
    }
    
    updateTaskCounter();
}

function toggleTaskCompletion(index) {
    todo[index].completed = !todo[index].completed;
    saveToLocalStorage();
    displayTasks();
}

function deleteTask(index) {
    if (confirm("Are you sure you want to delete this task?")) {
        todo.splice(index, 1);
        saveToLocalStorage();
        displayTasks();
        
        if (todo.length === 0) {
            showEmptyState();
        }
    }
}

function deleteAllTasks() {
    if (todo.length === 0) {
        alert("No tasks to delete!");
        return;
    }
    
    if (confirm("Are you sure you want to delete ALL tasks?")) {
        todo = [];
        saveToLocalStorage();
        displayTasks();
        showEmptyState();
    }
}

function validateInput(taskText) {
    if (taskText.trim() === "") {
        showError("Task name cannot be empty!");
        return false;
    }
    
    if (taskText.length > 100) {
        showError("Task name is too long (max 100 characters)");
        return false;
    }
    
    clearError();
    return true;
}

function showError(message) {
    errorMessage.textContent = message;
    todoInput.style.borderColor = "#e53e3e";
}

function clearError() {
    errorMessage.textContent = "";
    todoInput.style.borderColor = "#475569"; // Dark theme border color
}

function updateTaskCounter() {
    const totalTasks = todo.length;
    let completedTasks = 0;
    
    for (let i = 0; i < todo.length; i++) {
        if (todo[i].completed) {
            completedTasks++;
        }
    }
    
    todoCount.textContent = totalTasks;
    completedCount.textContent = completedTasks;
}

function formatDateDisplay(dateString) {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function saveToLocalStorage() {
    localStorage.setItem("todo", JSON.stringify(todo));
}