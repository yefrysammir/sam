game/
│
├── index.html
├── service-worker.js
├── manifest.json
│
├── config/
│   ├── game.config.json
│   ├── creatures.json
│   ├── leaders.json
│   └── items.json
│
├── engine/
│   ├── launcher.js        (pantalla inicial)
│   ├── saveSystem.js      (guardar / cargar)
│   ├── battleSystem.js    (combate)
│   ├── captureSystem.js   (capturas)
│   ├── mapSystem.js       (el mapa donde “buscas”)
│   └── playerSystem.js    (datos del jugador)
│
├── ui/
│   ├── ui.home.js
│   ├── ui.map.js
│   ├── ui.battle.js
│   └── ui.capture.js
│
└──  assets/
		├─ icons/
		│  ├─ icon-192.png  (placeholder)
		│  ├─ icon-512.png
		│  ├─ potion.png
		│  └─ great_ball.png
		└─ creatures/
   			├─ crystal_drake.png
   			└─ emberfox.png