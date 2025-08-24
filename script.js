async function loadPosts() {
  const res = await fetch("data.json");
  const posts = await res.json();
  const feed = document.getElementById("feed");
  feed.innerHTML = "";

  posts.forEach(p => {
    const div = document.createElement("div");
    div.className = "post";

    let media = "";
    if (p.type === "image") {
      media = `<img src="${p.url}" alt="">`;
    } else if (p.type === "video") {
      media = `<video controls src="${p.url}"></video>`;
    }

    div.innerHTML = `
      <p>${p.text || ""}</p>
      ${media}
      <div class="time">${timeAgo(p.date)}</div>
    `;
    feed.appendChild(div);
  });
}

// Función estilo TikTok/Twitter para fechas
function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = (now - date) / 1000; // segundos

  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff/60)}min`;
  if (diff < 86400) return `hace ${Math.floor(diff/3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff/86400)}d`;

  if (diff < 2592000) return `hace ${Math.floor(diff/604800)}sem`;

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
  } else {
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit" });
  }
}

// Dark / Light
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Pull-to-refresh (simplificado)
let startY = 0;
document.addEventListener("touchstart", e => { startY = e.touches[0].clientY; });
document.addEventListener("touchend", e => {
  if (e.changedTouches[0].clientY - startY > 100) {
    loadPosts();
  }
});

// Inicial
loadPosts();