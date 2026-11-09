import {escapeHTML as e, icon, sectionHeading, safeWebURL} from "./ui.js";
import {renderMedia, bindMedia, pauseMedia} from "./media.js";

export function projectTags(project) {
  return '<ul class="tag-list" aria-label="技术栈">' + project.stack.map(tech => '<li class="tag">' + e(tech) + '</li>').join("") + '</ul>';
}
export function projectStatus(project) {
  return '<span class="project-status ' + (project.statusType === "progress" ? "status-progress" : "status-ready") + '"><span></span>' + e(project.status) + '</span>';
}
export function sourceLink(project) {
  const url = safeWebURL(project.github);
  return url ? '<a class="source-link" href="' + e(url) + '" target="_blank" rel="noopener noreferrer">' + icon("github") + 'GitHub 源码 ' + icon("external") + '</a>' :
    '<span class="source-pending">' + icon("github") + '源码链接待补充</span>';
}

function renderCard(project) {
  return '<article class="project-card" aria-labelledby="project-' + e(project.id) + '">' + renderMedia(project) +
    '<div class="project-content"><div class="project-meta"><span class="project-category">' + e(project.categoryLabel) + '</span>' + projectStatus(project) +
    '</div><h3 id="project-' + e(project.id) + '">' + e(project.title) + '</h3><p class="project-summary">' + e(project.summary) + '</p>' +
    projectTags(project) + '<div class="project-copy"><div class="project-features"><h4>' + (project.statusType === "progress" ? '当前实践范围' : '核心功能') +
    '</h4><ul>' + project.features.map(text => '<li>' + e(text) + '</li>').join("") + '</ul></div>' +
    '<div class="project-contribution"><h4>我的贡献</h4><p>' + project.contributions.map(e).join("<br>") + '</p></div></div>' +
    '<div class="project-actions">' + sourceLink(project) + '<a class="text-link" href="./project.html?id=' + encodeURIComponent(project.id) + '">项目详情 ' + icon("arrow") +
    '</a></div></div></article>';
}

export function renderProjects(data) {
  const host = document.getElementById("projects");
  host.innerHTML = sectionHeading("02","PROJECTS","精选项目","从云端任务调度，到端侧模型部署，再到嵌入式系统实践。") +
    '<div class="projects-filter-row"><div class="project-filters" role="group" aria-label="按技术方向筛选项目">' + data.categories.map(category => {
      const count = data.projects.filter(project => category.id === "all" || project.category === category.id).length;
      return '<button type="button" data-filter="' + e(category.id) + '" aria-pressed="' + (category.id === "all") + '">' + e(category.label) + '<span>' + String(count).padStart(2,"0") + '</span></button>';
    }).join("") + '</div><p class="project-result-count" aria-live="polite" aria-atomic="true"></p></div><div class="project-list"></div>';
  const list = host.querySelector(".project-list");
  const update = category => {
    pauseMedia(list);
    const projects = data.projects.filter(project => category === "all" || project.category === category);
    list.innerHTML = projects.map(renderCard).join("") || '<p class="empty-projects">该方向暂无项目。</p>';
    bindMedia(list, projects);
    host.querySelector(".project-result-count").textContent = projects.length + " 个项目";
    host.querySelectorAll("[data-filter]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.filter === category)));
  };
  host.querySelector(".project-filters").addEventListener("click", event => {
    const button = event.target.closest("[data-filter]");
    if (button) update(button.dataset.filter);
  });
  update("all");
}
