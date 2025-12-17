# Orders Producer Frontend — Interfaz de Pedidos

Aplicación frontend para la gestión y visualización de pedidos en el restaurante. Permite a los usuarios crear pedidos, ver el estado de la cocina y gestionar la sesión.

- Puerto: 5173 (por defecto con Vite)
- Framework: React + TypeScript
- Estado global: Redux Toolkit
- Testing: Vitest + React Testing Library
- Linter: ESLint

## Estructura del Proyecto
```
orders-producer-frontend/
├── Dockerfile           # Imagen para despliegue en contenedores
├── package.json         # Dependencias y scripts del proyecto
├── tsconfig.json        # Configuración de TypeScript
├── vite.config.ts       # Configuración de Vite
├── coverage/            # Reportes de cobertura de tests
├── public/              # Archivos estáticos (imágenes, favicon)
├── src/                 # Código fuente principal
│   ├── App.tsx          # Componente raíz de la app
│   ├── main.tsx         # Punto de entrada de React
│   ├── index.css        # Estilos globales
│   ├── components/      # Componentes reutilizables
│   ├── config/          # Configuración de rutas y constantes
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Librerías auxiliares
│   ├── pages/           # Vistas principales (Home, Session, Orders, Kitchen)
│   ├── services/        # Lógica de acceso a APIs
│   ├── store/           # Estado global (Redux)
│   ├── test/            # Utilidades y mocks para testing
│   ├── types/           # Tipos y modelos TypeScript
│   └── utils/           # Funciones utilitarias
```

Cada archivo/carpeta cumple una función específica:
- **Dockerfile**: Permite crear la imagen Docker para despliegue.
- **package.json**: Lista dependencias, scripts y metadatos.
- **tsconfig.json**: Opciones de compilación TypeScript.
- **vite.config.ts**: Configuración del bundler Vite.
- **coverage/**: Resultados de cobertura de pruebas.
- **public/**: Archivos estáticos accesibles públicamente.
- **src/**: Todo el código fuente de la app.
  - **App.tsx**: Componente principal y rutas.
  - **main.tsx**: Arranque de la app React.
  - **index.css**: Estilos globales.
  - **components/**: Componentes reutilizables (botones, inputs, etc).
  - **config/**: Configuración de rutas, endpoints, etc.
  - **hooks/**: Custom hooks para lógica reutilizable.
  - **lib/**: Librerías auxiliares.
  - **pages/**: Vistas principales de la app.
  - **services/**: Lógica de acceso a APIs y backend.
  - **store/**: Estado global y slices de Redux.
  - **test/**: Utilidades y mocks para testing.
  - **types/**: Tipos y modelos TypeScript.
  - **utils/**: Funciones utilitarias generales.

## Variables de entorno
```
VITE_API_URL=http://localhost:3000
```

## Desarrollo
```bash
npm install
npm run dev
npm run lint                # Linting del código
npm run test                # Ejecutar tests
npm run coverage            # Tests con cobertura
```

## Tests
- Pruebas unitarias y de integración con Vitest y React Testing Library
- Cobertura: ver reporte en carpeta `coverage/` o en consola tras ejecutar tests

## Producción
```bash
npm run build
npm run preview             # Previsualizar build local
```

## Ejemplo de uso
- Accede a `http://localhost:5173` en tu navegador.
- Crea un pedido, inicia sesión y visualiza el estado de la cocina.

---
¿Dudas? Consulta la documentación o revisa los tests incluidos para ejemplos de uso y extensión.
