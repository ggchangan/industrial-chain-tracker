const form = document.querySelector("#adminLoginForm");
const password = document.querySelector("#adminPassword");
const message = document.querySelector("#adminLoginMessage");
const submit = form.querySelector("button[type='submit']");
const params = new URLSearchParams(window.location.search);
const next = safeNext(params.get("next"));

checkSession();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("正在验证…");
  submit.disabled = true;

  try {
    const response = await fetch("./api/v1/admin/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password.value })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "登录失败");
    window.location.replace(next);
  } catch (error) {
    setStatus(error.message, true);
    password.select();
  } finally {
    submit.disabled = false;
  }
});

async function checkSession() {
  try {
    const response = await fetch("./api/v1/admin/session", { credentials: "same-origin" });
    const payload = await response.json();
    if (payload.authenticated) {
      window.location.replace(next);
      return;
    }
    if (!payload.configured) {
      setStatus("服务器尚未配置维护密码，请设置 ADMIN_PASSWORD 和 ADMIN_SESSION_SECRET。", true);
    }
  } catch {
    setStatus("维护服务暂时不可用。", true);
  }
}

function setStatus(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function safeNext(value) {
  return value === "/README.md" ? value : "/maintain.html";
}
