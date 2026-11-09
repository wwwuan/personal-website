import {escapeHTML as e, icon, sectionHeading, safeWebURL, localAsset, toast} from "./ui.js";

export function resumeButton(profile, extraClass = "") {
  const path = localAsset(profile.resume);
  return profile.resumeAvailable && path
    ? '<a class="button ' + extraClass + ' resume-link" href="' + e(path) + '" download>' + icon("download") + '下载简历</a>'
    : '<button class="button ' + extraClass + '" type="button" disabled title="简历 PDF 尚未添加">' + icon("download") + '下载简历 <small>待补充</small></button>';
}

function profileLinks(profile) {
  const github = safeWebURL(profile.github);
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? profile.email : "";
  return '<div class="hero-socials">' +
    (github ? '<a href="' + e(github) + '" target="_blank" rel="noopener noreferrer">' + icon("github") + 'GitHub ' + icon("external") + '</a>' : '<span class="pending-link">' + icon("github") + 'GitHub <small>待补充</small></span>') +
    '<span class="social-separator"></span>' +
    (email ? '<a href="mailto:' + e(email) + '">' + icon("mail") + e(email) + '</a>' : '<span class="pending-link">' + icon("mail") + 'Email <small>待补充</small></span>') + '</div>';
}

export function renderHero(profile) {
  document.getElementById("home").innerHTML = '<div class="hero-grid"><div class="hero-copy">' +
    '<p class="hero-greeting"><span class="status-dot"></span>你好，我是 <strong>' + e(profile.name) + '</strong></p>' +
    '<h1>从后端到端侧，<br><span>构建可运行的系统。</span></h1>' +
    '<p class="hero-roles">' + profile.headline.split(" / ").map(role => '<span>' + e(role) + '</span>').join('<b>/</b>') + '</p>' +
    '<p class="hero-intro">' + e(profile.introduction) + '</p>' +
    '<div class="hero-actions"><a class="button button-primary" href="#projects">查看我的项目 ' + icon("arrow") + '</a>' + resumeButton(profile) + '</div>' +
    profileLinks(profile) + '</div>' +
    '<aside class="focus-panel" aria-label="技术关注方向"><div class="focus-panel-head"><span class="window-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>engineering.focus</span>' + icon("terminal") + '</div>' +
    '<div class="focus-panel-body"><p class="focus-comment">// 让不同技术协同工作</p>' +
    '<div class="focus-item">' + icon("server") + '<div><h2>Backend Development</h2><p>Python · Flask · FastAPI · Redis</p></div><span class="focus-index">01</span></div>' +
    '<div class="focus-connector" aria-hidden="true"></div><div class="focus-item">' + icon("chip") + '<div><h2>Embedded Linux</h2><p>ARM · U-Boot · i.MX6ULL</p></div><span class="focus-index">02</span></div>' +
    '<div class="focus-connector" aria-hidden="true"></div><div class="focus-item">' + icon("terminal") + '<div><h2>Edge AI Applications</h2><p>Jetson · Docker · llama.cpp</p></div><span class="focus-index">03</span></div></div>' +
    '<div class="focus-panel-foot"><span class="tiny-dot"></span><span>学习 · 实践 · 连接系统</span><span>~/portfolio</span></div></aside></div>' +
    '<div class="hero-bottom"><span>' + icon("book") + '中南大学 · 生物医学工程</span><span><span class="tiny-dot"></span>' + e(profile.seeking) + '</span><a href="#about">向下了解更多 <span aria-hidden="true">↓</span></a></div>';
}

export function renderAbout(profile, education) {
  document.getElementById("about").innerHTML = sectionHeading("01","ABOUT","关于我") +
    '<div class="about-grid"><div class="about-copy">' + profile.about.map(text => '<p>' + e(text) + '</p>').join("") +
    '</div><dl class="about-facts"><div><dt>教育背景</dt><dd>' + e(education.university) + ' · ' + e(education.degree) + '</dd></div>' +
    '<div><dt>开发语言</dt><dd>C / Python</dd></div><div><dt>关注方向</dt><dd>后端开发 / 嵌入式 Linux / 边缘 AI</dd></div></dl></div>';
}

export function renderSkills(skills) {
  document.getElementById("skills").innerHTML = sectionHeading("03","SKILLS","技术栈","围绕实际项目使用的技术，持续学习与实践。") +
    '<div class="skills-grid">' + skills.map(skill => '<article class="skill-card">' + icon(skill.icon) + '<h3>' + e(skill.title) +
    '</h3><p>' + e(skill.subtitle) + '</p><ul class="tag-list">' + skill.items.map(item => '<li class="tag">' + e(item) + '</li>').join("") + '</ul></article>').join("") + '</div>';
}

export function renderEducation(education) {
  document.getElementById("education").innerHTML = sectionHeading("04","EDUCATION","教育经历") +
    '<article class="education-card"><div class="education-mark">' + icon("book") + '</div><div class="education-info"><h3>' + e(education.university) + '</h3><p>' +
    e(education.major) + '<span> / </span>' + e(education.degree) + '</p>' + (education.extra ? '<p>' + e(education.extra) + '</p>' : '') +
    '</div><p class="education-period">' + e(education.period) + '</p></article>';
}

export function renderContact(profile) {
  const github = safeWebURL(profile.github);
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email) ? profile.email : "";
  const resume = profile.resumeAvailable ? localAsset(profile.resume) : "";
  const card = (symbol, title, text, href, extra = "") => '<' + (href ? 'a' : 'div') + ' class="contact-card' + (href ? '' : ' is-pending') + '"' +
    (href ? ' href="' + e(href) + '" ' + extra : '') + '>' + icon(symbol) + '<div><h3>' + title + '</h3><p>' + e(text) + '</p></div>' +
    icon(href ? "arrow" : "code", href ? "" : "pending-icon") + '</' + (href ? 'a' : 'div') + '>';
  document.getElementById("contact").innerHTML = sectionHeading("05","CONTACT","一起构建下一个项目。","欢迎交流后端开发、嵌入式 Linux 和 AI 应用。") +
    '<div class="contact-grid">' +
    card("github","GitHub",github ? new URL(github).pathname.replace(/^\//,"") : "GitHub 地址待补充",github,'target="_blank" rel="noopener noreferrer"') +
    card("mail","Email",email || "邮箱地址待补充",email ? "mailto:" + email : "") +
    card("download","Resume",resume ? "下载个人简历 · PDF" : "简历文件待补充",resume,'download') + '</div>' +
    (email ? '<button class="copy-email text-link" type="button">' + icon("copy") + '复制邮箱地址</button>' : '');
  document.querySelector(".copy-email")?.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(email); toast("邮箱地址已复制"); }
    catch { toast("请通过邮箱链接查看或手动复制邮箱地址"); }
  });
}

export function renderHome(data) {
  renderHero(data.profile);
  renderAbout(data.profile, data.education);
  renderSkills(data.skills);
  renderEducation(data.education);
  renderContact(data.profile);
  document.title = data.profile.name + " · Developer Portfolio";
}
