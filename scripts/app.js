import {renderShell, observeSections, localAsset} from "./ui.js";
import {renderHome} from "./home.js";
import {renderProjects} from "./projects.js";
import {renderDetail} from "./detail.js";

async function checkResume(profile) {
  const path = profile.resumeAvailable ? localAsset(profile.resume) : "";
  if (!path) return;
  try {
    const response = await fetch(path, {method:"HEAD"});
    profile.resumeAvailable = response.ok && /application\/pdf/i.test(response.headers.get("Content-Type") || "");
  } catch {
    profile.resumeAvailable = false;
  }
}

async function init() {
  try {
    const response = await fetch("./assets/portfolio.json");
    if (!response.ok) throw new Error("Unable to load portfolio data");
    const data = await response.json();
    if (!data.profile || !Array.isArray(data.projects)) throw new Error("Invalid portfolio data");
    renderShell(data.profile);
    if (document.body.dataset.page === "home") {
      await checkResume(data.profile);
      renderHome(data);
      renderProjects(data);
      observeSections();
    } else {
      renderDetail(data);
    }
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) requestAnimationFrame(() => target.scrollIntoView({behavior:"instant", block:"start"}));
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) document.querySelectorAll("video").forEach(video => video.pause());
    });
  } catch (error) {
    console.error(error);
    document.getElementById("main").innerHTML = '<div class="load-error"><h1>页面暂时无法加载</h1><p>请确认已使用本地 HTTP 服务启动网站，且项目数据文件可正常访问。</p><button class="button button-primary" type="button" onclick="location.reload()">重新加载</button></div>';
  }
}
init();
