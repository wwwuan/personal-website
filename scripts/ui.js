export const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[char]);

const shapes = {
  code: '<path d="m8 5-6 7 6 7m8-14 6 7-6 7m-3-17-2 20"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  external: '<path d="M14 3h7v7m0-7L10 14m0-10H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-5"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1 .1-1.6-.5-2.2 3.3-.4 6.5-1.6 6.5-7A5.4 5.4 0 0 0 19.5 5c.2-1 .1-2-.3-3 0 0-1.2-.4-4 1.5a13 13 0 0 0-7 0C5.4 1.6 4.2 2 4.2 2c-.4 1-.5 2-.3 3A5.4 5.4 0 0 0 2.4 9c0 5.3 3.2 6.5 6.5 7-.5.5-.7 1.1-.7 2v4"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  play: '<path d="m9 5 11 7-11 7Z"/>',
  server: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M11 6.5h6m-6 11h6"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 1v5m6-5v5M9 18v5m6-5v5M1 9h5m-5 6h5m12-6h5m-5 6h5"/><rect x="9" y="9" width="6" height="6" rx="1"/>',
  terminal: '<path d="m5 6 6 6-6 6m8 0h6"/>',
  book: '<path d="M4 3h7a2 2 0 0 1 2 2v16a3 3 0 0 0-3-2H4Zm16 0h-5a2 2 0 0 0-2 2v16a3 3 0 0 1 3-2h4Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  folder: '<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>'
};
export function icon(name, className = "") {
  return '<svg class="icon ' + className + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (shapes[name] || shapes.code) + '</svg>';
}
export function sectionHeading(number, english, title, description = "") {
  const id = {ABOUT:"about",PROJECTS:"projects",SKILLS:"skills",EDUCATION:"education",CONTACT:"contact"}[english] || english.toLowerCase();
  return '<div class="section-heading"><div><p class="eyebrow"><span>' + number + '</span> / ' + english + '</p><h2 id="' + id + '-title">' + escapeHTML(title) + '</h2></div>' + (description ? '<p class="section-description">' + escapeHTML(description) + '</p>' : '') + '</div>';
}
export function safeWebURL(value) {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.href : ""; }
  catch { return ""; }
}
export function localAsset(value) {
  return typeof value === "string" && /^\/(images|videos|files)\/[a-zA-Z0-9_./-]+$/.test(value) && !value.includes("..") ? value : "";
}
export function toast(message) {
  const target = document.getElementById("toast");
  target.textContent = message;
  target.classList.add("is-visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => target.classList.remove("is-visible"), 4000);
}
export function renderShell(profile) {
  const home = document.body.dataset.page === "home";
  const prefix = home ? "" : "/index.html";
  const links = [["about","关于"],["projects","精选项目"],["skills","技术栈"],["education","教育"]];
  document.getElementById("site-header").innerHTML = '<div class="nav-wrap container">' +
    '<a class="brand" href="' + prefix + '#home" aria-label="作品集首页"><span class="brand-mark">' + icon("code") + '</span><span>DEV<span class="brand-dot">.</span>FOLIO</span></a>' +
    '<button class="menu-toggle" type="button" aria-label="打开导航" aria-expanded="false" aria-controls="primary-nav">' + icon("menu") + '</button>' +
    '<nav class="primary-nav" id="primary-nav" aria-label="主导航">' + links.map(([id,label]) => '<a href="' + prefix + '#' + id + '">' + label + '</a>').join("") +
    '<a class="nav-contact" href="' + prefix + '#contact">联系我 ' + icon("arrow") + '</a></nav></div>';
  document.getElementById("site-footer").innerHTML = '<a class="footer-brand" href="' + prefix + '#home">' + icon("code") +
    '<span>' + escapeHTML(profile.name) + ' · Developer Portfolio</span></a><span class="footer-note">以实践为起点，持续构建。</span><a class="back-top" href="' + prefix + '#home">回到顶部 ↑</a>';
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-nav");
  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "打开导航");
    toggle.innerHTML = icon("menu");
    nav.classList.remove("is-open");
  };
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "关闭导航" : "打开导航");
    toggle.innerHTML = icon(open ? "close" : "menu");
    nav.classList.toggle("is-open", open);
  });
  nav.addEventListener("click", event => { if (event.target.closest("a")) close(); });
  document.addEventListener("click", event => { if (!event.composedPath().includes(document.querySelector(".nav-wrap"))) close(); });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { close(); toggle.focus(); }
  });
  matchMedia("(min-width: 761px)").addEventListener("change", close);
}
export function observeSections() {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      document.querySelectorAll(".primary-nav a").forEach(link => {
        if (link.hash === "#" + entry.target.id) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }
  }, {rootMargin:"-15% 0px -55% 0px", threshold:0});
  document.querySelectorAll("main > section[id]").forEach(section => observer.observe(section));
}
