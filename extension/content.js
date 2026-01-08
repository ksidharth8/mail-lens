/* global chrome */
const API_BASE = "https://mail-lens.onrender.com";
let panel = null;

/* ---------- Utils ---------- */

function getThreadId() {
	const match = location.href.match(/#(?:inbox|all|label\/[^/]+)\/([^/?]+)/);
	return match ? match[1] : null;
}

function extractEmailText() {
	const selectors = ["div.a3s.aiL", "div.a3s"];
	for (const sel of selectors) {
		const el = document.querySelector(sel);
		if (el && el.innerText.trim()) return el.innerText.trim();
	}
	return null;
}

/* ---------- Auth ---------- */

async function login() {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({ type: "GET_GOOGLE_TOKEN" }, async (res) => {
			if (!res || res.error || !res.token) {
				reject("Google auth failed");
				return;
			}

			const googleToken = res.token;

			const resp = await fetch(`${API_BASE}/auth/google`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${googleToken}`,
				},
			});

			const data = await resp.json();

			if (!data.sessionToken) {
				reject("Session token not received");
				return;
			}

			localStorage.setItem("mailLensSession", data.sessionToken);
			resolve();
		});
	});
}

/* ---------- Drag ---------- */

function enableDragging(panel) {
	const header = panel.querySelector("#header");
	if (!header) return;

	let dragging = false,
		startX,
		startY;

	header.onmousedown = (e) => {
		dragging = true;
		startX = e.clientX - panel.offsetLeft;
		startY = e.clientY - panel.offsetTop;
	};

	document.onmousemove = (e) => {
		if (!dragging) return;
		panel.style.left = e.clientX - startX + "px";
		panel.style.top = e.clientY - startY + "px";
	};

	document.onmouseup = () => {
		dragging = false;
	};
}

/* ---------- UI ---------- */

function renderAuthUI(content) {
	content.innerHTML = `
    <div style="padding:16px">
      <h3>MailLens</h3>
      <p>Sign in to continue</p>
      <button id="login-btn">Sign in with Google</button>
    </div>
  `;

	document.getElementById("login-btn").onclick = async () => {
		try {
			await login();
			const token = localStorage.getItem("mailLensSession");
			if (!token) throw new Error("Session missing after login");
			initAppUI(content);
		} catch (e) {
			alert("Login failed");
		}
	};
}

function renderAppUI(content, emailText, threadId) {
	content.innerHTML = `
    <div id="header"
         style="padding:12px;border-bottom:1px solid #eee;
                display:flex;gap:8px;align-items:center;cursor:move;">
      <strong style="flex:1;">MailLens</strong>
      <select id="type">
        <option value="short">Short</option>
        <option value="bullets">Bullets</option>
        <option value="detailed">Detailed</option>
      </select>
    </div>

    <div style="padding:12px">
      <button id="summarize">Summarize</button>
      <div id="result" style="margin-top:12px;white-space:pre-wrap"></div>
    </div>
  `;

	const btn = content.querySelector("#summarize");
	const result = content.querySelector("#result");
	const typeSel = content.querySelector("#type");

	const updateView = () => {
		const key = `maillens:${threadId}:${typeSel.value}`;
		const cached = sessionStorage.getItem(key);
		result.innerText =
			cached && cached !== "undefined"
				? cached
				: "Click Summarize to generate.";
	};

	typeSel.onchange = updateView;
	updateView();

	btn.onclick = async () => {
		btn.disabled = true;
		const key = `maillens:${threadId}:${typeSel.value}`;
		if (sessionStorage.getItem(key)) {
			result.innerText = sessionStorage.getItem(key);
			return;
		}

		result.innerText = "Summarizing...";
		const sessionToken = localStorage.getItem("mailLensSession");

		const res = await fetch(`${API_BASE}/summarize`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${sessionToken}`,
			},
			body: JSON.stringify({
				emailText,
				summaryType: typeSel.value,
			}),
		});

		const data = await res.json();
		const summary = data?.summary;

		if (!summary || !summary.trim()) {
			result.innerText = "Failed to generate summary. Retry.";
			return;
		}

		sessionStorage.setItem(key, summary);
		result.innerText = summary;
		btn.disabled = false;
	};

	enableDragging(panel);
}

/* ---------- Panel ---------- */

function togglePanel() {
	if (panel) {
		panel.style.display = panel.style.display === "none" ? "block" : "none";
		return;
	}

	panel = document.createElement("div");
	panel.style.cssText = `
    position:fixed;
    top:80px;
    right:20px;
    width:360px;
    height:480px;
    min-width:180px;
    min-height:240px;
    background:#fff;
    border:1px solid #ccc;
    z-index:9999;
    border-radius:10px;
    box-shadow:0 4px 16px rgba(0,0,0,.2);
    display:block;
    resize:both;
    overflow:auto;
  `;

	panel.innerHTML = `
    <div id="maillens-content" style="height:100%;display:flex;flex-direction:column"></div>
    <div id="maillens-resizer"
         style="position:absolute;bottom:0;left:0;width:16px;height:16px;
                cursor:nwse-resize;"></div>
  `;

	document.body.appendChild(panel);

	const content = panel.querySelector("#maillens-content");
	const token = localStorage.getItem("mailLensSession");

	if (!token) {
		renderAuthUI(content);
	} else {
		content.innerHTML = `
    <div style="padding:16px">
      <strong>MailLens</strong>
      <p>Loading…</p>
    </div>
  `;
		waitForGmailAndInit(content);
	}
}

function waitForGmailAndInit(content) {
	let attempts = 0;

	const timer = setInterval(() => {
		const emailText = extractEmailText();
		const threadId = getThreadId();

		if (emailText && threadId) {
			clearInterval(timer);
			renderAppUI(content, emailText, threadId);
		}

		attempts++;
		if (attempts > 3) {
			clearInterval(timer);
			content.innerHTML = `
        <div style="padding:16px">
          <strong>MailLens</strong>
          <p>Open an email thread to summarize.</p>
        </div>
      `;
		}
	}, 400);
}

function initAppUI(content) {
	const emailText = extractEmailText();
	const threadId = getThreadId();

	if (!emailText || !threadId) return;
	renderAppUI(content, emailText, threadId);
}

/* ---------- Message ---------- */

chrome.runtime.onMessage.addListener((msg) => {
	if (msg.type === "TOGGLE_PANEL") togglePanel();
});
