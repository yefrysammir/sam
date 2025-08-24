// Theme toggle
const themeBtn = document.getElementById("themeToggle");
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark") ? "light_mode" : "dark_mode";
});

// Navbar scroll + parallax portada
const navbar = document.getElementById("navbar");
const coverImg = document.getElementById("cover");
window.addEventListener("scroll", () => {
  if(window.scrollY > 50){
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
  coverImg.style.transform = `translateY(${window.scrollY * 0.4}px)`;
});

// Cargar data
fetch("data.json")
  .then(r=>r.json())
  .then(data=>{
    document.getElementById("avatar").src = data.avatar;
    document.getElementById("cover").src = data.cover;
    document.getElementById("fullName").textContent = data.fullName;
    document.getElementById("username").textContent = data.username;
    document.getElementById("usernameTop").textContent = data.username;
    document.getElementById("bio").textContent = data.bio;

    // info extra
    const left = document.getElementById("infoLeft");
    if(data.location) left.innerHTML += `<span class="material-symbols-outlined">location_on</span> ${data.location}`;
    if(data.website) left.innerHTML += `<a href="${data.website}" target="_blank">${data.website}</a>`;

    // redes
    const right = document.getElementById("infoRight");
    for(let s of data.socials){
      right.innerHTML += `<a href="${s.url}" target="_blank"><span class="material-symbols-outlined">${s.icon}</span></a>`;
    }

    // posts
    const postsBox = document.getElementById("posts");
    data.posts.forEach(p=>{
      const el = document.createElement("div");
      el.className="post";
      el.innerHTML = `<p>${p.text}</p>`;
      if(p.image) el.innerHTML += `<img src="${p.image}" alt="">`;
      if(p.video) el.innerHTML += `<video controls src="${p.video}"></video>`;
      postsBox.appendChild(el);
    });
  });