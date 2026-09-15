let tasks = [];

let currentPage = "active";


// =============================
// ELEMENTS
// =============================

const taskInput =
    document.getElementById("taskInput");

const addTaskButton =
    document.getElementById("addTask");

const taskList =
    document.getElementById("taskList");

const remainingCount =
    document.getElementById("remainingCount");

const tabs =
    document.querySelectorAll(".tab");

const detailsToggle =
    document.getElementById("detailsToggle");

const detailsPanel =
    document.getElementById("detailsPanel");

const deadlineDate =
    document.getElementById("deadlineDate");

const deadlineTime =
    document.getElementById("deadlineTime");


// Priority dropdown

const priorityDropdown =
    document.getElementById("priorityDropdown");

const priorityMenu =
    document.getElementById("priorityMenu");

const priorityValue =
    document.getElementById("priorityValue");

const priorityOptions =
    document.querySelectorAll(".priority-option");


// Current priority

let selectedPriority = "Medium";


// =============================
// PRIORITY DROPDOWN
// =============================

priorityDropdown.addEventListener(
    "click",
    function (event) {

        event.stopPropagation();

        priorityMenu.classList.toggle("show");

        priorityDropdown.classList.toggle("open");

    }
);


// Select priority

priorityOptions.forEach(function (option) {

    option.addEventListener(
        "click",
        function () {

            selectedPriority =
                option.dataset.value;


            priorityValue.textContent =
                selectedPriority.toLowerCase();


            // Remove selected state

            priorityOptions.forEach(
                function (item) {

                    item.classList.remove(
                        "selected"
                    );

                }
            );


            // Select current option

            option.classList.add("selected");


            // Close dropdown

            priorityMenu.classList.remove(
                "show"
            );

            priorityDropdown.classList.remove(
                "open"
            );

        }
    );

});


// Close dropdown when clicking outside

document.addEventListener(
    "click",
    function () {

        priorityMenu.classList.remove(
            "show"
        );

        priorityDropdown.classList.remove(
            "open"
        );

    }
);


// =============================
// DETAILS TOGGLE
// =============================

detailsToggle.addEventListener(
    "click",
    function () {

        detailsPanel.classList.toggle(
            "show"
        );


        if (
            detailsPanel.classList.contains(
                "show"
            )
        ) {

            detailsToggle.textContent =
                "- details";

        } else {

            detailsToggle.textContent =
                "+ details";

        }

    }
);


// =============================
// ADD TASK
// =============================

addTaskButton.addEventListener(
    "click",
    addTask
);


taskInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            addTask();

        }

    }
);


function addTask() {

    const title =
        taskInput.value.trim();


    // Reject empty task

    if (title === "") {

        taskInput.focus();

        return;

    }


    // Automatic creation date/time

    const createdAt =
        new Date();


    // Calculate deadline

    const deadline =
        calculateDeadline(
            createdAt,
            deadlineDate.value,
            deadlineTime.value
        );


    // Create task

    const task = {

        id: Date.now(),

        title: title,

        priority: selectedPriority,

        createdAt:
            createdAt.toISOString(),

        deadline:
            deadline.toISOString(),

        completed: false

    };


    tasks.push(task);


    saveTasks();


    // Reset task input

    taskInput.value = "";


    // Reset deadline

    deadlineDate.value = "";

    deadlineTime.value = "";


    // Reset details

    detailsPanel.classList.remove(
        "show"
    );

    detailsToggle.textContent =
        "+ details";


    renderTasks();


    taskInput.focus();

}


// =============================
// DEADLINE CALCULATION
// =============================

function calculateDeadline(
    createdAt,
    selectedDate,
    selectedTime
) {


    // -------------------------
    // CASE 1
    // No date + no time
    // 24 hours from creation
    // -------------------------

    if (
        selectedDate === "" &&
        selectedTime === ""
    ) {

        const deadline =
            new Date(createdAt);


        deadline.setTime(
            deadline.getTime() +
            24 * 60 * 60 * 1000
        );


        return deadline;

    }


    // -------------------------
    // CASE 2
    // Date only
    // Selected date +
    // creation time
    // -------------------------

    if (
        selectedDate !== "" &&
        selectedTime === ""
    ) {

        const deadline =
            new Date(createdAt);


        const [year, month, day] =
            selectedDate
                .split("-")
                .map(Number);


        deadline.setFullYear(
            year,
            month - 1,
            day
        );


        return deadline;

    }


    // -------------------------
    // CASE 3
    // Time only
    // -------------------------

    if (
        selectedDate === "" &&
        selectedTime !== ""
    ) {

        const deadline =
            new Date(createdAt);


        const [hours, minutes] =
            selectedTime
                .split(":")
                .map(Number);


        deadline.setHours(
            hours,
            minutes,
            0,
            0
        );


        // If today's time has passed,
        // use tomorrow.

        if (
            deadline.getTime() <=
            createdAt.getTime()
        ) {

            deadline.setDate(
                deadline.getDate() + 1
            );

        }


        return deadline;

    }


    // -------------------------
    // CASE 4
    // Date + time
    // -------------------------

    const deadline =
        new Date(createdAt);


    const [year, month, day] =
        selectedDate
            .split("-")
            .map(Number);


    const [hours, minutes] =
        selectedTime
            .split(":")
            .map(Number);


    deadline.setFullYear(
        year,
        month - 1,
        day
    );


    deadline.setHours(
        hours,
        minutes,
        0,
        0
    );


    return deadline;

}


// =============================
// RENDER TASKS
// =============================

function renderTasks() {

    taskList.innerHTML = "";


    // Filter page

    let visibleTasks =
        tasks.filter(function (task) {

            if (
                currentPage === "active"
            ) {

                return !task.completed;

            }


            return task.completed;

        });


    // =========================
    // SORT
    // =========================

    const priorityOrder = {

        High: 1,

        Medium: 2,

        Low: 3

    };


    visibleTasks.sort(
        function (a, b) {

            const priorityDifference =
                priorityOrder[a.priority] -
                priorityOrder[b.priority];


            // Priority first

            if (
                priorityDifference !== 0
            ) {

                return priorityDifference;

            }


            // Deadline second

            return (
                new Date(a.deadline) -
                new Date(b.deadline)
            );

        }
    );


    // =========================
    // EMPTY STATE
    // =========================

    if (
        visibleTasks.length === 0
    ) {

        const emptyState =
            document.createElement("div");


        emptyState.className =
            "empty-state";


        if (
            currentPage === "active"
        ) {

            emptyState.textContent =
                "No active tasks. You're all caught up!";

        } else {

            emptyState.textContent =
                "No completed tasks yet.";

        }


        taskList.appendChild(
            emptyState
        );


        updateRemainingCount();

        return;

    }


    // =========================
    // TASK CARDS
    // =========================

    visibleTasks.forEach(
        function (task) {


            // CARD

            const card =
                document.createElement("div");


            card.className =
                `task-card ${task.priority.toLowerCase()}`;


            if (task.completed) {

                card.classList.add(
                    "completed"
                );

            }


            // -------------------------
            // HEADER
            // -------------------------

            const header =
                document.createElement("div");


            header.className =
                "task-header";


            // CHECKBOX

            const checkbox =
                document.createElement("input");


            checkbox.type =
                "checkbox";


            checkbox.className =
                "task-check";


            checkbox.checked =
                task.completed;


            checkbox.addEventListener(
                "change",
                function () {

                    toggleTask(task.id);

                }
            );


            // TITLE

            const title =
                document.createElement("span");


            title.className =
                "task-title";


            title.textContent =
                task.title;


            // PRIORITY BADGE

            const badge =
                document.createElement("span");


            badge.className =
                "priority-badge";


            badge.textContent =
                task.priority.toUpperCase();


            header.appendChild(
                checkbox
            );

            header.appendChild(
                title
            );

            header.appendChild(
                badge
            );


            // -------------------------
            // DETAILS
            // -------------------------

            const details =
                document.createElement("div");


            details.className =
                "task-details";


            const created =
                document.createElement("div");


            created.textContent =
                `Created: ${formatDate(
                    task.createdAt
                )}`;


            const due =
                document.createElement("div");


            due.textContent =
                `Due: ${getDeadlineText(
                    task.deadline
                )}`;


            details.appendChild(
                created
            );

            details.appendChild(
                due
            );


            // -------------------------
            // DELETE
            // -------------------------

            const deleteButton =
                document.createElement("button");


            deleteButton.className =
                "delete-btn";


            deleteButton.textContent =
                "Delete";


            deleteButton.addEventListener(
                "click",
                function () {

                    deleteTask(task.id);

                }
            );


            // -------------------------
            // CARD
            // -------------------------

            card.appendChild(
                header
            );

            card.appendChild(
                details
            );

            card.appendChild(
                deleteButton
            );


            taskList.appendChild(
                card
            );

        }
    );


    updateRemainingCount();

}


// =============================
// COMPLETE / UNCOMPLETE
// =============================

function toggleTask(id) {

    let wasCompleted = false;


    tasks = tasks.map(
        function (task) {

            if (task.id === id) {

                wasCompleted =
                    task.completed;


                task.completed =
                    !task.completed;

            }


            return task;

        }
    );


    saveTasks();


    // Celebration only when
    // completing a task

    if (!wasCompleted) {

        showCompletionEmojis();

    }


    renderTasks();

}


// =============================
// COMPLETION EMOJIS
// =============================

function showCompletionEmojis() {

    const emojis = [
        "😍",
        "😘",
        "😉"
    ];


    const count =
        Math.floor(
            Math.random() * 5
        ) + 8;


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const emoji =
            document.createElement("div");


        emoji.className =
            "celebration-emoji";


        // Only these emojis

        emoji.textContent =
            emojis[
                Math.floor(
                    Math.random() *
                    emojis.length
                )
            ];


        // Random horizontal position

        emoji.style.setProperty(
            "--emoji-left",
            `${Math.random() * 100}vw`
        );


        // Larger emojis

        emoji.style.setProperty(
            "--emoji-size",
            `${26 + Math.random() * 14}px`
        );


        // Slower fall

        emoji.style.setProperty(
            "--emoji-duration",
            `${1.8 + Math.random() * 1.2}s`
        );


        // Slight delay

        emoji.style.animationDelay =
            `${Math.random() * 0.35}s`;


        document.body.appendChild(
            emoji
        );


        // Remove afterwards

        setTimeout(
            function () {

                emoji.remove();

            },
            3500
        );

    }

}


// =============================
// DELETE
// =============================

function deleteTask(id) {

    tasks =
        tasks.filter(
            function (task) {

                return task.id !== id;

            }
        );


    saveTasks();

    renderTasks();

}


// =============================
// DATE FORMAT
// =============================

function formatDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleString(
        [],
        {
            day: "2-digit",

            month: "short",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit"
        }
    );

}


// =============================
// DEADLINE DISPLAY
// =============================

function getDeadlineText(
    deadlineString
) {

    const deadline =
        new Date(deadlineString);


    const now =
        new Date();


    const difference =
        deadline.getTime() -
        now.getTime();


    // Overdue

    if (difference < 0) {

        return "Overdue";

    }


    const hours =
        difference /
        (1000 * 60 * 60);


    // Today

    if (hours < 24) {

        return "Due today";

    }


    // Tomorrow

    if (hours < 48) {

        return "Due tomorrow";

    }


    // Exact date

    return formatDate(
        deadlineString
    );

}


// =============================
// REMAINING COUNT
// =============================

function updateRemainingCount() {

    const remaining =
        tasks.filter(
            function (task) {

                return !task.completed;

            }
        ).length;


    remainingCount.textContent =
        `${remaining} ${
            remaining === 1
                ? "task"
                : "tasks"
        } remaining`;

}


// =============================
// TABS
// =============================

tabs.forEach(
    function (tab) {

        tab.addEventListener(
            "click",
            function () {

                currentPage =
                    tab.dataset.filter;


                tabs.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                tab.classList.add(
                    "active"
                );


                renderTasks();

            }
        );

    }
);


// =============================
// LOCAL STORAGE
// =============================

function saveTasks() {

    localStorage.setItem(
        "ianaTasks",
        JSON.stringify(tasks)
    );

}


function loadTasks() {

    const savedTasks =
        localStorage.getItem(
            "ianaTasks"
        );


    if (savedTasks) {

        try {

            tasks =
                JSON.parse(savedTasks);

        } catch (error) {

            tasks = [];

        }

    }


    renderTasks();

}


// =============================
// START APP
// =============================

loadTasks();