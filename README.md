# VigilaTuVoto Perú 2026 — Plantilla estática

> Sitio estático, sin servidor, ideal para publicar en **GitHub Pages** o **Netlify**. Incluye buscador, filtros, tarjetas de candidatos y un modal con antecedentes y fuentes. **Todos los datos son ficticios** para que reemplaces por información real.

## Estructura
- `index.html` — Home con filtros y resultados
- `metodologia.html` — Criterios y glosario de estados
- `privacidad.html` — Política de privacidad y términos (plantilla)
- `styles.css` — Estilos
- `script.js` — Lógica de carga y filtrado
- `data/candidatos.json` — **Tu base de datos** (reemplaza con datos reales verificables)

## Cómo publicar en GitHub Pages (sin instalar nada)
1. Crea una cuenta en GitHub (si no la tienes).
2. Crea un repositorio nuevo, por ejemplo `vigilatuvoto-2026`.
3. Sube los archivos de esta carpeta (arrastrar y soltar en GitHub «Add file» → «Upload files»).
4. Ve a **Settings → Pages**, en «Branch» elige `main` y la carpeta `/root`. Guarda.
5. Espera a que aparezca la URL pública (algo como `https://tuusuario.github.io/vigilatuvoto-2026/`).

> Si la página no carga datos, revisa que `data/candidatos.json` esté en la ruta correcta y que la URL pública use HTTPS.

## Cómo actualizar datos
- Edita `data/candidatos.json`. Mantén estos campos por cada candidato:
  ```json
  {
    "id": "ID-UNICO",
    "nombre": "Nombre Apellido",
    "partido": "Partido/Movimiento",
    "region": "Región",
    "foto": "URL de foto oficial o del JNE",
    "antecedentes": [
      {
        "tipo": "Corrupción|Administrativo|Civil|Otro",
        "estado": "condena_firme|sentencia_1ra_instancia|juicio|acusacion|investigacion_formalizada|investigacion_preliminar",
        "descripcion": "Resumen corto y neutral",
        "expediente": "Nº de expediente si aplica",
        "fecha": "AAAA-MM-DD",
        "fuente_url": "URL pública a documento oficial"
      }
    ]
  }
  ```

## Buenas prácticas legales/editoriales
- Solo hechos verificables y de **interés público**.
- Diferencia investigación, acusación, sentencia de 1ra y **sentencia firme**.
- **Presunción de inocencia** para casos en curso.
- Siempre enlaza la **fuente oficial**.
- Habilita un canal de **rectificación/descargo** con evidencia.

## Despliegue alternativo (Netlify)
1. Entra a https://app.netlify.com/ (con tu cuenta).
2. «Add new site» → «Deploy manually» y arrastra la carpeta.
3. La URL quedará disponible inmediatamente.

---

Plantilla creada para uso cívico y educativo. Código MIT, contenidos CC BY 4.0.
