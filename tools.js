function safeParseJSON(input, fieldName) {
  if (!input.trim()) return { value: {} };
  try {
    return { value: JSON.parse(input) };
  } catch (error) {
    return { error: `${fieldName} JSON 格式錯誤：${error.message}` };
  }
}

function escapeHTML(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function initJsonFormatter() {
  const input = document.getElementById("jsonInput");
  const output = document.getElementById("jsonOutput");
  const status = document.getElementById("jsonStatus");
  const formatBtn = document.getElementById("jsonFormatBtn");
  const minifyBtn = document.getElementById("jsonMinifyBtn");

  function run(space) {
    try {
      const parsed = JSON.parse(input.value);
      output.textContent = JSON.stringify(parsed, null, space);
      status.textContent = "JSON 解析成功";
      status.className = "status-text ok";
    } catch (error) {
      output.textContent = "";
      status.textContent = `錯誤：${error.message}`;
      status.className = "status-text error";
    }
  }

  formatBtn.addEventListener("click", () => run(2));
  minifyBtn.addEventListener("click", () => run(0));
}

function stringifyValue(value) {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function initSnippetRunner() {
  const input = document.getElementById("jsInput");
  const output = document.getElementById("jsOutput");
  const runBtn = document.getElementById("jsRunBtn");
  const clearBtn = document.getElementById("jsClearBtn");

  runBtn.addEventListener("click", () => {
    const logs = [];
    const mockConsole = {
      log: (...args) => {
        logs.push(args.map(stringifyValue).join(" "));
      },
      error: (...args) => {
        logs.push("[error] " + args.map(stringifyValue).join(" "));
      },
    };

    try {
      const fn = new Function("console", input.value);
      fn(mockConsole);
      output.textContent = logs.length ? logs.join("\n") : "程式已執行，沒有 console.log 輸出。";
    } catch (error) {
      output.textContent = `執行錯誤：${error.message}`;
    }
  });

  clearBtn.addEventListener("click", () => {
    output.textContent = "";
  });
}

function initRegexTester() {
  const patternEl = document.getElementById("regexPattern");
  const flagsEl = document.getElementById("regexFlags");
  const textEl = document.getElementById("regexText");
  const statusEl = document.getElementById("regexStatus");
  const previewEl = document.getElementById("regexPreview");
  const btn = document.getElementById("regexTestBtn");

  btn.addEventListener("click", () => {
    try {
      const baseFlags = flagsEl.value || "";
      const finalFlags = baseFlags.includes("g") ? baseFlags : baseFlags + "g";
      const regex = new RegExp(patternEl.value, finalFlags);
      const text = textEl.value;
      const matches = Array.from(text.matchAll(regex));

      if (!matches.length) {
        statusEl.textContent = "無匹配結果";
        statusEl.className = "status-text";
        previewEl.textContent = text;
        return;
      }

      statusEl.textContent = `匹配成功，共 ${matches.length} 筆`;
      statusEl.className = "status-text ok";

      let html = "";
      let lastIndex = 0;
      for (const match of matches) {
        const index = match.index ?? 0;
        const matchedText = match[0];
        if (matchedText === "") continue;
        html += escapeHTML(text.slice(lastIndex, index));
        html += `<mark>${escapeHTML(matchedText)}</mark>`;
        lastIndex = index + matchedText.length;
      }
      html += escapeHTML(text.slice(lastIndex));
      previewEl.innerHTML = html;
    } catch (error) {
      statusEl.textContent = `Regex 錯誤：${error.message}`;
      statusEl.className = "status-text error";
      previewEl.textContent = "";
    }
  });
}

function initApiTester() {
  const methodEl = document.getElementById("apiMethod");
  const urlEl = document.getElementById("apiUrl");
  const headersEl = document.getElementById("apiHeaders");
  const bodyEl = document.getElementById("apiBody");
  const statusEl = document.getElementById("apiStatus");
  const responseEl = document.getElementById("apiResponse");
  const btn = document.getElementById("apiSendBtn");

  btn.addEventListener("click", async () => {
    const method = methodEl.value;
    const url = urlEl.value.trim();

    if (!url) {
      statusEl.textContent = "請輸入 URL";
      statusEl.className = "status-text error";
      return;
    }

    const headersResult = safeParseJSON(headersEl.value, "Headers");
    if (headersResult.error) {
      statusEl.textContent = headersResult.error;
      statusEl.className = "status-text error";
      return;
    }

    const options = {
      method,
      headers: headersResult.value || {},
    };

    if (method === "POST") {
      const bodyResult = safeParseJSON(bodyEl.value, "Body");
      if (bodyResult.error) {
        statusEl.textContent = bodyResult.error;
        statusEl.className = "status-text error";
        return;
      }
      options.body = JSON.stringify(bodyResult.value || {});
      if (!options.headers["Content-Type"]) {
        options.headers["Content-Type"] = "application/json";
      }
    }

    statusEl.textContent = "請求中...";
    statusEl.className = "status-text";
    responseEl.textContent = "";

    try {
      const response = await fetch(url, options);
      const contentType = response.headers.get("content-type") || "";
      let payload;

      if (contentType.includes("application/json")) {
        payload = await response.json();
      } else {
        payload = await response.text();
      }

      statusEl.textContent = `完成：HTTP ${response.status}`;
      statusEl.className = response.ok ? "status-text ok" : "status-text error";
      responseEl.textContent = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
    } catch (error) {
      statusEl.textContent = `請求失敗：${error.message}`;
      statusEl.className = "status-text error";
    }
  });
}

function initDataLayerSimulator() {
  const eventEl = document.getElementById("dlEvent");
  const paramsEl = document.getElementById("dlParams");
  const outputEl = document.getElementById("dlOutput");
  const statusEl = document.getElementById("dlStatus");
  const pushBtn = document.getElementById("dlPushBtn");
  const clearBtn = document.getElementById("dlClearBtn");

  const history = [];

  function renderHistory() {
    outputEl.textContent = JSON.stringify(history, null, 2);
  }

  pushBtn.addEventListener("click", () => {
    const eventName = eventEl.value.trim();
    if (!eventName) {
      statusEl.textContent = "請輸入 event name";
      statusEl.className = "status-text error";
      return;
    }

    const paramsResult = safeParseJSON(paramsEl.value, "Parameters");
    if (paramsResult.error) {
      statusEl.textContent = paramsResult.error;
      statusEl.className = "status-text error";
      return;
    }

    const payload = {
      event: eventName,
      ...paramsResult.value,
    };

    history.push(payload);
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);

    statusEl.textContent = `已推送至 dataLayer（目前 ${history.length} 筆）`;
    statusEl.className = "status-text ok";
    renderHistory();
  });

  clearBtn.addEventListener("click", () => {
    history.length = 0;
    statusEl.textContent = "紀錄已清除";
    statusEl.className = "status-text";
    renderHistory();
  });

  renderHistory();
}

initJsonFormatter();
initSnippetRunner();
initRegexTester();
initApiTester();
initDataLayerSimulator();
