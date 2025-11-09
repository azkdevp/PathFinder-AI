// === CONFIG ===
const API_URL  = "https://pathfinder-246290474963.us-central1.run.app/api/generate";
const API_BASE = "https://pathfinder-246290474963.us-central1.run.app";

// === Starfield effect ===
function generateStarfield() {
  const field = document.getElementById("starfield");
  if (!field) return;
  for (let i = 0; i < 100; i++) {
    const s = document.createElement("div");
    s.className = "star";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.animationDelay = Math.random() * 3 + "s";
    field.appendChild(s);
  }
}

// === Navbar scroll effect ===
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (!navbar) return;
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

// === Elements (single-role) ===
const generateBtn   = document.getElementById("generateBtn");
const jobInput      = document.getElementById("jobInput");
const loader        = document.getElementById("loader");
const results       = document.getElementById("results");
const demoOutput    = document.getElementById("demoOutput");
const skillsGrid    = document.getElementById("skillsGrid");
const courseList    = document.getElementById("courseList");
const durationValue = document.getElementById("durationValue");
const salaryValue   = document.getElementById("salaryValue");
const downloadBtn   = document.getElementById("downloadBtn");

// === Compare section root (exists on page) ===
const compareSection = document.getElementById("compareResults");

// === Helper ===
function showLoader(show) {
  if (!loader) return;
  loader.style.display = show ? "block" : "none";
}

// Robustly parse possible ```json … ``` or "json\n{…}"
function parseAiJsonMaybe(text) {
  if (!text || typeof text !== "string") return null;
  let cleaned = text.replace(/```json|```/g, "").replace(/^json\s*/i, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const start = cleaned.indexOf("{");
  const end   = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(cleaned.slice(start, end + 1)); } catch {}
  }
  return null;
}

// === Fetch roadmap ===
async function fetchRoadmap(role) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_title: role }),
  });
  const data = await res.json();

  if (data.ai_text) {
    const parsed = parseAiJsonMaybe(data.ai_text);
    return parsed || { description: data.ai_text };
  }
  return data;
}

// === Generate single roadmap ===
async function generateRoadmap() {
  const role = (jobInput?.value || "").trim();
  if (!role) {
    alert("Please enter a job title!");
    return;
  }

  if (compareSection) compareSection.style.display = "none";
  demoOutput?.classList.add("visible");
  showLoader(true);
  if (results) results.style.display = "none";
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating…";
  }

  try {
    const data = await fetchRoadmap(role);
    populateResults(data, role);
  } catch (err) {
    console.error("Error fetching roadmap:", err);
    alert("Something went wrong. Please try again later.");
  } finally {
    showLoader(false);
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate My Roadmap";
    }
  }
}

// === Populate roadmap results ===
function populateResults(data, role) {
  if (results) results.style.display = "block";
  if (skillsGrid) skillsGrid.innerHTML = "";
  if (courseList) courseList.innerHTML = "";

  const skills  = Array.isArray(data.skills)  ? data.skills  : [];
  const courses = Array.isArray(data.courses) ? data.courses : [];

  if (skillsGrid) {
    if (skills.length) {
      skills.forEach((s) => {
        const chip = document.createElement("div");
        chip.className = "skill-chip";
        chip.textContent = s;
        skillsGrid.appendChild(chip);
      });
    } else {
      skillsGrid.innerHTML = "<p style='color:#aaa;'>No skills data found.</p>";
    }
  }

  if (courseList) {
    if (courses.length) {
      courses.forEach((c) => {
        const item = document.createElement("div");
        item.className = "course-item";
        const title = (c && c.title) ? c.title : "Course";
        const url   = (c && c.url)   ? c.url   : "#";
        item.innerHTML = `<a href="${url}" target="_blank" rel="noopener">${title}</a>`;
        courseList.appendChild(item);
      });
    } else {
      courseList.innerHTML = "<p style='color:#aaa;'>No courses data found.</p>";
    }
  }

  if (durationValue) durationValue.textContent = data.duration_months ? `${data.duration_months} months` : "N/A";
  if (salaryValue)   salaryValue.textContent   = data.avg_salary_usd || "N/A";

  if (downloadBtn) downloadBtn.onclick = () => downloadRoadmap(role, data);
}

// === Download roadmap ===
function downloadRoadmap(role, data) {
  const content = `
PathFinder AI - Career Roadmap
==============================

Role: ${role}

Top Skills:
${(data.skills || []).map((s, i) => `${i + 1}. ${s}`).join("\n")}

Recommended Courses:
${(data.courses || []).map((c, i) => `${i + 1}. ${c.title}\n   ${c.url}`).join("\n\n")}

Duration: ${data.duration_months || "N/A"} months
Avg Salary: ${data.avg_salary_usd || "N/A"}

Generated by PathFinder AI
`.trim();

  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${role.replace(/\s+/g, "_")}_Roadmap.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// === Compare Roles Logic ===
async function compareRoles(roleA, roleB) {
  const r = await fetch(`${API_BASE}/api/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role_a: roleA, role_b: roleB }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// Wire compare
document.getElementById("compareBtn")?.addEventListener("click", async () => {
  const roleAInput = document.getElementById("roleA");
  const roleBInput = document.getElementById("roleB");
  const roleA = (roleAInput?.value || "").trim();
  const roleB = (roleBInput?.value || "").trim();

  const err    = document.getElementById("compareError");
  const spin   = document.getElementById("compareLoader");
  const out    = document.getElementById("compareResults");
  const tbody  = document.getElementById("compareTableBody");

  // Optional blocks if you added them
  const summaryWrap = document.getElementById("compareDescription");
  const summaryText = document.getElementById("compareSummaryText");
  const overlapEl   = document.getElementById("skillsOverlap");
  const onlyAEl     = document.getElementById("skillsOnlyA");
  const onlyBEl     = document.getElementById("skillsOnlyB");

  if (err)  { err.style.display = "none"; err.textContent = ""; }
  if (out)  out.style.display = "none";
  if (spin) spin.style.display = "block";
  if (summaryWrap) summaryWrap.style.display = "none";

  if (!roleA || !roleB) {
    if (spin) spin.style.display = "none";
    if (err) {
      err.textContent = "Please enter both roles.";
      err.style.display = "block";
    }
    return;
  }

  try {
    const raw = await compareRoles(roleA, roleB);

    // Support plain JSON or ai_text JSON
    let payload = raw;
    if (raw.ai_text) {
      const parsed = parseAiJsonMaybe(raw.ai_text);
      if (parsed) payload = parsed;
    }

    // Headings
    const thA = document.getElementById("roleA_th");
    const thB = document.getElementById("roleB_th");
    if (thA) thA.textContent = roleA;
    if (thB) thB.textContent = roleB;

    // Build table rows robustly, regardless of column key names
    if (tbody) {
      tbody.innerHTML = "";
      (payload.table || []).forEach((row) => {
        // Identify metric key and the two role keys
        const keys = Object.keys(row);
        const metricKey = keys.includes("metric") ? "metric" : keys[0];

        // Prefer explicit common names; otherwise take the first two non-metric keys in order
        const roleKeys = keys.filter(k => k !== metricKey);
        const leftKey  = row["Data Scientist"] !== undefined ? "Data Scientist"
                      : row["roleA"] !== undefined ? "roleA"
                      : row["a"] !== undefined ? "a"
                      : roleKeys[0];
        const rightKey = row["ML Engineer"] !== undefined ? "ML Engineer"
                      : row["roleB"] !== undefined ? "roleB"
                      : row["b"] !== undefined ? "b"
                      : roleKeys[1];

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td style="padding:8px;">${row[metricKey] ?? ""}</td>
          <td style="padding:8px;">${(leftKey ? row[leftKey] : "") ?? ""}</td>
          <td style="padding:8px;">${(rightKey ? row[rightKey] : "") ?? ""}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Summary (optional block)
    const summary = payload.summary || payload.description;
    if (summary && summaryWrap && summaryText) {
      summaryText.textContent = summary;
      summaryWrap.style.display = "block";
    }

    // Skills chips (optional blocks)
    const chip = (s) => `<div class="skill-chip">${s}</div>`;
    if (overlapEl) overlapEl.innerHTML = (payload.skills_overlap || []).map(chip).join("");
    if (onlyAEl)   onlyAEl.innerHTML   = (payload.unique_a || []).map(chip).join("");
    if (onlyBEl)   onlyBEl.innerHTML   = (payload.unique_b || []).map(chip).join("");

    if (out) out.style.display = "block";
  } catch (e) {
    console.error(e);
    if (err) {
      err.textContent = `Compare failed: ${e.message}`;
      err.style.display = "block";
    }
  } finally {
    if (spin) spin.style.display = "none";
  }
});

// === Event Listeners (single role) ===
generateBtn?.addEventListener("click", generateRoadmap);
jobInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") generateRoadmap();
});

// init
generateStarfield();
