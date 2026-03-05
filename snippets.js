const STORAGE_KEY = "devtoolbox_snippets";
const DEFAULT_PAGE_SIZE = 5;
let currentPage = 1;
let pageSize = DEFAULT_PAGE_SIZE;

const DEFAULT_SNIPPETS = [
  {
    title: "Fetch JSON (GET)",
    category: "JS",
    tags: ["fetch", "async", "api"],
    code: "const res = await fetch('/api/data');\nif (!res.ok) throw new Error(`HTTP ${res.status}`);\nconst data = await res.json();\nconsole.log(data);",
  },
  {
    title: "Debounce Utility",
    category: "JS",
    tags: ["performance", "events", "utility"],
    code: "function debounce(fn, delay = 300) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}",
  },
  {
    title: "Throttle Utility",
    category: "JS",
    tags: ["performance", "events", "utility"],
    code: "function throttle(fn, interval = 300) {\n  let last = 0;\n  return (...args) => {\n    const now = Date.now();\n    if (now - last >= interval) {\n      last = now;\n      fn(...args);\n    }\n  };\n}",
  },
  {
    title: "Retry Async Function",
    category: "JS",
    tags: ["retry", "resilience", "async"],
    code: "async function retry(task, retries = 3) {\n  let lastError;\n  for (let i = 0; i < retries; i += 1) {\n    try {\n      return await task();\n    } catch (error) {\n      lastError = error;\n    }\n  }\n  throw lastError;\n}",
  },
  {
    title: "useEffect with AbortController",
    category: "React",
    tags: ["react", "fetch", "abort"],
    code: "useEffect(() => {\n  const controller = new AbortController();\n\n  (async () => {\n    const res = await fetch('/api/users', { signal: controller.signal });\n    const data = await res.json();\n    setUsers(data);\n  })().catch((error) => {\n    if (error.name !== 'AbortError') console.error(error);\n  });\n\n  return () => controller.abort();\n}, []);",
  },
  {
    title: "useLocalStorage Hook",
    category: "React",
    tags: ["react", "hook", "localstorage"],
    code: "function useLocalStorage(key, initialValue) {\n  const [value, setValue] = useState(() => {\n    const raw = localStorage.getItem(key);\n    return raw ? JSON.parse(raw) : initialValue;\n  });\n\n  useEffect(() => {\n    localStorage.setItem(key, JSON.stringify(value));\n  }, [key, value]);\n\n  return [value, setValue];\n}",
  },
  {
    title: "React Error Boundary",
    category: "React",
    tags: ["react", "error-boundary", "stability"],
    code: "class ErrorBoundary extends React.Component {\n  constructor(props) {\n    super(props);\n    this.state = { hasError: false };\n  }\n\n  static getDerivedStateFromError() {\n    return { hasError: true };\n  }\n\n  componentDidCatch(error) {\n    console.error(error);\n  }\n\n  render() {\n    if (this.state.hasError) return <p>Something went wrong.</p>;\n    return this.props.children;\n  }\n}",
  },
  {
    title: "SQL Pagination",
    category: "SQL",
    tags: ["sql", "pagination", "query"],
    code: "SELECT id, name, created_at\nFROM users\nORDER BY created_at DESC\nLIMIT 20 OFFSET 40;",
  },
  {
    title: "PostgreSQL UPSERT",
    category: "SQL",
    tags: ["postgres", "upsert", "sql"],
    code: "INSERT INTO feature_flags (key, enabled, updated_at)\nVALUES ('new_checkout', true, NOW())\nON CONFLICT (key)\nDO UPDATE SET\n  enabled = EXCLUDED.enabled,\n  updated_at = NOW();",
  },
  {
    title: "Window Function Ranking",
    category: "SQL",
    tags: ["sql", "window-function", "analytics"],
    code: "SELECT\n  user_id,\n  order_total,\n  DENSE_RANK() OVER (ORDER BY order_total DESC) AS revenue_rank\nFROM orders;",
  },
  {
    title: "K8s Deployment + Service",
    category: "Cloud",
    tags: ["kubernetes", "deployment", "service"],
    code: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: api-server\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: api-server\n  template:\n    metadata:\n      labels:\n        app: api-server\n    spec:\n      containers:\n        - name: api-server\n          image: myorg/api-server:latest\n          ports:\n            - containerPort: 8080\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: api-server\nspec:\n  selector:\n    app: api-server\n  ports:\n    - port: 80\n      targetPort: 8080",
  },
  {
    title: "Terraform S3 Bucket",
    category: "Cloud",
    tags: ["terraform", "aws", "s3"],
    code: "resource \"aws_s3_bucket\" \"assets\" {\n  bucket = \"my-project-assets-prod\"\n}\n\nresource \"aws_s3_bucket_versioning\" \"assets\" {\n  bucket = aws_s3_bucket.assets.id\n  versioning_configuration {\n    status = \"Enabled\"\n  }\n}",
  },
  {
    title: "GitHub Actions Node CI",
    category: "Cloud",
    tags: ["github-actions", "ci", "node"],
    code: "name: CI\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm test",
  },
  {
    title: "Docker Compose Basic Service",
    category: "Docker",
    tags: ["docker", "compose", "dev"],
    code: "version: '3.9'\nservices:\n  app:\n    build: .\n    ports:\n      - '3000:3000'\n    environment:\n      NODE_ENV: development\n    volumes:\n      - ./:/app",
  },
  {
    title: "Dockerfile Node Multi-stage",
    category: "Docker",
    tags: ["docker", "node", "build"],
    code: "FROM node:20-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=build /app/dist ./dist\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCMD [\"node\", \"dist/index.js\"]",
  },
  {
    title: "Docker Prune Cleanup",
    category: "Docker",
    tags: ["docker", "cleanup", "command"],
    code: "docker system prune -f\ndocker volume prune -f\ndocker image prune -af",
  },
  {
    title: "Git Quick Sync Branch",
    category: "Git",
    tags: ["git", "workflow", "rebase"],
    code: "git checkout feature/my-task\ngit fetch origin\ngit rebase origin/main\ngit push --force-with-lease",
  },
  {
    title: "Conventional Commit Template",
    category: "Git",
    tags: ["git", "commit", "conventional"],
    code: "feat(auth): add refresh token rotation\n\n- add token family invalidation\n- update login endpoint tests",
  },
  {
    title: "Git Interactive Cleanup",
    category: "Git",
    tags: ["git", "history", "cleanup"],
    code: "git fetch origin\ngit rebase -i origin/main\ngit push --force-with-lease",
  },
  {
    title: "GA4 Page View Event",
    category: "Tracking",
    tags: ["ga4", "analytics", "tracking"],
    code: "gtag('event', 'page_view', {\n  page_title: document.title,\n  page_location: location.href,\n  page_path: location.pathname\n});",
  },
  {
    title: "dataLayer Purchase Event",
    category: "Tracking",
    tags: ["gtm", "datalayer", "ecommerce"],
    code: "dataLayer.push({\n  event: 'purchase',\n  ecommerce: {\n    transaction_id: 'T20260305001',\n    value: 1200,\n    currency: 'TWD',\n    items: [{ item_id: 'sku-001', item_name: 'Pro Plan', price: 1200, quantity: 1 }]\n  }\n});",
  },
  {
    title: "dataLayer Login Event",
    category: "Tracking",
    tags: ["gtm", "datalayer", "auth"],
    code: "dataLayer.push({\n  event: 'login_success',\n  method: 'email',\n  member_tier: 'pro'\n});",
  },
  {
    title: "cURL POST JSON",
    category: "API",
    tags: ["curl", "http", "request"],
    code: "curl -X POST 'https://api.example.com/v1/orders' \\\n  -H 'Authorization: Bearer <token>' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"userId\":123,\"amount\":450}'",
  },
  {
    title: "Axios Instance + Interceptor",
    category: "API",
    tags: ["axios", "interceptor", "auth"],
    code: "import axios from 'axios';\n\nexport const api = axios.create({\n  baseURL: '/api',\n  timeout: 10000\n});\n\napi.interceptors.request.use((config) => {\n  const token = localStorage.getItem('token');\n  if (token) config.headers.Authorization = `Bearer ${token}`;\n  return config;\n});",
  },
  {
    title: "Express Route Validation",
    category: "API",
    tags: ["express", "validation", "api"],
    code: "import { z } from 'zod';\n\nconst bodySchema = z.object({\n  name: z.string().min(1),\n  age: z.number().int().min(0),\n});\n\napp.post('/users', (req, res) => {\n  const parsed = bodySchema.safeParse(req.body);\n  if (!parsed.success) return res.status(400).json(parsed.error.flatten());\n  return res.json({ ok: true, user: parsed.data });\n});",
  },
];

const form = document.getElementById("snippetForm");
const formTitle = document.getElementById("formTitle");
const idInput = document.getElementById("snippetId");
const titleInput = document.getElementById("snippetTitle");
const categoryInput = document.getElementById("snippetCategory");
const tagsInput = document.getElementById("snippetTags");
const codeInput = document.getElementById("snippetCode");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const listEl = document.getElementById("snippetList");
const paginationEl = document.getElementById("snippetPagination");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const pageSizeSelect = document.getElementById("pageSizeSelect");
const openModalBtn = document.getElementById("openSnippetModalBtn");
const closeModalBtn = document.getElementById("closeSnippetModalBtn");
const modalEl = document.getElementById("snippetModal");
const confirmDeleteModalEl = document.getElementById("confirmDeleteModal");
const confirmDeleteMessageEl = document.getElementById("confirmDeleteMessage");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
let pendingDeleteSnippetId = null;
let expandedSnippetEl = null;

const snippetExpandBackdrop = document.createElement("div");
snippetExpandBackdrop.className = "snippet-expand-backdrop";
document.body.appendChild(snippetExpandBackdrop);

function escapeHTML(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getSnippets() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSnippets(snippets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
}

function normalizeLegacyCategories() {
  const current = getSnippets();
  let changed = false;

  const next = current.map((snippet) => {
    if (snippet.category !== "Docker/Git") return snippet;

    const title = String(snippet.title || "").toLowerCase();
    const tags = Array.isArray(snippet.tags) ? snippet.tags.map((t) => String(t).toLowerCase()) : [];
    const looksGit = title.includes("git") || tags.includes("git") || tags.includes("rebase") || tags.includes("commit");

    changed = true;
    return {
      ...snippet,
      category: looksGit ? "Git" : "Docker",
    };
  });

  if (changed) saveSnippets(next);
}

function mergeDefaultSnippets() {
  const current = getSnippets();
  const existingKeys = new Set(current.map((s) => `${s.category}::${s.title}`.toLowerCase()));
  let changed = false;

  DEFAULT_SNIPPETS.forEach((snippet, index) => {
    const key = `${snippet.category}::${snippet.title}`.toLowerCase();
    if (existingKeys.has(key)) return;

    current.push({
      id: crypto.randomUUID(),
      title: snippet.title,
      category: snippet.category,
      tags: snippet.tags,
      code: snippet.code,
      createdAt: Date.now() + index,
    });
    changed = true;
  });

  if (changed) saveSnippets(current);
}

function resetForm() {
  idInput.value = "";
  titleInput.value = "";
  categoryInput.value = "";
  tagsInput.value = "";
  codeInput.value = "";
  formTitle.textContent = "新增 Snippet";
}

function openModal(mode = "create") {
  collapseExpandedSnippet();
  if (mode === "create") resetForm();
  modalEl.classList.add("open");
  modalEl.setAttribute("aria-hidden", "false");
  titleInput.focus();
}

function closeModal() {
  modalEl.classList.remove("open");
  modalEl.setAttribute("aria-hidden", "true");
}

function openDeleteConfirm(snippet) {
  pendingDeleteSnippetId = snippet.id;
  confirmDeleteMessageEl.textContent = `確定要刪除 snippet「${snippet.title}」嗎？`;
  confirmDeleteModalEl.classList.add("open");
  confirmDeleteModalEl.setAttribute("aria-hidden", "false");
}

function closeDeleteConfirm() {
  pendingDeleteSnippetId = null;
  confirmDeleteModalEl.classList.remove("open");
  confirmDeleteModalEl.setAttribute("aria-hidden", "true");
}

function confirmDeleteSnippet() {
  if (!pendingDeleteSnippetId) return;
  const next = getSnippets().filter((s) => s.id !== pendingDeleteSnippetId);
  saveSnippets(next);
  if (idInput.value === pendingDeleteSnippetId) resetForm();
  closeDeleteConfirm();
  renderList();
}

function collapseExpandedSnippet() {
  if (!expandedSnippetEl) return;
  expandedSnippetEl.classList.remove("expanded");
  expandedSnippetEl = null;
  snippetExpandBackdrop.classList.remove("show");
  document.body.classList.remove("snippet-zoom-open");
}

function expandSnippet(cardEl) {
  if (expandedSnippetEl === cardEl) return;
  collapseExpandedSnippet();
  expandedSnippetEl = cardEl;
  expandedSnippetEl.classList.add("expanded");
  snippetExpandBackdrop.classList.add("show");
  document.body.classList.add("snippet-zoom-open");
}

function parseTags(raw) {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function copyText(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  return Promise.resolve();
}

function snippetMatches(snippet, keyword, category) {
  const inCategory = category === "all" || snippet.category === category;
  if (!inCategory) return false;

  if (!keyword) return true;
  const haystack = [snippet.title, snippet.code, snippet.tags.join(" ")].join(" ").toLowerCase();
  return haystack.includes(keyword.toLowerCase());
}

function getPageItems(totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [1];
  if (currentPage > 3) pages.push("...");
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let p = start; p <= end; p += 1) pages.push(p);
  if (currentPage < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
}

function renderPagination(totalPages) {
  if (!paginationEl) return;
  if (totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  const pageItems = getPageItems(totalPages)
    .map((item) => {
      if (item === "...") return '<span class="page-ellipsis">...</span>';
      const active = item === currentPage ? "page-btn active" : "page-btn";
      return `<button class="${active}" data-page="${item}" type="button">${item}</button>`;
    })
    .join("");

  paginationEl.innerHTML = `
    <button class="page-btn" data-page-action="prev" type="button" ${currentPage === 1 ? "disabled" : ""}>上一頁</button>
    ${pageItems}
    <button class="page-btn" data-page-action="next" type="button" ${currentPage === totalPages ? "disabled" : ""}>下一頁</button>
    <span class="page-info">第 ${currentPage} / ${totalPages} 頁</span>
  `;
}

function renderList() {
  collapseExpandedSnippet();

  const snippets = getSnippets();
  const keyword = searchInput.value.trim();
  const category = filterCategory.value;
  const filtered = snippets
    .filter((s) => snippetMatches(s, keyword, category))
    .sort((a, b) => b.createdAt - a.createdAt);

  if (!filtered.length) {
    listEl.innerHTML = '<p class="muted">找不到符合條件的 snippet。</p>';
    paginationEl.innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(filtered.length / pageSize);
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  listEl.innerHTML = paged
    .map(
      (snippet) => `
      <section class="snippet-item">
        <div class="snippet-head">
          <h3>${escapeHTML(snippet.title)}</h3>
          <span class="badge">${escapeHTML(snippet.category)}</span>
        </div>
        <p class="tag-line">${snippet.tags.map((t) => `#${escapeHTML(t)}`).join(" ") || "無 tag"}</p>
        <pre class="mono output-box snippet-code">${escapeHTML(snippet.code)}</pre>
        <div class="row-actions">
          <button data-action="copy" data-id="${snippet.id}" class="btn-primary" type="button">Copy</button>
          <button data-action="edit" data-id="${snippet.id}" class="btn-secondary" type="button">編輯</button>
          <button data-action="delete" data-id="${snippet.id}" class="btn-danger" type="button">刪除</button>
        </div>
      </section>
    `,
    )
    .join("");

  renderPagination(totalPages);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const snippets = getSnippets();
  const payload = {
    id: idInput.value || crypto.randomUUID(),
    title: titleInput.value.trim(),
    category: categoryInput.value,
    tags: parseTags(tagsInput.value),
    code: codeInput.value,
    createdAt: idInput.value ? snippets.find((s) => s.id === idInput.value)?.createdAt || Date.now() : Date.now(),
  };

  const index = snippets.findIndex((s) => s.id === payload.id);
  if (index >= 0) {
    snippets[index] = payload;
  } else {
    snippets.push(payload);
    currentPage = 1;
  }

  saveSnippets(snippets);
  closeModal();
  resetForm();
  renderList();
});

cancelEditBtn.addEventListener("click", () => {
  closeModal();
  resetForm();
});

openModalBtn.addEventListener("click", () => {
  openModal("create");
});

closeModalBtn.addEventListener("click", () => {
  closeModal();
});

modalEl.addEventListener("click", (event) => {
  if (event.target === modalEl) closeModal();
});

confirmDeleteModalEl.addEventListener("click", (event) => {
  if (event.target === confirmDeleteModalEl) closeDeleteConfirm();
});

cancelDeleteBtn.addEventListener("click", () => {
  closeDeleteConfirm();
});

confirmDeleteBtn.addEventListener("click", () => {
  confirmDeleteSnippet();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (confirmDeleteModalEl.classList.contains("open")) {
    closeDeleteConfirm();
    return;
  }
  if (modalEl.classList.contains("open")) closeModal();
  if (expandedSnippetEl) collapseExpandedSnippet();
});

searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderList();
});

filterCategory.addEventListener("change", () => {
  currentPage = 1;
  renderList();
});

pageSizeSelect.addEventListener("change", () => {
  pageSize = Number(pageSizeSelect.value) || DEFAULT_PAGE_SIZE;
  currentPage = 1;
  renderList();
});

listEl.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const actionBtn = target.closest("button[data-action]");
  if (actionBtn instanceof HTMLButtonElement) {
    const action = actionBtn.dataset.action;
    const id = actionBtn.dataset.id;
    const snippets = getSnippets();
    const snippet = snippets.find((s) => s.id === id);
    if (!snippet) return;

    if (action === "copy") {
      await copyText(snippet.code);
      actionBtn.textContent = "已複製";
      setTimeout(() => {
        actionBtn.textContent = "Copy";
      }, 1200);
      return;
    }

    if (action === "edit") {
      idInput.value = snippet.id;
      titleInput.value = snippet.title;
      categoryInput.value = snippet.category;
      tagsInput.value = snippet.tags.join(", ");
      codeInput.value = snippet.code;
      formTitle.textContent = "編輯 Snippet";
      openModal("edit");
      return;
    }

    if (action === "delete") {
      openDeleteConfirm(snippet);
    }
    return;
  }

  const snippetCard = target.closest(".snippet-item");
  if (!(snippetCard instanceof HTMLElement)) return;
  expandSnippet(snippetCard);
});

document.addEventListener("click", (event) => {
  if (!expandedSnippetEl) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if (expandedSnippetEl.contains(target)) return;
  collapseExpandedSnippet();
});

paginationEl.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) return;

  if (target.dataset.pageAction === "prev" && currentPage > 1) {
    currentPage -= 1;
    renderList();
    return;
  }

  if (target.dataset.pageAction === "next") {
    currentPage += 1;
    renderList();
    return;
  }

  const page = Number(target.dataset.page);
  if (Number.isFinite(page) && page > 0) {
    currentPage = page;
    renderList();
  }
});

pageSizeSelect.value = String(DEFAULT_PAGE_SIZE);
normalizeLegacyCategories();
mergeDefaultSnippets();
renderList();
