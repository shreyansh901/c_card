let employees = JSON.parse(localStorage.getItem("employees")) || [];
let nextId = Math.max(0, ...employees.map((e) => e.id)) + 1;

const employeeList = document.getElementById("employeeCards");
const searchInput = document.getElementById("searchInput");
const filterBtn = document.getElementById("filterBtn");
const addBtn = document.getElementById("addBtn");
const formContainer = document.getElementById("formContainer");

// Save data
function syncToLocal() {
  localStorage.setItem("employees", JSON.stringify(employees));
}

// Render all or filtered employees
function renderEmployees(filtered = employees) {
  employeeList.innerHTML = "";

  filtered.forEach((emp) => {
    const div = document.createElement("div");
    div.classList.add("employee-card");
    div.innerHTML = `
      <strong>ID:</strong> ${emp.id}<br>
      <strong>Name:</strong> ${emp.name}<br>
      <strong>Email:</strong> ${emp.email}<br>
      <strong>Department:</strong> ${emp.department}<br>
      <strong>Role:</strong> ${emp.role}<br><br>
      <button class="gray-btn" data-id="${emp.id}" data-action="edit">Edit</button>
      <button class="gray-btn" data-id="${emp.id}" data-action="delete">Delete</button>
    `;
    employeeList.appendChild(div);
  });

  // Edit button listeners
  document.querySelectorAll("button[data-action='edit']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-id"));
      const emp = employees.find((e) => e.id === id);
      showEditForm(emp);
    });
  });

  // Delete button listeners
  document.querySelectorAll("button[data-action='delete']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-id"));
      employees = employees.filter((e) => e.id !== id);
      syncToLocal();
      renderEmployees();
    });
  });
}

// Global search filter
filterBtn.addEventListener("click", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query)
  );
  renderEmployees(filtered);
});

// Sidebar filter apply
const applyBtn = document.getElementById("applyFilterBtn");
if (applyBtn) {
  applyBtn.addEventListener("click", () => {
    const name = document.getElementById("filterName").value.toLowerCase();
    const dept = document
      .getElementById("filterDepartment")
      .value.toLowerCase();
    const role = document.getElementById("filterRole").value.toLowerCase();

    const filtered = employees.filter((emp) => {
      const [fName] = emp.name.toLowerCase().split(" ");
      return (
        fName.includes(name) &&
        emp.department.toLowerCase().includes(dept) &&
        emp.role.toLowerCase().includes(role)
      );
    });

    renderEmployees(filtered);

    // Scroll and highlight first match
    if (filtered.length > 0) {
      setTimeout(() => {
        const firstCard = document.querySelector(".employee-card");
        if (firstCard) {
          firstCard.scrollIntoView({ behavior: "smooth", block: "center" });
          firstCard.classList.add("highlight");
          setTimeout(() => firstCard.classList.remove("highlight"), 2000);
        }
      }, 100);
    }
  });
}

// Sidebar filter reset
const resetBtn = document.getElementById("resetFilterBtn");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    document.getElementById("filterName").value = "";
    document.getElementById("filterDepartment").value = "";
    document.getElementById("filterRole").value = "";
    renderEmployees();
  });
}

// Add employee
addBtn.addEventListener("click", () => {
  showAddForm();
});

function showAddForm() {
  formContainer.innerHTML = formTemplate();

  document.getElementById("cancelBtn").addEventListener("click", () => {
    formContainer.innerHTML = "";
  });

  document.getElementById("employeeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const emp = getFormData();
    if (!emp) return;

    const existing = JSON.parse(localStorage.getItem("employees")) || [];
    const maxId =
      existing.length > 0 ? Math.max(...existing.map((e) => e.id)) : 0;
    emp.id = maxId + 1;

    employees.push(emp);
    syncToLocal();
    formContainer.innerHTML = "";
    renderEmployees();
  });
}

function showEditForm(emp) {
  const [firstName, lastName] = emp.name.split(" ");
  formContainer.innerHTML = formTemplate(emp, firstName, lastName);

  document.getElementById("cancelBtn").addEventListener("click", () => {
    formContainer.innerHTML = "";
  });

  document.getElementById("employeeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const updated = getFormData();
    if (!updated) return;

    emp.name = updated.name;
    emp.email = updated.email;
    emp.department = updated.department;
    emp.role = updated.role;

    syncToLocal();
    formContainer.innerHTML = "";
    renderEmployees();
  });
}

function formTemplate(emp = {}, firstName = "", lastName = "") {
  return `
    <div class="form-wrapper">
      <h2>${emp.id ? "Edit" : "Add"} Employee</h2>
      <form id="employeeForm" class="employee-form">
        <label for="firstName">First name</label>
        <input type="text" id="firstName" required value="${firstName || ""}" />

        <label for="lastName">Last name</label>
        <input type="text" id="lastName" required value="${lastName || ""}" />

        <div class="form-row">
          <div>
            <label for="email">Email</label>
            <input type="email" id="email" required value="${
              emp.email || ""
            }" />
          </div>
          <div>
            <label for="department">Department</label>
            <select id="department" required>
              <option value="">Select</option>
              <option ${emp.department === "HR" ? "selected" : ""}>HR</option>
              <option ${emp.department === "IT" ? "selected" : ""}>IT</option>
              <option ${
                emp.department === "Finance" ? "selected" : ""
              }>Finance</option>
              <option ${
                emp.department === "Marketing" ? "selected" : ""
              }>Marketing</option>
            </select>
          </div>
        </div>

        <label for="role">Role</label>
        <select id="role" required>
          <option value="">Select</option>
          <option ${emp.role === "Manager" ? "selected" : ""}>Manager</option>
          <option ${
            emp.role === "Developer" ? "selected" : ""
          }>Developer</option>
          <option ${emp.role === "Analyst" ? "selected" : ""}>Analyst</option>
          <option ${emp.role === "Designer" ? "selected" : ""}>Designer</option>
        </select>

        <div class="form-actions">
          <button type="button" id="cancelBtn" class="cancel-btn">Cancel</button>
          <button type="submit" class="add-btn">${
            emp.id ? "Update" : "Add"
          }</button>
        </div>
      </form>
    </div>
  `;
}

function getFormData() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const department = document.getElementById("department").value;
  const role = document.getElementById("role").value;

  if (!firstName || !lastName || !email || !department || !role) return null;

  return {
    name: `${firstName} ${lastName}`,
    email,
    department,
    role,
  };
}

// Initial render
renderEmployees();
