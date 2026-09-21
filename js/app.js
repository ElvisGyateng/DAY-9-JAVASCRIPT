import {
    getTasks,
    createTask,
    updateTask,
    deleteTask
} from "./api.js";


const tasksContainer = document.querySelector("#tasksContainer");
const statusMessage = document.querySelector("#statusMessage");

const totalTasks = document.querySelector("#totalTasks");
const completedTasks = document.querySelector("#completedTasks");
const pendingTasks = document.querySelector("#pendingTasks");

const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");
const retryButton = document.querySelector("#retryButton");

const taskForm = document.querySelector("#taskForm");
const taskTitle = document.querySelector("#taskTitle");
const submitButton = document.querySelector("#submitButton");
const formMessage = document.querySelector("#formMessage");


let tasks = [];


async function loadTasks() {
    statusMessage.textContent = "Loading tasks...";
    tasksContainer.innerHTML = "";
    retryButton.disabled = true;

    try {
        tasks = await getTasks();

        updateSummary();
        filterTasks();

    } catch (error) {
        console.error(error);

        statusMessage.textContent =
            "Sorry, tasks could not be loaded. Please try again.";

    } finally {
        retryButton.disabled = false;
    }
}


function displayTasks(taskList) {
    tasksContainer.innerHTML = "";

    if (taskList.length === 0) {
        statusMessage.textContent = "No tasks found.";
        return;
    }

    statusMessage.textContent = "";

    taskList.slice(0, 12).forEach((task) => {
        const taskCard = document.createElement("div");

        taskCard.classList.add("task-card");

        taskCard.innerHTML = `
            <h3>${task.title}</h3>
            <p>Status: ${task.completed ? "Completed" : "Pending"}</p>

            <div class="task-actions">
                <button class="toggle-button" data-id="${task.id}">
                    ${task.completed ? "Mark Pending" : "Mark Completed"}
                </button>

                <button class="delete-button" data-id="${task.id}">
                    Delete
                </button>
            </div>
        `;

        tasksContainer.appendChild(taskCard);
    });

    addTaskButtonListeners();
}


function updateSummary() {
    const completed = tasks.filter((task) => task.completed).length;
    const pending = tasks.filter((task) => !task.completed).length;

    totalTasks.textContent = tasks.length;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;
}


function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedStatus = statusFilter.value;

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm);

        const matchesStatus =
            selectedStatus === "all" ||
            (selectedStatus === "completed" && task.completed) ||
            (selectedStatus === "pending" && !task.completed);

        return matchesSearch && matchesStatus;
    });

    displayTasks(filteredTasks);
}


async function handleCreateTask(event) {
    event.preventDefault();

    const title = taskTitle.value.trim();

    if (title === "") {
        formMessage.textContent = "Please enter a task title.";
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Adding...";
    formMessage.textContent = "";

    try {
        const newTask = await createTask({
            title: title,
            completed: false,
            userId: 1
        });

        tasks.unshift(newTask);

        updateSummary();
        filterTasks();

        taskForm.reset();

        formMessage.textContent = "Task created successfully.";

    } catch (error) {
        console.error(error);

        formMessage.textContent =
            "Sorry, the task could not be created.";

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Add Task";
    }
}


function addTaskButtonListeners() {
    const toggleButtons =
        document.querySelectorAll(".toggle-button");

    const deleteButtons =
        document.querySelectorAll(".delete-button");


    toggleButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.id);

            toggleTask(id);
        });
    });


    deleteButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const id = Number(button.dataset.id);

            removeTask(id);
        });
    });
}


async function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);

    if (!task) {
        return;
    }

    try {
        const updatedTask = await updateTask(id, {
            completed: !task.completed
        });

        task.completed = updatedTask.completed;

        updateSummary();
        filterTasks();

    } catch (error) {
        console.error(error);

        statusMessage.textContent =
            "Sorry, the task could not be updated.";
    }
}


async function removeTask(id) {
    try {
        await deleteTask(id);

        tasks = tasks.filter((task) => task.id !== id);

        updateSummary();
        filterTasks();

    } catch (error) {
        console.error(error);

        statusMessage.textContent =
            "Sorry, the task could not be deleted.";
    }
}


searchInput.addEventListener("input", filterTasks);

statusFilter.addEventListener("change", filterTasks);

retryButton.addEventListener("click", loadTasks);

taskForm.addEventListener("submit", handleCreateTask);


loadTasks();