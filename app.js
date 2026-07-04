const STORAGE_KEY = "urduAttendanceStudents";

const form = document.querySelector("#student-form");
const nameInput = document.querySelector("#student-name");
const message = document.querySelector("#form-message");
const list = document.querySelector("#student-list");
const emptyState = document.querySelector("#empty-state");
const resetButton = document.querySelector("#reset-button");
const presentCount = document.querySelector("#present-count");
const absentCount = document.querySelector("#absent-count");
const totalCount = document.querySelector("#total-count");

let students = loadStudents();

function loadStudents() {
  const savedStudents = localStorage.getItem(STORAGE_KEY);
  return savedStudents ? JSON.parse(savedStudents) : [];
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function addStudent(name) {
  const cleanName = name.trim();
  if (!cleanName) return;

  students.push({
    id: createStudentId(),
    name: cleanName,
    status: "pending",
  });
  saveStudents();
  render();
  message.textContent = `${cleanName} فہرست میں شامل ہو گیا۔`;
}

function updateStatus(id, status) {
  students = students.map((student) =>
    student.id === id ? { ...student, status } : student,
  );
  saveStudents();
  render();
}

function resetAttendance() {
  students = students.map((student) => ({ ...student, status: "pending" }));
  saveStudents();
  render();
  message.textContent = "آج کی حاضری صاف کر دی گئی۔";
}

function createStudentId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getStatusLabel(status) {
  if (status === "present") return "حاضر";
  if (status === "absent") return "غیر حاضر";
  return "ابھی نشان نہیں لگا";
}

function render() {
  list.innerHTML = "";
  emptyState.hidden = students.length > 0;

  const presentTotal = students.filter((student) => student.status === "present").length;
  const absentTotal = students.filter((student) => student.status === "absent").length;

  presentCount.textContent = presentTotal;
  absentCount.textContent = absentTotal;
  totalCount.textContent = students.length;

  students.forEach((student) => {
    const item = document.createElement("li");
    item.className = "student-item";

    const details = document.createElement("div");
    const studentName = document.createElement("span");
    studentName.className = "student-name";
    studentName.textContent = student.name;

    const statusText = document.createElement("span");
    statusText.className = "status-text";
    statusText.textContent = getStatusLabel(student.status);

    details.append(studentName, statusText);

    const actions = document.createElement("div");
    actions.className = "action-buttons";

    const presentButton = createStatusButton(student, "present", "حاضر");
    const absentButton = createStatusButton(student, "absent", "غیر حاضر");

    actions.append(presentButton, absentButton);
    item.append(details, actions);
    list.append(item);
  });
}

function createStatusButton(student, status, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `status-button ${status}`;
  button.textContent = label;
  button.setAttribute("aria-pressed", String(student.status === status));

  if (student.status === status) {
    button.classList.add("active");
  }

  button.addEventListener("click", () => updateStatus(student.id, status));
  return button;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addStudent(nameInput.value);
  form.reset();
  nameInput.focus();
});

resetButton.addEventListener("click", resetAttendance);

render();
