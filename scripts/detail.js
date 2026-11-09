import {escapeHTML as e, icon} from "./ui.js";
import {renderMedia, bindMedia} from "./media.js";
import {projectTags, projectStatus, sourceLink} from "./projects.js";

export function renderDetail(data) {
  const id = new URLSearchParams(location.search).get("id");
  const index = data.projects.findIndex(project => project.id === id);
  const host = document.getElementById("main");
  if (index < 0) {
    document.title = "未找到项目 · Developer Portfolio";
    host.innerHTML = '<section class="detail-not-found"><p class="eyebrow">PROJECT NOT FOUND</p><h1>未找到这个项目</h1><p>该项目可能尚未添加，或链接中的项目编号不正确。</p><a class="button button-primary" href="/index.html#projects">' + icon("back") + '返回项目列表</a></section>';
    return;
  }
  const project = data.projects[index];
  document.title = project.title + " · " + data.profile.name;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = project.summary;
  const next = data.projects[(index+1) % data.projects.length];
  host.innerHTML = '<a class="detail-back text-link" href="/index.html#projects">' + icon("back") + '返回所有项目</a>' +
    '<header class="detail-heading"><p class="eyebrow"><span>' + e(project.number) + '</span> / ' + e(project.categoryLabel) + '</p>' +
    '<h1>' + e(project.title) + '</h1><p class="detail-english">' + e(project.englishTitle) + '</p><div class="detail-meta">' + projectStatus(project) +
    '<span>' + e(project.role) + '</span></div><p class="detail-summary">' + e(project.summary) + '</p>' + projectTags(project) +
    '<div class="detail-heading-actions">' + sourceLink(project) + '</div></header>' +
    '<div class="detail-grid"><div class="detail-content">' +
    '<section class="detail-section" aria-labelledby="overview-title"><h2 id="overview-title">项目背景</h2><p>' + e(project.overview) + '</p></section>' +
    '<section class="detail-section" aria-labelledby="flow-title"><h2 id="flow-title">' + e(project.flowLabel || "技术工作流") + '</h2><ol class="architecture-flow">' +
    project.flow.map((step,i) => '<li><span>' + String(i+1).padStart(2,"0") + '</span>' + e(step) + '</li>').join("") + '</ol></section>' +
    '<section class="detail-section" aria-labelledby="implementation-title"><h2 id="implementation-title">' + (project.statusType === "progress" ? '实践计划与当前状态' : '技术实现') +
    '</h2><div class="implementation-list">' + project.implementation.map(item => '<article><h3>' + e(item.title) + '</h3><p>' + e(item.body) + '</p></article>').join("") + '</div></section>' +
    '<section class="detail-section" aria-labelledby="ownership-title"><h2 id="ownership-title">个人贡献与职责边界</h2><div class="ownership-list">' + project.ownership.map((item,i) =>
    '<article class="' + (i === 0 ? 'ownership-personal' : '') + '"><h3>' + e(item.label) + '</h3><p>' + e(item.body) + '</p></article>').join("") + '</div></section>' +
    '<section class="detail-section" aria-labelledby="scope-title"><h2 id="scope-title">当前范围</h2><ul class="detail-bullets">' + project.boundaries.map(text => '<li>' + e(text) + '</li>').join("") +
    '</ul></section>' +
    (project.nextSteps.length ? '<section class="detail-section" aria-labelledby="next-title"><h2 id="next-title">后续补充</h2><ul class="detail-bullets">' +
      project.nextSteps.map(text => '<li>' + e(text) + '</li>').join("") + '</ul></section>' : '') + '</div>' +
    '<aside class="detail-sidebar"><div class="detail-media">' + renderMedia(project) + '</div><div class="detail-facts"><h2>项目信息</h2><dl><div><dt>实践方向</dt><dd>' +
    e(data.categories.find(category => category.id === project.category)?.label || "") + '</dd></div><div><dt>本人职责</dt><dd>' + e(project.role) +
    '</dd></div><div><dt>当前状态</dt><dd>' + e(project.status) + '</dd></div></dl><a class="text-link" href="/index.html#contact">联系我了解项目 ' + icon("arrow") + '</a></div></aside></div>' +
    '<nav class="detail-pagination" aria-label="浏览其他项目"><a class="text-link" href="/index.html#projects">' + icon("back") + '所有项目</a>' +
    '<a class="next-project" href="/project.html?id=' + encodeURIComponent(next.id) + '"><span>下一个项目</span><strong>' + e(next.title) + '</strong>' + icon("arrow") + '</a></nav>';
  bindMedia(host, [project]);
}
