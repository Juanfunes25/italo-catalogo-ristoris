# Resumen — Catálogo Ristoris para tablet (Italo Gelateria)

## Estado del catálogo

**68 de 68 productos completos** (foto + descripción en italiano y español). El producto que estaba pendiente (`012554`) se resolvió — ver abajo. **0 productos pendientes de revisión.**

## Fotos oficiales de alta calidad (actualización 2026-07-14)

Las fotos originales de `data/images/*.jpg` eran recortes de baja resolución del PDF "LQ" (borrosos, distorsionados). Se reemplazaron por fotos oficiales de alta resolución bajadas directo de **ristoris.it**, verificando en cada caso que el código y/o nombre coincidiera exactamente antes de reemplazar.

**Resultado: 66 de 68 productos (97%) ahora tienen foto oficial de alta resolución.**

- **20 productos** de línea Retail (`RTxxxx`) → foto de **frasco con etiqueta** (la mejor calidad posible, tomada de la grilla "Oggi si gusta" en la página de inicio de ristoris.it).
- **46 productos** de línea catering/food-service (código numérico) → mezcla de fotos de **frasco/lata con etiqueta** y **close-up gourmet del contenido** (salsa, aceite, etc.), según lo que tenía disponible cada ficha de producto en ristoris.it. Todas muchísimo más nítidas que el crop del PDF, típicamente 400×582 a 550×800px reales vs. los recortes borrosos originales.
- Las imágenes PNG con fondo transparente se aplanaron sobre un fondo claro neutro (`#faf9f6`, muy cercano al fondo de las tarjetas) para mantener consistencia visual con el resto del catálogo.
- Se mantuvo el mismo nombre de archivo y extensión `.jpg` en todos los casos, así no hizo falta tocar `productos.json`, `sw.js` ni el manifest.
- Se subió la versión de caché del service worker (`ristoris-catalogo-v1` → `v2`) para que los usuarios que ya tenían la app instalada reciban las fotos nuevas en la próxima conexión.

### 2 productos que se quedaron con el recorte del PDF (no se encontró match verificable)

| Código | Producto | Motivo |
|---|---|---|
| `RT0717` | Sugo Cacio e Pepe | No aparece en la grilla de línea Retail vigente en ristoris.it (esa grilla llega hasta "Sugo all'Amatriciana"/RT0716) ni en la categoría catering "I Sughi e i Ragù" del sitio general (que solo tiene una versión con código distinto, `002542` "Salsa Cacio e pepe"). Sin un match verificado por código o nombre exacto, se optó por dejar la foto original antes que arriesgar una equivocada. |
| `004028` | Zafferano (azafrán en polvo) | Se encontró y reemplazó la foto de `004025` Salsa allo Zafferano (código exacto), pero el azafrán en polvo puro (`004028`) no apareció como producto propio en las categorías revisadas del sitio (solo la salsa). No se encontró ficha verificable para el polvo solo. |

### Producto que estaba pendiente — resuelto

| Código | Producto | Qué se hizo |
|---|---|---|
| `012554` | Salsa di Salvia e Limone | Se encontró la ficha completa en ristoris.it → categoría "Le Creme e i condimenti", código `012554` exacto, presentación "Vaso Vetro 580 ml - 500 g" (coincide con el dato que ya teníamos del Excel). Se agregó `descripcion_it`, `descripcion_es` y `imagen` a `data/productos.json`, y se cambió `pendiente_revision` a `false`. El producto ya se ve completo en la app (probado con el buscador). |

### Nota sobre el PDF

El prompt original decía 105 páginas — ese dato era correcto (no 92 como se indicó en el mensaje operativo; se verificó abriendo el archivo real). Todas las 105 páginas fueron renderizadas y usadas para ubicar productos.

## Cómo se armó cada ficha

1. Los 68 productos se confirmaron contra la hoja "Consolidado compras" del Excel real (`RISTORIS_ITALO_Consolidado_2.xlsx`).
2. Se extrajo el texto de las 105 páginas del PDF (vía `pdfjs-dist`, sin depender de Python) para ubicar en qué página aparece cada código de producto.
3. Cada página candidata se inspeccionó visualmente para confirmar el **código exacto** (no solo el nombre — varios productos del Excel tienen nombres abreviados distintos al nombre oficial del catálogo, así que se priorizó siempre el código como identificador).
4. Se recortó la foto real de cada producto de la página del catálogo (sin usar imágenes genéricas ni de stock) con `sharp`.
5. Se transcribió el texto en italiano tal como aparece en el catálogo y se tradujo al español de forma natural y apetitosa, pensada para que un empleado se la explique a un cliente en el mostrador (no traducción literal palabra por palabra).
6. Los 21 productos de línea Retail (código `RTxxxx`) se ubicaron en la grilla compacta de las páginas 202–205 del catálogo (línea "Oggi si gusta"), usando el nombre corto oficial de esa grilla como base de la traducción.

## Estructura del proyecto

```
italo-catalogo-ristoris/
  index.html          — shell de la app
  css/styles.css       — identidad visual (microcemento, terracota, metal negro, madera, verde botella)
  js/app.js            — lógica: grilla, búsqueda, filtro por categoría, ficha de detalle, PWA
  manifest.json        — manifest de instalación
  sw.js                — service worker (cache-first, precachea todas las fotos)
  data/productos.json  — dataset de los 68 productos
  data/images/*.jpg    — 68 fotos (66 oficiales de alta resolución de ristoris.it + 2 recortes del PDF original: RT0717 y 004028)
  icons/               — íconos de la app (perfil clásico romano, guiño a la identidad del local)
  scripts/             — scripts de construcción del dataset (no se usan en producción)
  RESUMEN.md           — este archivo
```

## Identidad visual aplicada

Se usó la foto de referencia real del local (microcemento gris con veta sutil, ladrillo terracota en patrón irregular, estructura de metal negro mate tipo malla, repisa de madera nogal, iluminación cálida tipo "pool de luz") en vez de una paleta genérica. Colores clave en `css/styles.css`:

- Fondo: microcemento gris cálido con textura sutil y halos de luz dorada.
- Header y navegación: metal negro mate con borde inferior terracota.
- Categoría activa / botón de idioma: terracota y verde botella respectivamente.
- Tarjetas de producto: borde superior color madera nogal.
- Ícono de marca: silueta de perfil clásico romano (guiño al busto del local), en el header y en los íconos de instalación.

## Funcionalidad

- Vista principal agrupada por categoría (18 categorías reales del Excel) con grilla de tarjetas grandes para uso táctil.
- Filtro por categoría (chips horizontales) y buscador que funciona en español e italiano a la vez.
- Ficha de producto: foto grande, nombre IT + ES, presentación, código, descripción completa con toggle ES / IT / ambos.
- Precio de compra a Ristoris visible solo como dato interno secundario (no protagónico), aclarado como "no es el precio al público".
- 100% offline después de la primera carga: el service worker precachea el shell de la app, `productos.json` y las 68 fotos.
- Sin login, sin backend — app estática.

## Cómo correrla localmente

Ya está configurada en `.claude/launch.json` (raíz de `Desktop/ITALO`) como servidor `catalogo-ristoris`, puerto 4173. Si preferís hacerlo manualmente:

```bash
cd italo-catalogo-ristoris
node scripts/serve.js
# abrir http://localhost:4173
```

No requiere build step ni dependencias en producción (las dependencias de `package.json` — `xlsx`, `pdfjs-dist`, `sharp`, `@napi-rs/canvas` — solo se usaron para construir el dataset y las imágenes, no las necesita el navegador).

## Deploy a GitHub Pages (igual que italo-recetario)

1. Crear un repositorio nuevo en GitHub (por ejemplo `italo-catalogo-ristoris`).
2. Desde esta carpeta:
   ```bash
   git init
   git add index.html css js data icons manifest.json sw.js
   git commit -m "Catálogo Ristoris — primera versión"
   git branch -M main
   git remote add origin https://github.com/<tu-usuario>/italo-catalogo-ristoris.git
   git push -u origin main
   ```
3. En GitHub → Settings → Pages → Source: rama `main`, carpeta `/ (root)`.
4. La app queda publicada en `https://<tu-usuario>.github.io/italo-catalogo-ristoris/`.

**Importante:** si el sitio no queda en la raíz del dominio (por ejemplo queda en `/italo-catalogo-ristoris/`), revisá que las rutas relativas (`data/productos.json`, `css/styles.css`, etc.) sigan resolviendo bien — ya están escritas como rutas relativas (sin `/` inicial) para que funcionen en cualquier subcarpeta, igual que en `italo-recetario`.

## Instalar en la tablet de mostrador ("Agregar a pantalla de inicio")

**Android (Chrome):**
1. Abrir la URL publicada en Chrome.
2. Tocar el menú (⋮) → "Agregar a pantalla de inicio" o esperar el banner de instalación automático.
3. Confirmar el nombre "Ristoris Italo" y agregar.
4. Abrir la app desde el ícono — a partir de ahí funciona sin conexión.

**iPad (Safari):**
1. Abrir la URL publicada en Safari (no funciona desde Chrome en iOS para este paso).
2. Tocar el botón Compartir (cuadrado con flecha hacia arriba).
3. Elegir "Agregar a inicio".
4. Confirmar. La app queda instalada como ícono independiente, en pantalla completa y funciona offline.

Se recomienda, antes de llevar la tablet a un punto sin wifi, abrir la app una vez conectados para que el service worker termine de guardar las 68 fotos en caché (tarda unos segundos la primera vez).
