# Mi corazón, mi luna · ASCII

Una sola escena, sin menús ni botones: una **luna ASCII enorme** con cráteres y
mares, un **corazón** que gira a su alrededor sobre una órbita inclinada y un
cielo nocturno lleno de estrellas, polvo y fugaces. Todo se dibuja carácter a
carácter sobre `<canvas>`.

La música de fondo es **Mitski — My Love Mine All Mine**, desde el MP3 local del
proyecto, en bucle y sin controles visibles.

## Cómo abrirla

### Opción recomendada

Haz doble clic en **`iniciar.bat`**. Levanta un servidor local y abre
`http://127.0.0.1:8123/` en el navegador.

O desde una terminal:

```bash
python servidor.py
```

### Opción rápida

Abre `index.html` directamente. Si el navegador bloquea el audio, aparecerá un
aviso diminuto en la parte inferior: toca o pulsa cualquier tecla una vez y la
música empezará.

## Controles

No hay interfaz. Solo existe:

- Un clic, toque o tecla para desbloquear el audio si el navegador lo exige.
- Nada más: la escena y la música se reproducen solas.

## Estructura

```
corazon-luna-ascii/
├── index.html          # página mínima: canvas, audio y pie de crédito
├── styles.css          # fondo, viñeta, grano y aparición suave
├── servidor.py         # servidor local + apertura del navegador
├── iniciar.bat         # atajo de Windows
├── favicon.svg
├── assets/
│   └── music/
│       └── mitski-my-love-mine-all-mine.mp3
└── js/
    ├── core.js         # utilidades, PRNG, paletas y tipografía
    ├── starfield.js    # estrellas, vía láctea y estrellas fugaces
    ├── heart.js        # silueta de corazón, órbita, estela y brillo
    ├── moon.js         # luna ASCII cacheada, cráteres y bloom
    └── main.js         # composición, orden de dibujo, audio y bucle
```

## Detalles técnicos

- **Luna**: esfera sombreada de 58×58 celdas con mares, cráteres (fondo hundido
  y borde iluminado), racimos de color, halo y bloom. Se renderiza una vez a un
  canvas fuera de pantalla y se reutiliza hasta que cambia el tamaño.
- **Corazón**: silueta paramétrica clásica
  `x = 16·sen³t`, `y = 13·cos t − 5·cos 2t − 2·cos 3t − cos 4t`, rellenada con
  una cuadrícula de caracteres. Tiene borde neón, sombra propia y motas doradas.
  La silueta se dibuja nítida para que se lea siempre como un corazón.
- **Órbita**: elipse inclinada con polvo ASCII. La mitad delantera se dibuja
  delante de la luna y la trasera detrás; el disco lunar oculta el corazón
  cuando pasa por atrás y los puntos nunca se pintan sobre la cara de la luna.
- **Cielo**: PRNG determinista (siempre se ve igual), 900 estrellas, banda de
  vía láctea y estrellas fugaces ocasionales.
- **Audio**: `<audio loop>` con el MP3 local, volumen con *fade-in* y desbloqueo
  por el primer gesto si el navegador bloquea la reproducción automática.
- **Rendimiento**: bucle limitado a ~30 fps y textura de terminal estable.

## Créditos

- Música: [Mitski — My Love Mine All Mine](https://www.youtube.com/watch?v=CwGbMYLjIpQ)
- Tipografía: IBM Plex Mono (Google Fonts), con alternativas del sistema.
- Inspiración visual: arte ASCII generativo sobre cielo nocturno.
