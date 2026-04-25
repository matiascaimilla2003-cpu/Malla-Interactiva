# Malla Interactiva — Ing. Comercial USM

Aplicación web para que los estudiantes visualicen y marquen su progreso en la malla curricular.

## Stack
- React + Vite
- Supabase (autenticación + base de datos)
- GitHub Pages (deploy)

## Configuración inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase-setup.sql`
3. Ve a **Settings → API** y copia tu URL y anon key
4. Crea un archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
# Edita .env con tus credenciales reales
```

### 3. Correr en local
```bash
npm run dev
```
Abre http://localhost:5173

## Deploy en GitHub Pages

### Primera vez
```bash
# Asegúrate de que vite.config.js tenga el nombre correcto de tu repo
# base: '/nombre-de-tu-repo/'

npm run deploy
```

Luego en GitHub → Settings → Pages → selecciona la rama `gh-pages`.

### Actualizaciones futuras
```bash
npm run deploy
```

## Estructura del proyecto
```
src/
  components/
    Malla.jsx        # Grid principal de semestres
    RamoCard.jsx     # Tarjeta individual de cada ramo
    RamoModal.jsx    # Modal de detalle del ramo
  data/
    malla.js         # Datos de ramos, áreas, prereqs
  hooks/
    useAuth.js       # Autenticación con Supabase
    useProgreso.js   # Leer/escribir progreso del usuario
  lib/
    supabase.js      # Cliente de Supabase
  pages/
    Login.jsx        # Pantalla de login/registro
  styles/
    main.css         # Estilos globales
  App.jsx            # Componente raíz
  main.jsx           # Entry point
```
