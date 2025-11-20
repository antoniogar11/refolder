# Iconos PWA

Necesitas crear dos iconos para la PWA:

1. **icon-192.png**: 192x192 píxeles
2. **icon-512.png**: 512x512 píxeles

Puedes crear estos iconos usando:
- Figma
- Canva
- Cualquier editor de imágenes

El icono debería tener un fondo sólido (preferiblemente azul #2563eb) con la letra "R" o el logo de Refolder.

Para generar rápidamente desde la terminal (si tienes ImageMagick):
```bash
convert -size 192x192 xc:#2563eb -gravity center -pointsize 120 -fill white -font Arial-Bold -annotate +0+0 "R" icon-192.png
convert -size 512x512 xc:#2563eb -gravity center -pointsize 320 -fill white -font Arial-Bold -annotate +0+0 "R" icon-512.png
```
