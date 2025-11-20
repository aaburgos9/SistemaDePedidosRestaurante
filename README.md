# SistemaDePedidosRestaurante

Repositorio colaborativo para el desarrollo del sistema distribuido de procesamiento de pedidos en un restaurante.

Instrucciones rápidas para ejecutar el frontend de ejemplo (React + Vite):

1. Abrir terminal en `c:\Users\User\Documentos\SistemaDePedidosRestaurante`
2. Ejecutar:
   - `npm install`
   - `npm run dev`
3. Abrir `http://localhost:5173` en la tablet o navegador.

Este proyecto contiene un frontend sencillo y agradable para tomar pedidos en una tablet. Está pensado como punto de partida para integrar con un backend.

Agregar imágenes al menú (sencillo):

1. Crear la carpeta `public/images` en el proyecto (misma raíz que index.html).
2. Colocar los archivos de imagen allí, por ejemplo:
   - `public/images/hamburguesa.jpg`
   - `public/images/papas.jpg`
   - `public/images/cheeseburger.jpg`
   - `public/images/refresco.jpg`
3. En `src/App.jsx` asignar la ruta pública en cada producto: `image: "/images/nombre.jpg"`.
   - Ejemplo ya incluido en el proyecto: `/images/hamburguesa.jpg`
4. Reiniciar el servidor de desarrollo (`npm run dev`). Las imágenes se servirán desde `/images/...`.
