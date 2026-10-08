/* ============================================================
   core/log.js - 日志
   ============================================================ */

function log(text, cls = "c-normal") {
  logBuffer.push({ text, cls });
  if (logBuffer.length > 300) logBuffer.shift();

  logUnread++;
  const badge = document.getElementById("logBadge");
  const icon = document.getElementById("logIcon");
  if (badge) {
    badge.textContent = logUnread > 99 ? "99+" : logUnread;
    if (icon) icon.classList.add("has-new");
  }
}

function openLog() {
  logUnread = 0;
  const badge = document.getElementById("logBadge");
  const icon = document.getElementById("logIcon");
  if (badge) badge.textContent = "0";
  if (icon) icon.classList.remove("has-new");

  const html = logBuffer.map(l => `<div class="${l.cls}">${l.text}</div>`).join("")
             || '<div class="c-normal">暂无日志。</div>';

  document.getElementById("logBox").innerHTML = `
    <h3>日志</h3>
    <div class="log-content" id="logContent">${html}</div>
    <div class="actions" style="margin-top:8px;display:flex;justify-content:flex-end;">
      <button onclick="closeLog()">关闭</button>
    </div>
  `;
  document.getElementById("logMask").classList.add("show");

  setTimeout(() => {
    const el = document.getElementById("logContent");
    if (el) el.scrollTop = el.scrollHeight;
  }, 10);
}

function closeLog() {
  document.getElementById("logMask").classList.remove("show");
}