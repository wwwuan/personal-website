import {escapeHTML as e, icon, localAsset, toast} from "./ui.js";

export function renderMedia(project) {
  const visual = project.visual;
  const cover = project.cover.available ? localAsset(project.cover.src) : "";
  const ready = project.video.available && localAsset(project.video.src);
  return '<div class="project-media theme-' + e(visual.theme) + '" data-project-media="' + e(project.id) + '">' +
    '<div class="media-stage"><div class="media-cover"><div class="cover-placeholder" aria-label="' + e(project.title) + '占位封面">' +
    '<div class="cover-top"><span>PROJECT / ' + e(project.number) + '</span><span>预留封面</span></div>' +
    '<div class="cover-title">' + visual.title.map(line => '<span>' + e(line) + '</span>').join("") + '</div>' +
    '<p class="cover-label">' + e(visual.label) + '</p><div class="cover-flow" aria-hidden="true">' +
    visual.nodes.map((node,i) => (i ? '<span class="flow-dash">—</span>' : '') + '<span>' + e(node) + '</span>').join("") + '</div>' +
    '<div class="cover-symbol" aria-hidden="true">' + icon(visual.icon) + '</div></div>' +
    (cover ? '<img class="project-cover-image" src="' + e(cover) + '" alt="' + e(project.title) + '项目封面" width="1280" height="800" loading="lazy" decoding="async">' : '') +
    '</div></div><div class="media-toolbar"><button class="demo-button" type="button" data-play aria-label="' +
    (ready ? '播放' : '查看') + e(project.title) + (ready ? '演示视频' : '演示状态') + '">' +
    '<span class="play-symbol">' + icon("play") + '</span><span data-play-label>' + (ready ? '播放项目演示' : '演示视频待补充') +
    '</span></button><span class="media-note">' + (ready ? '点击播放' : '素材待添加') + '</span></div></div>';
}

export function bindMedia(container, projects) {
  const byId = new Map(projects.map(project => [project.id, project]));
  container.querySelectorAll("[data-project-media]").forEach(host => {
    const project = byId.get(host.dataset.projectMedia);
    const cover = host.querySelector(".project-cover-image");
    if (cover) {
      const fallback = () => { cover.remove(); };
      cover.addEventListener("error", fallback, {once:true});
      if (cover.complete && !cover.naturalWidth) fallback();
    }
    const button = host.querySelector("[data-play]");
    const label = host.querySelector("[data-play-label]");
    const stage = host.querySelector(".media-stage");
    const playLabel = "播放" + project.title + "演示视频";
    const pauseLabel = "暂停" + project.title + "演示视频";
    let video = null;

    const restore = () => {
      if (!video) return;
      const oldVideo = video;
      video = null;
      oldVideo.pause();
      oldVideo.removeAttribute("src");
      oldVideo.load();
      oldVideo.remove();
      host.querySelector(".video-options")?.remove();
      host.classList.remove("is-playing");
      label.textContent = "重新播放演示";
      button.setAttribute("aria-label", playLabel);
      host.querySelector(".media-note").textContent = "播放未完成";
    };

    button.addEventListener("click", async () => {
      const src = project.video.available ? localAsset(project.video.src) : "";
      if (!src) {
        toast("演示视频尚未添加，当前展示为预留封面。");
        return;
      }
      if (video) {
        if (video.paused) {
          try { await video.play(); } catch { toast("暂时无法播放，请再次点击重试。"); }
        } else {
          video.pause();
        }
        return;
      }
      video = document.createElement("video");
      const current = video;
      current.controls = true;
      current.muted = true;
      current.defaultMuted = true;
      current.loop = true;
      current.playsInline = true;
      current.preload = "none";
      current.setAttribute("aria-label", project.title + "演示视频");
      const poster = project.cover.available ? localAsset(project.cover.src) : "";
      if (poster && cover?.isConnected) current.poster = poster;
      current.src = src;
      stage.append(current);
      const options = document.createElement("div");
      options.className = "video-options";
      options.innerHTML = '<button type="button" data-mute aria-pressed="true">静音</button><button type="button" data-loop aria-pressed="true">循环</button>';
      host.append(options);
      const mute = options.querySelector("[data-mute]");
      const loop = options.querySelector("[data-loop]");
      mute.addEventListener("click", () => { current.muted = !current.muted; });
      current.addEventListener("volumechange", () => {
        mute.setAttribute("aria-pressed", String(current.muted));
        mute.textContent = current.muted ? "静音" : "有声";
      });
      loop.addEventListener("click", () => {
        current.loop = !current.loop;
        loop.setAttribute("aria-pressed", String(current.loop));
      });
      current.addEventListener("play", () => {
        host.classList.add("is-playing");
        label.textContent = "暂停演示";
        button.setAttribute("aria-label", pauseLabel);
      });
      current.addEventListener("pause", () => {
        if (video !== current) return;
        label.textContent = "继续播放";
        button.setAttribute("aria-label", playLabel);
      });
      current.addEventListener("error", () => {
        if (video !== current) return;
        restore();
        toast("视频暂不可用，请稍后重试。");
      }, {once:true});
      try {
        await current.play();
        if (video === current) host.classList.add("is-playing");
      } catch {
        if (video !== current) return;
        restore();
        toast("视频暂不可用，请确认素材已添加。");
      }
    });
  });
}

export function pauseMedia(container) {
  container.querySelectorAll("video").forEach(video => video.pause());
}
