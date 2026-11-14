# Mi corazón, mi luna · ASCII

Una página web de una sola escena: un **corazón ASCII** volumétrico que late, una
**luna creciente** con cráteres y polvo orbital, y un cielo estrellado con
estrellas fugaces. Todo dibujado carácter a carácter sobre `<canvas>`.

La música de fondo es **Mitski — My Love Mine All Mine**, reproducida con el
reproductor oculto de YouTube.

## Cómo abrirla

### Opción recomendada (con servidor local)

Haz doble clic en **`iniciar.bat`**. Se abrirá el navegador en
`http://127.0.0.1:8123/` con la página y la música listas.

O desde una terminal:

```bash
python servidor.py
```

> Es recomendable usar el servidor local: algunos navegadores bloquean el
> reproductor de YouTube cuando la página se abre directamente con `file://`.

### Opción rápida

Abre `index.html` en el navegador y pulsa **«Entrar y reproducir»**. Si el
navegador bloquea el audio, usa el enlace del reproductor o el servidor local.

## Controles

| Tecla / control | Acción |
| --- | --- |
| `Entrar y reproducir` | Inicia la experiencia y la música |
| `Espacio` / `M` | Pausar o reanudar la música |
| `H` | Ocultar o mostrar la interfaz |
| `F` | Pantalla completa |

También hay botones para volumen, pausa y pantalla completa en la esquina
inferior derecha.

## Estructura

```
corazon-luna-ascii/
├── index.html          # estructura y portada
├── styles.css          # estética terminal, HUD y responsive
├── servidor.py         # servidor local + apertura del navegador
├── iniciar.bat         # atajo de Windows
└── js/
    ├── core.js         # utilidades, PRNG y paletas ASCII
    ├── starfield.js    # estrellas, vía láctea y estrellas fugaces
    ├── heart.js        # corazón volumétrico, latido y motas de luz
    ├── moon.js         # luna creciente, cráteres y polvo orbital
    ├── music.js        # YouTube IFrame API (loop y volumen)
    └── main.js         # composición, bucle y controles
```

## Detalles técnicos

- Arte generado con un PRNG determinista: siempre se ve igual, pero cada célula
  elige su carácter y color según la profundidad y la luz.
- El corazón se construye con la curva implícita
  `(x² + y² − 1)³ − x²y³ = 0`, muestreada en una cuadrícula y sombreada con una
  luz ficticia para conseguir volumen.
- La luna combina una esfera sombreada, un recorte creciente, cráteres y una
  capa tenue de *luz cenicienta* para insinuar el disco completo.
- El bucle se limita a ~30 fps para mantener la textura de terminal y el
  rendimiento en móviles.
- Respeta `prefers-reduced-motion` en las animaciones de interfaz.

## Créditos

- Música: [Mitski — My Love Mine All Mine](https://www.youtube.com/watch?v=CwGbMYLjIpQ)
- Tipografía: IBM Plex Mono (Google Fonts), con alternativas del sistema.
- Inspiración visual: arte ASCII generativo sobre cielo nocturno.
