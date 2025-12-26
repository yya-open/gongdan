
    let records = [];
    let editingId = null;
    let nextId = 1;

    

    // 统一数据结构：内部一律使用 {id,date,issue,department,name,solution,remarks,type}
    function normalizeRecord(r, fallbackId) {
      const obj = (r && typeof r === "object") ? r : {};
      return {
        id: (() => { const v = Number(obj.id ?? obj.ID ?? obj.Id ?? fallbackId); return Number.isFinite(v) ? v : fallbackId; })(),
        date: obj.date ?? obj.日期 ?? obj.time ?? obj.createdAt ?? "",
        issue: obj.issue ?? obj.问题 ?? obj.question ?? obj.title ?? obj.subject ?? "",
        department: obj.department ?? obj.dept ?? obj.部门 ?? obj.departmentName ?? "",
        name: obj.name ?? obj.owner ?? obj.person ?? obj.姓名 ?? obj.handler ?? "",
        solution: obj.solution ?? obj.method ?? obj.处理方法 ?? obj.fix ?? "",
        remarks: obj.remarks ?? obj.remark ?? obj.备注 ?? obj.note ?? "",
        type: obj.type ?? obj.类型 ?? obj.category ?? ""
      };
    }

    function normalizeRecords(arr) {
      if (!Array.isArray(arr)) return [];
      return arr.map((r, idx) => normalizeRecord(r, idx + 1));
    }
let activeYear = ""; // 当前选择的年份（字符串，如 "2025"）
    let activeMonth = ""; // 当前选择的月份（字符串，"01" ~ "12"）

    let typePieChart = null;
    let monthBarChart = null;


// ===== 分页配置（每页最多 100 条）=====
const PAGE_SIZE_MAX = 100;
let pageSize = 100;     // 可选更小，但上限 100
let currentPage = 1;

function clamp(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

// ===== 统一提示/弹窗（更好看的 UI，替代 alert / confirm）=====
function showToast(message, variant = "info", title = "") {
  const container = document.getElementById("toastContainer");
  if (!container) {
    // 兜底：容器不存在时仍然不阻断主流程
    console.log(`[${variant}] ${title ? title + " - " : ""}${message}`);
    return;
  }
  const toast = document.createElement("div");
  toast.className = `toast ${variant}`;
  toast.innerHTML = `${title ? `<div class="title">${escapeHtml(title)}</div>` : ""}<div>${escapeHtml(message)}</div>`;
  container.appendChild(toast);

  // 强制触发一次 layout，保证动画生效
  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 220);
  }, 2200);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function showModal({ title = "提示", message = "", okText = "确定", variant = "primary" } = {}) {
  const overlay = document.getElementById("modalOverlay");
  const titleEl = document.getElementById("modalTitle");
  const bodyEl = document.getElementById("modalBody");
  const footerEl = document.getElementById("modalFooter");
  if (!overlay || !titleEl || !bodyEl || !footerEl) {
    // 兜底
    alert(message);
    return Promise.resolve();
  }

  overlay.setAttribute("aria-hidden", "false");
  overlay.classList.add("show");
  titleEl.textContent = title;
  bodyEl.textContent = message;
  footerEl.innerHTML = "";

  const okBtn = document.createElement("button");
  okBtn.className = variant === "danger" ? "danger" : "primary";
  okBtn.textContent = okText;

  return new Promise(resolve => {
    function close() {
      overlay.classList.remove("show");
      overlay.setAttribute("aria-hidden", "true");
      overlay.onclick = null;
      window.removeEventListener("keydown", onKeyDown);
      resolve();
    }

    function onKeyDown(e) {
      if (e.key === "Escape") close();
    }

    okBtn.onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };
    window.addEventListener("keydown", onKeyDown);

    footerEl.appendChild(okBtn);
    okBtn.focus({ preventScroll: true });
  });
}function showConfirm({ title = "确认操作", message = "", confirmText = "确定", cancelText = "取消", danger = false } = {}) {
  const overlay = document.getElementById("modalOverlay");
  const titleEl = document.getElementById("modalTitle");
  const bodyEl = document.getElementById("modalBody");
  const footerEl = document.getElementById("modalFooter");
  if (!overlay || !titleEl || !bodyEl || !footerEl) {
    return Promise.resolve(confirm(message));
  }

  overlay.setAttribute("aria-hidden", "false");
  overlay.classList.add("show");
  titleEl.textContent = title;
  bodyEl.textContent = message;
  footerEl.innerHTML = "";

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = cancelText;

  const okBtn = document.createElement("button");
  okBtn.className = danger ? "danger" : "primary";
  okBtn.textContent = confirmText;

  return new Promise(resolve => {
    function close(result) {
      overlay.classList.remove("show");
      overlay.setAttribute("aria-hidden", "true");
      overlay.onclick = null;
      window.removeEventListener("keydown", onKeyDown);
      resolve(result);
    }

    function onKeyDown(e) {
      if (e.key === "Escape") close(false);
    }

    cancelBtn.onclick = () => close(false);
    okBtn.onclick = () => close(true);
    overlay.onclick = (e) => { if (e.target === overlay) close(false); };
    window.addEventListener("keydown", onKeyDown);

    footerEl.appendChild(cancelBtn);
    footerEl.appendChild(okBtn);
    okBtn.focus({ preventScroll: true });
  });
}

    // ⭐ 本地存储：保存 records 到 localStorage
    function saveToLocal() {
      try {
        localStorage.setItem("ticket_records", JSON.stringify(records));
      } catch (e) {
        console.error("保存到本地失败：", e);
      }
    }


    function saveViewState() {
      try {
        localStorage.setItem("ticket_view_year", activeYear || "");
        localStorage.setItem("ticket_view_month", activeMonth || "");
      } catch (e) {
        // ignore
      }
    }

    function loadViewState() {
      try {
        activeYear = localStorage.getItem("ticket_view_year") || "";
        activeMonth = localStorage.getItem("ticket_view_month") || "";
      } catch (e) {
        activeYear = "";
        activeMonth = "";
      }
    }


    // ⭐ 本地存储：从 localStorage 恢复 records
    function loadFromLocal() {
      try {
        const saved = localStorage.getItem("ticket_records");
        if (saved) {
          const data = JSON.parse(saved);
          if (Array.isArray(data)) {
            records = normalizeRecords(data);
            const maxId = records.reduce((max, r) => {
              const v = Number(r.id);
              return Number.isFinite(v) ? Math.max(max, v) : max;
            }, 0);
            nextId = maxId + 1;
          }


// ===== 云端存储（Cloudflare Pages Functions + D1）=====
async function loadFromServer() {
  const res = await fetch("/api/tickets", { cache: "no-store" });
  if (!res.ok) throw new Error(`load failed: ${res.status}`);
  const data = await res.json();
  records = normalizeRecords(Array.isArray(data) ? data : []);
  const maxId = records.reduce((max, r) => {
    const v = Number(r.id);
    return Number.isFinite(v) ? Math.max(max, v) : max;
  }, 0);
  nextId = maxId + 1;
}

async function reloadAndRender({ showLoadedToast = false } = {}) {
  await loadFromServer();
  saveToLocal(); // 缓存一份到本地，作为兜底
  refreshYearOptions();
  renderTable();
  if (showLoadedToast) {
    showToast(`已从云端加载 ${records.length} 条工单`, "success");
  }
}
        }
      } catch (e) {
        console.error("从本地恢复数据失败：", e);
      }
    }


    
async function addOrUpdateRecord() {
  const date = document.getElementById("date").value;
  const issue = document.getElementById("issue").value.trim();
  const department = document.getElementById("department").value.trim();
  const name = document.getElementById("name").value.trim();
  const solution = document.getElementById("solution").value.trim();
  const remarks = document.getElementById("remarks").value.trim();
  const type = document.getElementById("type").value;

  if (!date || !issue) {
    showToast("请至少填写日期和问题！", "warning");
    return;
  }

  const payload = { date, issue, department, name, solution, remarks, type };

  const btn = document.getElementById("submitBtn");
  const oldText = btn ? btn.innerText : "";
  if (btn) {
    btn.disabled = true;
    btn.innerText = editingId === null ? "保存中..." : "保存中...";
  }

  try {
    if (editingId === null) {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`create failed: ${res.status}`);
    } else {
      const res = await fetch(`/api/tickets/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, id: editingId })
      });
      if (!res.ok) throw new Error(`update failed: ${res.status}`);

      editingId = null;
      document.getElementById("submitBtn").innerText = "添加记录";
    }

    resetForm(false);
    await reloadAndRender();
    showToast("已保存到云端。", "success");
  } catch (e) {
    console.error(e);
    showToast("保存失败：请检查网络或后端是否正常。", "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = editingId === null ? "添加记录" : (oldText || "保存修改");
    }
  }
}

function resetForm(resetEditing = true) {
(resetEditing = true) {
      document.getElementById("ticketForm").reset();
      if (resetEditing) {
        editingId = null;
        document.getElementById("submitBtn").innerText = "添加记录";
      }
    }

    function editRecord(id) {
      const record = records.find(r => r.id === id);
      if (!record) return;
      editingId = id;
      document.getElementById("date").value = record.date;
      document.getElementById("issue").value = record.issue;
      document.getElementById("department").value = record.department;
      document.getElementById("name").value = record.name;
      document.getElementById("solution").value = record.solution;
      document.getElementById("remarks").value = record.remarks;
      document.getElementById("type").value = record.type;
      document.getElementById("submitBtn").innerText = "保存修改";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    

async function deleteRecord(id) {
  const ok = await showConfirm({
    title: "确认删除",
    message: "确认删除这条工单记录吗？此操作不可撤销。",
    confirmText: "删除",
    cancelText: "取消",
    danger: true
  });
  if (!ok) return;

  try {
    const res = await fetch(`/api/tickets/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`delete failed: ${res.status}`);

    if (editingId === id) resetForm();
    await reloadAndRender();
    showToast("已删除该记录。", "success");
  } catch (e) {
    console.error(e);
    showToast("删除失败：请检查网络或后端是否正常。", "error");
  }
}

    function clearFilters() {
() {
      document.getElementById("filterFrom").value = "";
      document.getElementById("filterTo").value = "";
      document.getElementById("filterType").value = "";
      document.getElementById("filterKeyword").value = "";
      // 保留月份视图状态，仅清空高级筛选
      renderTable();
    }

    function getFilteredRecords() {
      const from = document.getElementById("filterFrom").value;
      const to = document.getElementById("filterTo").value;
      const type = document.getElementById("filterType").value;
      const keyword = document.getElementById("filterKeyword").value.trim().toLowerCase();

      return records.filter(r => {
        if (activeYear && r.date.slice(0, 4) !== activeYear) return false;
        if (activeMonth && r.date.slice(5, 7) !== activeMonth) return false;
        if (from && r.date < from) return false;
        if (to && r.date > to) return false;
        if (type && r.type !== type) return false;
        if (keyword) {
          const combined = `${r.issue} ${r.department} ${r.name} ${r.solution} ${r.remarks}`.toLowerCase();
          if (!combined.includes(keyword)) return false;
        }
        return true;
      });
    }

    
function renderTable({ resetPage = true } = {}) {
  const tbody = document.getElementById("recordTable").querySelector("tbody");
  tbody.innerHTML = "";

  const filtered = getFilteredRecords();

  // 分页计算
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (resetPage) currentPage = 1;
  currentPage = clamp(currentPage, 1, totalPages);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageRecords = filtered.slice(startIndex, endIndex);

  if (pageRecords.length === 0) {
    const row = tbody.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = 8;
    cell.style.textAlign = "center";
    cell.style.color = "#999";
    cell.style.padding = "14px 8px";
    cell.innerText = "暂无工单记录";
  } else {
    pageRecords.forEach(r => {
      const row = tbody.insertRow();
      row.insertCell(0).innerText = r.date;
      row.insertCell(1).innerText = r.issue;
      row.insertCell(2).innerText = r.department;
      row.insertCell(3).innerText = r.name;
      row.insertCell(4).innerText = r.solution;
      row.insertCell(5).innerText = r.remarks;
      row.insertCell(6).innerText = r.type;
      const actionCell = row.insertCell(7);

      const editBtn = document.createElement("button");
      editBtn.innerText = "编辑";
      editBtn.className = "small";
      editBtn.onclick = () => editRecord(r.id);

      const delBtn = document.createElement("button");
      delBtn.innerText = "删除";
      delBtn.className = "small danger";
      delBtn.onclick = () => deleteRecord(r.id);

      actionCell.appendChild(editBtn);
      actionCell.appendChild(delBtn);
    });
  }

  updateStatsAndCharts(filtered); // 统计/图表基于“当前视图（全部筛选结果）”
  refreshMonthButtons();
  renderPagination(totalItems);
}

function renderPagination(totalItems) {
  const el = document.getElementById("pagination");
  if (!el) return;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  currentPage = clamp(currentPage, 1, totalPages);

  el.innerHTML = "";

  const info = document.createElement("div");
  info.className = "page-info";
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(totalItems, currentPage * pageSize);
  info.textContent = `显示 ${start}-${end} / ${totalItems} 条`;

  const controls = document.createElement("div");
  controls.className = "page-controls";

  // 每页条数（上限 100）
  const sizeLabel = document.createElement("span");
  sizeLabel.textContent = "每页：";
  const sizeSelect = document.createElement("select");
  sizeSelect.className = "page-size";
  [20, 50, 100].forEach(n => {
    const opt = document.createElement("option");
    opt.value = String(n);
    opt.textContent = `${n} 条`;
    sizeSelect.appendChild(opt);
  });
  sizeSelect.value = String(pageSize);
  sizeSelect.onchange = () => {
    pageSize = Math.min(Number(sizeSelect.value) || 100, PAGE_SIZE_MAX);
    renderTable({ resetPage: true });
  };

  function mkBtn(text, { disabled = false, active = false, onClick } = {}) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    if (active) b.classList.add("active");
    b.disabled = disabled;
    if (onClick) b.onclick = onClick;
    return b;
  }

  const firstBtn = mkBtn("首页", {
    disabled: currentPage <= 1 || totalItems === 0,
    onClick: () => { currentPage = 1; renderTable({ resetPage: false }); }
  });
  const prevBtn = mkBtn("上一页", {
    disabled: currentPage <= 1 || totalItems === 0,
    onClick: () => { currentPage -= 1; renderTable({ resetPage: false }); }
  });
  const nextBtn = mkBtn("下一页", {
    disabled: currentPage >= totalPages || totalItems === 0,
    onClick: () => { currentPage += 1; renderTable({ resetPage: false }); }
  });
  const lastBtn = mkBtn("末页", {
    disabled: currentPage >= totalPages || totalItems === 0,
    onClick: () => { currentPage = totalPages; renderTable({ resetPage: false }); }
  });

  // 页码按钮（最多显示 7 个）
  const maxButtons = 7;
  let startPage = Math.max(1, currentPage - 3);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  startPage = Math.max(1, endPage - maxButtons + 1);

  // 组合 UI
  controls.appendChild(sizeLabel);
  controls.appendChild(sizeSelect);
  controls.appendChild(firstBtn);
  controls.appendChild(prevBtn);

  for (let p = startPage; p <= endPage; p++) {
    controls.appendChild(mkBtn(String(p), {
      active: p === currentPage,
      disabled: totalItems === 0,
      onClick: () => { currentPage = p; renderTable({ resetPage: false }); }
    }));
  }

  controls.appendChild(nextBtn);
  controls.appendChild(lastBtn);

  // 跳转
  const jump = document.createElement("input");
  jump.type = "number";
  jump.min = "1";
  jump.max = String(totalPages);
  jump.placeholder = "页码";
  jump.value = "";
  jump.onkeydown = (e) => {
    if (e.key === "Enter") {
      const p = clamp(Number(jump.value) || 1, 1, totalPages);
      currentPage = p;
      renderTable({ resetPage: false });
      jump.value = "";
    }
  };

  const jumpBtn = mkBtn("跳转", {
    disabled: totalItems === 0,
    onClick: () => {
      const p = clamp(Number(jump.value) || 1, 1, totalPages);
      currentPage = p;
      renderTable({ resetPage: false });
      jump.value = "";
    }
  });

  controls.appendChild(jump);
  controls.appendChild(jumpBtn);

  el.appendChild(info);
  el.appendChild(controls);
}

    function refreshYearOptions() {
      const yearSelect = document.getElementById("yearSelect");
      const oldValue = activeYear;
      const years = Array.from(new Set(records.map(r => r.date.slice(0, 4)))).sort();
      yearSelect.innerHTML = '<option value="">全部年份</option>';
      years.forEach(y => {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        yearSelect.appendChild(opt);
      });
      if (oldValue && years.includes(oldValue)) {
        activeYear = oldValue;
        yearSelect.value = oldValue;
      } else {
        activeYear = "";
        yearSelect.value = "";
        activeMonth = "";
      }
      refreshMonthButtons();
    }

    function refreshMonthButtons() {
      const container = document.getElementById("monthButtons");
      container.innerHTML = "";

      const year = activeYear;
      const monthsHasData = {};
      records.forEach(r => {
        const y = r.date.slice(0, 4);
        const m = r.date.slice(5, 7);
        if (!year || y === year) {
          monthsHasData[m] = true;
        }
      });

      // 若当前月份在该年份下无数据，则自动回到“全部月份”
      if (activeMonth && !monthsHasData[activeMonth]) {
        activeMonth = "";
        saveViewState();
      }

      for (let i = 1; i <= 12; i++) {
        const m = String(i).padStart(2, "0");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "month-btn";
        btn.textContent = i + "月";

        const hasData = monthsHasData[m];
        if (!hasData) {
          btn.classList.add("disabled");
          btn.onclick = null;
        } else {
          btn.onclick = () => setActiveMonth(m);
        }
        if (activeMonth === m) {
          btn.classList.add("active");
        }
        container.appendChild(btn);
      }

      // 增加一个“全部月份”按钮
      const allBtn = document.createElement("button");
      allBtn.type = "button";
      allBtn.className = "month-btn";
      allBtn.textContent = "全部月份";
      if (!activeMonth) {
        allBtn.classList.add("active");
      }
      allBtn.onclick = () => {
        activeMonth = "";
        saveViewState();
        renderTable();
      };
      container.appendChild(allBtn);
    }

    function onYearChange() {
      const select = document.getElementById("yearSelect");
      activeYear = select.value;
      activeMonth = ""; // 切换年份时重置月份
      saveViewState();
      renderTable();
    }

    function setActiveMonth(m) {
      if (activeMonth === m) {
        activeMonth = ""; // 再次点击可取消
      } else {
        activeMonth = m;
      }
      saveViewState();
      renderTable();
    }

    function updateStatsAndCharts(filtered) {
      const totalAll = records.length;
      const totalFiltered = filtered.length;

      const countsByType = {};
      const countsByMonth = {}; // yyyy-MM

      filtered.forEach(r => {
        const t = (r.type && String(r.type).trim()) ? String(r.type).trim() : "未分类";
        countsByType[t] = (countsByType[t] || 0) + 1;

        const monthKey = (r.date && String(r.date).length >= 7) ? String(r.date).slice(0, 7) : "未知月份";
        countsByMonth[monthKey] = (countsByMonth[monthKey] || 0) + 1;
      });

      // ===== 概览卡片 =====
      const typeKinds = Object.keys(countsByType).length;
      const topType = Object.entries(countsByType).sort((a,b) => b[1]-a[1])[0]?.[0] || "-";
      const topTypeCount = Object.entries(countsByType).sort((a,b) => b[1]-a[1])[0]?.[1] || 0;

      const cardsEl = document.getElementById("statsCards");
      if (cardsEl) {
        cardsEl.innerHTML = `
          <div class="stat">
            <div class="label">当前视图工单数</div>
            <div class="value">${totalFiltered}</div>
            <div class="sub">已应用筛选 + 年/月视图</div>
          </div>
          <div class="stat">
            <div class="label">全部工单数</div>
            <div class="value">${totalAll}</div>
            <div class="sub">本地存储/当前数据</div>
          </div>
          <div class="stat">
            <div class="label">类型数量</div>
            <div class="value">${typeKinds}</div>
            <div class="sub">Top：${escapeHtml(topType)}（${topTypeCount}）</div>
          </div>
        `;
      }

      // 兼容：老版本页面的 #stats（如果存在就也填一下，避免空白）
      const statsEl = document.getElementById("stats");
      if (statsEl) {
        statsEl.innerHTML = `<div class="muted">全部记录：${totalAll} 条；当前视图：${totalFiltered} 条。</div>`;
      }

      // ===== 颜色生成 =====
      function genColors(n) {
        const out = [];
        const base = 210; // 蓝系起点
        for (let i = 0; i < n; i++) {
          const hue = (base + i * (360 / Math.max(1, n))) % 360;
          out.push(`hsl(${hue} 75% 55%)`);
        }
        return out;
      }

      // ===== 自定义图例 =====
      function renderLegend(labels, values, colors) {
        const legend = document.getElementById("typeLegend");
        if (!legend) return;
        if (!labels.length) {
          legend.innerHTML = `<div class="muted">暂无数据</div>`;
          return;
        }
        const sum = values.reduce((a,b) => a + b, 0) || 1;
        legend.innerHTML = labels.map((name, idx) => {
          const v = values[idx] || 0;
          const pct = Math.round((v / sum) * 1000) / 10; // 1 位小数
          return `
            <div class="legend-item" title="${escapeHtml(name)}">
              <span class="legend-swatch" style="background:${colors[idx]};"></span>
              <span class="legend-name">${escapeHtml(name)}</span>
              <span class="legend-meta">
                <span class="legend-count">${v}</span>
                <span class="legend-pct">${pct}%</span>
              </span>
            </div>
          `;
        }).join("");
      }

      // ===== 饼图（类型分布）=====
      const pieLabels = Object.keys(countsByType);
      const pieData = pieLabels.map(l => countsByType[l]);
      const pieColors = genColors(pieLabels.length);

      if (typePieChart) typePieChart.destroy();
      const pieCanvas = document.getElementById("typePieChart");
      if (pieCanvas) {
        const pieCtx = pieCanvas.getContext("2d");
        typePieChart = new Chart(pieCtx, {
          type: "pie",
          data: {
            labels: pieLabels,
            datasets: [{
              data: pieData,
              backgroundColor: pieColors,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => {
                    const v = ctx.parsed ?? 0;
                    const sum = pieData.reduce((a,b)=>a+b,0) || 1;
                    const pct = Math.round((v/sum)*1000)/10;
                    return `${ctx.label}: ${v}（${pct}%）`;
                  }
                }
              }
            }
          }
        });
      }
      renderLegend(pieLabels, pieData, pieColors);

      // ===== 柱状图（按月份数量）=====
      const monthKeys = Object.keys(countsByMonth).sort();
      const barLabels = monthKeys;
      const barData = monthKeys.map(k => countsByMonth[k]);

      if (monthBarChart) monthBarChart.destroy();
      const barCanvas = document.getElementById("monthBarChart");
      if (barCanvas) {
        const barCtx = barCanvas.getContext("2d");
        monthBarChart = new Chart(barCtx, {
          type: "bar",
          data: {
            labels: barLabels,
            datasets: [{
              label: "工单数量",
              data: barData,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title: (items) => items?.[0]?.label || "",
                  label: (ctx) => `数量：${ctx.parsed.y ?? 0}`
                }
              }
            },
            scales: {
              x: { title: { display: true, text: "月份" } },
              y: { title: { display: true, text: "工单数量" }, beginAtZero: true, ticks: { precision: 0 } }
            }
          }
        });
      }
    }


    
    // 生成「故障类型统计」Sheet：
    // - 默认：直接写入统计数值
    // - 若提供 dataSheetName：使用 Excel 公式（COUNTIF）动态统计（用户在 Excel 里改类型也会自动更新）
    function buildTypeStatsSheet(arr, dataSheetName) {
      const map = {};
      const safeArr = Array.isArray(arr) ? arr : [];
      safeArr.forEach(r => {
        const t = (r && r.type != null ? String(r.type) : "").trim() || "未分类";
        map[t] = (map[t] || 0) + 1;
      });

      const types = Object.entries(map).sort((a, b) => b[1] - a[1]).map(([t]) => t);
      const rows = [["故障类型", "数量", "占比"]];
      types.forEach(t => rows.push([t, null, null]));
      rows.push(["合计", null, null]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws["!cols"] = [{ wch: 26 }, { wch: 10 }, { wch: 12 }];

      const totalRowIdx = rows.length; // 1-based in Excel
      const firstDataRowIdx = 2;
      const lastTypeRowIdx = totalRowIdx - 1;

      if (dataSheetName) {
        // 类型列在第 7 列（G列）
        const typeRange = `'${dataSheetName.replace(/'/g, "''")}'!$G:$G`;

        for (let i = 0; i < types.length; i++) {
          const r = firstDataRowIdx + i; // Excel row number
          // B列数量：COUNTIF
          const cellB = XLSX.utils.encode_cell({ r: r - 1, c: 1 });
          ws[cellB] = ws[cellB] || { t: "n" };
          ws[cellB].f = `COUNTIF(${typeRange},A${r})`;

          // C列占比：B/合计
          const cellC = XLSX.utils.encode_cell({ r: r - 1, c: 2 });
          ws[cellC] = ws[cellC] || { t: "n" };
          ws[cellC].f = `IF($B$${totalRowIdx}=0,0,B${r}/$B$${totalRowIdx})`;
          ws[cellC].z = "0.0%";
        }

        // 合计行
        const totalB = XLSX.utils.encode_cell({ r: totalRowIdx - 1, c: 1 });
        ws[totalB] = ws[totalB] || { t: "n" };
        ws[totalB].f = `SUM(B${firstDataRowIdx}:B${lastTypeRowIdx})`;

        const totalC = XLSX.utils.encode_cell({ r: totalRowIdx - 1, c: 2 });
        ws[totalC] = ws[totalC] || { t: "n" };
        ws[totalC].f = `IF($B$${totalRowIdx}=0,0,1)`;
        ws[totalC].z = "0.0%";
      } else {
        // 静态写值（用于多 Sheet 汇总，避免跨 Sheet 公式复杂）
        const total = safeArr.length || 0;
        for (let i = 0; i < types.length; i++) {
          const t = types[i];
          const c = map[t] || 0;
          const row = firstDataRowIdx + i;

          const cellB = XLSX.utils.encode_cell({ r: row - 1, c: 1 });
          ws[cellB] = { t: "n", v: c };

          const cellC = XLSX.utils.encode_cell({ r: row - 1, c: 2 });
          ws[cellC] = { t: "n", v: total ? c / total : 0, z: "0.0%" };
        }
        const totalB = XLSX.utils.encode_cell({ r: totalRowIdx - 1, c: 1 });
        ws[totalB] = { t: "n", v: total };

        const totalC = XLSX.utils.encode_cell({ r: totalRowIdx - 1, c: 2 });
        ws[totalC] = { t: "n", v: total ? 1 : 0, z: "0.0%" };
      }

      return ws;
    }

    // 导出当前筛选为单 Sheet Excel
    function exportExcelCurrent() {
      const filtered = getFilteredRecords();
      if (filtered.length === 0) {
        showToast("当前视图下没有可导出的记录！", "warning");
        return;
      }
      const data = [["日期", "问题", "部门", "姓名", "处理方法", "备注", "类型" ]];
      filtered.forEach(r => {
        data.push([r.date, r.issue, r.department, r.name, r.solution, r.remarks, r.type]);
      });
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "工单记录");
      
      // 追加：故障类型统计
      const wsStats = buildTypeStatsSheet(filtered, "工单记录");
      XLSX.utils.book_append_sheet(wb, wsStats, "类型统计");

      XLSX.writeFile(wb, "工单记录_当前视图.xlsx");
    }

    // 按月份分 Sheet 导出 Excel（基于全部 records，按 yyyy-MM 分页）
    function exportExcelByMonth() {
      if (records.length === 0) {
        showToast("没有可导出的数据！", "warning");
        return;
      }
      const grouped = {};
      records.forEach(r => {
        const monthKey = r.date.slice(0, 7); // yyyy-MM
        if (!grouped[monthKey]) grouped[monthKey] = [];
        grouped[monthKey].push(r);
      });
      const wb = XLSX.utils.book_new();
      Object.keys(grouped).sort().forEach(monthKey => {
        const arr = grouped[monthKey];
        const data = [["日期", "问题", "部门", "姓名", "处理方法", "备注", "类型" ]];
        arr.forEach(r => {
          data.push([r.date, r.issue, r.department, r.name, r.solution, r.remarks, r.type]);
        });
        const ws = XLSX.utils.aoa_to_sheet(data);
        const sheetName = monthKey.replace("-", ""); // 202501
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });
      
      // 追加：故障类型统计（全量 records）
      const wsStats = buildTypeStatsSheet(records);
      XLSX.utils.book_append_sheet(wb, wsStats, "类型统计");

      XLSX.writeFile(wb, "工单记录_按月份多Sheet.xlsx");
    }

    // 导出全量 JSON 备份
    function backupData() {
      if (records.length === 0) {
        showToast("没有可备份的数据！", "warning");
        return;
      }
      const blob = new Blob([JSON.stringify(records, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "工单备份.json";
      a.click();
      URL.revokeObjectURL(url);
      showToast("备份成功！已下载 JSON 文件。", "success");
    }

    
    // 载入 JSON 备份（兼容多种导出格式）
    
// 载入 JSON 备份（兼容多种导出格式）
function loadBackup(event) {
  const input = event.target;
  const file = input && input.files ? input.files[0] : null;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(e) {
    try {
      const raw = e.target.result;
      const parsed = JSON.parse(raw);

      // 1) 最常见：直接是数组
      let imported = null;

      if (Array.isArray(parsed)) {
        imported = parsed;
      } else if (parsed && typeof parsed === "object") {
        // 2) 兼容：{ records: [...] } / { data: [...] } / { tickets: [...] }
        const candidate =
          (Array.isArray(parsed.records) && parsed.records) ||
          (Array.isArray(parsed.data) && parsed.data) ||
          (Array.isArray(parsed.tickets) && parsed.tickets) ||
          (Array.isArray(parsed.items) && parsed.items);

        if (candidate) {
          imported = candidate;
        } else {
          // 3) 兼容：按月份对象 { "2025-12": [ ... ], "2025-11": [ ... ] }
          const keys = Object.keys(parsed);
          const monthLike = keys.some(k => /^\d{4}-\d{2}$/.test(k) && Array.isArray(parsed[k]));
          if (monthLike) {
            imported = [];
            keys.sort().forEach(k => {
              if (Array.isArray(parsed[k])) imported = imported.concat(parsed[k]);
            });
          }
        }
      }

      if (!Array.isArray(imported)) {
        showToast("备份格式不正确：请导入通过本系统导出的 JSON 备份文件。", "error");
        return;
      }

      imported = normalizeRecords(imported);

      // 询问：导入到云端（共享）还是仅导入本地（当前浏览器）
      const toCloud = await showConfirm({
        title: "导入备份",
        message: "是否将备份导入到【云端】并覆盖当前云端数据？\n\n- 确认：覆盖云端（所有人看到同一份）\n- 取消：仅导入本地（只影响你当前浏览器）",
        confirmText: "覆盖云端",
        cancelText: "仅本地导入",
        danger: true
      });

      if (toCloud) {
        const res = await fetch("/api/import", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(imported)
        });
        if (!res.ok) throw new Error(`import failed: ${res.status}`);
        await reloadAndRender();
        showToast(`已覆盖云端数据（共 ${imported.length} 条）！`, "success");
      } else {
        records = imported;
        const maxId = records.reduce((max, r) => {
          const v = Number(r.id);
          return Number.isFinite(v) ? Math.max(max, v) : max;
        }, 0);
        nextId = maxId + 1;
        currentPage = 1;
        refreshYearOptions();
        renderTable();
        saveToLocal();
        showToast(`已导入到本地（共 ${records.length} 条，仅本浏览器）！`, "success");
      }
    } catch (err) {
      console.error(err);
      showToast("解析备份失败：文件不是有效的 JSON。", "error");
    } finally {
      if (input) input.value = "";
    }
  };

  reader.onerror = function() {
    showToast("读取文件失败，请重试。", "error");
    if (input) input.value = "";
  };

  reader.readAsText(file);
}

    // 按月份导出 JSON（每个月一个独立 JSON 文件）
    function archiveByMonthJSON() {
      if (records.length === 0) {
        showToast("没有可归档的数据！", "warning");
        return;
      }
      const groups = {};
      records.forEach(r => {
        const monthKey = r.date.slice(0, 7); // yyyy-MM
        if (!groups[monthKey]) groups[monthKey] = [];
        groups[monthKey].push(r);
      });
      Object.keys(groups).sort().forEach(monthKey => {
        const data = groups[monthKey];
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `工单_${monthKey}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
      showToast("所有月份已分别导出为独立 JSON 文件！", "success");
    }

    // 年度 ZIP 打包：所有月份 JSON 文件打包为一个 ZIP
    function exportYearZip() {
      if (records.length === 0) {
        showToast("没有可打包的数据！", "warning");
        return;
      }
      const zip = new JSZip();
      const groups = {};
      records.forEach(r => {
        const monthKey = r.date.slice(0, 7); // yyyy-MM
        if (!groups[monthKey]) groups[monthKey] = [];
        groups[monthKey].push(r);
      });
      Object.keys(groups).sort().forEach(monthKey => {
        const data = groups[monthKey];
        const content = JSON.stringify(data, null, 2);
        zip.file(`工单_${monthKey}.json`, content);
      });
      zip.generateAsync({ type: "blob" }).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "工单年度归档.zip";
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // 初始化
    
(async function init() {
  // 先恢复月份视图（只影响筛选/显示，不影响数据源）
  loadViewState();

  // 先尝试从云端加载（多人共享数据）
  try {
    await reloadAndRender({ showLoadedToast: false });
  } catch (e) {
    console.error(e);
    // 云端失败时用本地缓存兜底
    loadFromLocal();
    refreshYearOptions();
    renderTable();
    showToast("云端加载失败，已使用本地缓存（仅本浏览器）。", "warning");
  }
})();
  