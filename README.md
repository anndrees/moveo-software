# 🚗 MOVEO RENT A CAR

[![Estado](https://img.shields.io/badge/estado-en%20desarrollo-blue)](https://github.com/anndrees/moveo-software)
[![Laravel](https://img.shields.io/badge/backend-Laravel%2010-red)](https://laravel.com/) [![React](https://img.shields.io/badge/frontend-React%2018-61dafb)](https://react.dev/)

¡Bienvenido a **MOVEO RENT A CAR**!

> Plataforma profesional, sencilla y potente para la gestión de alquiler de vehículos y flotas. Pensada para empresas que quieren digitalizar y optimizar su operativa diaria.

---

## 📖 Breve historia
MOVEO nació en 2025 como solución interna para una pequeña empresa de alquiler de coches. Su éxito y facilidad de uso motivó su evolución a una plataforma moderna y abierta, con el objetivo de digitalizar el sector del alquiler de vehículos.

---

## ✨ Descripción funcional
MOVEO permite:
- Gestionar vehículos, clientes y reservas desde un panel de administración profesional.
- Controlar el estado de cada vehículo (disponible, ocupado, en mantenimiento, alquilado).
- Subir imágenes de vehículos y perfiles.
- Consultar reportes y estadísticas en tiempo real.
- Autenticación segura con roles diferenciados (admin, cliente).
- Experiencia responsive y atractiva gracias a React + Material UI.

---

## 📋 Funcionalidades principales

| 🚀 Funcionalidad                  | ✅ Estado       | 📄 Descripción breve                             |
|-----------------------------------|---------------|-------------------------------------------------|
| Gestión de vehículos              | Completado    | Alta, edición, baja, imágenes, estados           |
| Gestión de clientes               | Completado    | Alta, edición, baja, búsqueda                    |
| Reservas de vehículos             | Completado    | Crear, modificar, cancelar, historial            |
| Reportes y estadísticas           | Completado    | Totales, gráficos, exportación                   |
| Autenticación y roles             | Completado    | Admin y cliente, login seguro                    |
| Responsive y accesible            | Completado    | Adaptado a móvil y escritorio                    |
| Filtros y búsquedas avanzadas     | En progreso   | Filtrado por estado, fechas, cliente, vehículo   |

---

## 👤 Roles y permisos

| Rol      | Puede gestionar vehículos | Puede gestionar clientes | Puede gestionar reservas | Acceso a reportes |
|----------|:------------------------:|:-----------------------:|:-----------------------:|:-----------------:|
| Admin    |           ✅             |           ✅            |           ✅            |        ✅         |
| Cliente  |           ❌             |           ❌            |           ✅ (las suyas) |        ❌         |

---

## 🗃️ Estructura de la base de datos (resumen)

| Tabla       | Campos principales                                  |
|-------------|-----------------------------------------------------|
| users       | id, nombre, apellidos, email, password, rol, ...    |
| clientes    | id, nombre, apellidos, email, telefono, ...         |
| vehiculos   | id, matricula, modelo, tipo, estado, ...            |
| reservas    | id, cliente_id, cliente_type, vehiculo_id, fechas   |
| mantenimientos | id, vehiculo_id, fecha, tipo, costo, estado      |

---

## 🌐 Rutas principales del frontend

| Ruta                | Descripción                       |
|---------------------|-----------------------------------|
| `/`                 | Landing page                      |
| `/login`            | Login de usuario                  |
| `/admin`            | Panel de administración           |
| `/clientes`         | Gestión de clientes               |
| `/vehiculos`        | Gestión de vehículos              |
| `/reservas`         | Gestión de reservas               |
| `/perfil`           | Perfil del usuario                |

---

## 🧪 Ejemplos de uso de la API

### Crear una reserva (cURL)
```bash
curl -X POST http://localhost:8000/api/reservas \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 2,
    "vehiculo_id": 5,
    "fecha_inicio": "2025-05-07",
    "fecha_fin": "2025-05-09",
    "estado": "pendiente"
  }'
```

### Respuesta exitosa (JSON)
```json
{
  "id": 12,
  "cliente_id": 2,
  "vehiculo_id": 5,
  "fecha_inicio": "2025-05-07",
  "fecha_fin": "2025-05-09",
  "estado": "pendiente"
}
```

---

## 📝 Changelog (resumen)

| Versión | Fecha       | Cambios principales                       |
|---------|-------------|-------------------------------------------|
| 1.0.0   | 2025-05-04  | Primera versión funcional                 |
| 1.1.0   | 2025-05-05  | Validación avanzada de clientes/reservas  |
| 1.2.0   | 2025-05-06  | Mejoras en UI y reportes                  |

---

## 🐞 Errores comunes y soluciones

| Error                                            | Causa probable                          | Solución sugerida                      |
|--------------------------------------------------|-----------------------------------------|----------------------------------------|
| "El cliente seleccionado no es válido."          | ID enviado incorrecto                   | Enviar el ID numérico, no el código    |
| "SQLSTATE[HY000]: ... database is locked"        | SQLite bloqueado por otro proceso       | Cierra procesos y reintenta            |
| "No se pueden subir imágenes"                    | Falta el enlace storage o permisos      | Ejecuta `php artisan storage:link`     |
| "Token inválido o expirado"                      | Sesión caducada                         | Relogin y usa el nuevo token           |

---

## 📚 Glosario de términos

- **Reserva**: Solicitud de alquiler de un vehículo en fechas concretas.
- **Cliente**: Persona física o jurídica que puede reservar vehículos.
- **Admin**: Usuario con permisos totales sobre la plataforma.
- **Vehículo**: Coche, moto o furgoneta gestionado en el sistema.
- **Estado de reserva**: pendiente, confirmada, cancelada, finalizada.

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!
1. Haz un fork del repo
2. Crea una rama con tu mejora: `git checkout -b mi-mejora`
3. Haz commit de tus cambios: `git commit -am 'feat: mi mejora'`
4. Haz push a tu rama: `git push origin mi-mejora`
5. Abre un Pull Request

Por favor, sigue los estilos de código y añade tests si aplica.

---

## 🎨 Estilos de código
- **Frontend:** Sigue las reglas de ESLint y Prettier (configurado en el repo)
- **Backend:** PSR-12 para PHP, comentarios claros y funciones en español
- Usa nombres descriptivos y en español para variables y funciones

---

## 📦 Scripts útiles

| Script (frontend)      | Acción                                   |
|-----------------------|------------------------------------------|
| `npm install`         | Instala dependencias                     |
| `npm run dev`         | Arranca servidor de desarrollo           |
| `npm run build`       | Genera build de producción               |
| `npm run lint`        | Lint de código JS/JSX                    |

| Script (backend)      | Acción                                   |
|-----------------------|------------------------------------------|
| `composer install`    | Instala dependencias PHP                 |
| `php artisan migrate` | Ejecuta migraciones                      |
| `php artisan db:seed` | Ejecuta seeders                          |
| `php artisan serve`   | Servidor de desarrollo Laravel           |
| `php artisan test`    | Ejecuta tests de backend                 |

---

## 🛣️ Roadmap (próximos pasos)

- [ ] Filtros avanzados en reservas y vehículos
- [ ] Notificaciones por email y en app
- [ ] Exportación de datos a Excel/PDF
- [ ] Integración con pasarelas de pago
- [ ] Multi-idioma (español/inglés)
- [ ] Mejoras en accesibilidad y usabilidad

---

## 🗂️ Tabla de versiones

| Componente   | Versión actual |
|--------------|:--------------:|
| Backend      | 1.2.0          |
| Frontend     | 1.2.0          |
| Laravel      | 10.x           |
| React        | 18.x           |

---

## 🔑 Dependencias clave

| Paquete          | Uso principal                 |
|------------------|------------------------------|
| laravel/sanctum  | Autenticación API            |
| material-ui/core | Componentes UI React         |
| react-router-dom | Navegación SPA               |
| axios            | Llamadas HTTP en frontend    |

---

## 🙏 Agradecimientos
- A todo el equipo de desarrollo y testers
- A la comunidad open source
- A quienes usan y mejoran MOVEO cada día

---

## 🛠️ Tecnologías usadas
- **Frontend:** React 18, Vite, Material UI, React Router, Context API
- **Backend:** Laravel 10+, PHP 8+, Sanctum, Eloquent ORM
- **Base de datos:** SQLite (desarrollo), MySQL/PostgreSQL (producción)
- **Otros:** JWT, REST API, ESLint, Prettier

---

## 📁 Estructura del proyecto

```
moveo/
├── frontend/   # Aplicación React (Material UI)
├── backend/    # API RESTful en Laravel
└── README.md
```

---

## 🚀 Instalación rápida


### 1. Clona el repositorio
```bash
git clone https://github.com/anndrees/moveo-software.git
cd moveo
```

### 2. Backend (Laravel)

```bash
cd backend
composer install          # Instala dependencias PHP
cp .env.example .env      # Copia el archivo de entorno
php artisan key:generate  # Genera la clave de la app

# Configura la base de datos en .env (puedes usar SQLite para desarrollo)
# DB_CONNECTION=sqlite
# DB_DATABASE="ruta/absoluta/a/backend/database/database.sqlite"

php artisan migrate --seed  # Ejecuta migraciones y seeders
php artisan storage:link    # Crea el enlace simbólico para imágenes
php artisan serve           # Inicia el servidor en http://localhost:8000
```

### 3. Frontend (React)

```bash
cd ../frontend
npm install              # Instala dependencias
npm run dev              # Inicia el servidor en http://localhost:5173
```

---

## 🛠️ Principales comandos


### Backend
- `php artisan migrate`         → Ejecuta migraciones
- `php artisan db:seed`         → Ejecuta los seeders
- `php artisan storage:link`    → Enlaza la carpeta de imágenes
- `php artisan serve`           → Levanta el servidor Laravel

### Frontend
- `npm install`                 → Instala dependencias
- `npm run dev`                 → Arranca el servidor de desarrollo
- `npm run build`               → Genera build de producción

---

## 🔒 Autenticación

- El sistema utiliza **Laravel Sanctum** para autenticación vía tokens.
- Recuerda iniciar sesión para acceder a las rutas protegidas.

---

## 🖼️ Imágenes

- Las imágenes de vehículos y perfiles se almacenan en `backend/storage/app/public` y se sirven mediante el enlace simbólico `public/storage`.

---

## 🛠️ Personalización

- Puedes modificar los colores y el logo en el frontend editando los archivos de tema en `frontend/src/tema/`.
- Para añadir nuevos roles o permisos, revisa las políticas de Laravel en el backend.
- Los textos y mensajes del sistema están centralizados en los archivos de idiomas (`resources/lang`).

---

## 📝 Notas útiles

- Puedes gestionar clientes, vehículos y reservas desde el panel de administración.
- El sistema soporta diferentes estados de vehículos: `disponible`, `ocupado`, `en_mantenimiento`, `alquilado`.
- Si tienes problemas con la base de datos SQLite, elimina y regenera el archivo `database.sqlite`.

---

## ❓ Preguntas frecuentes (FAQ)

**¿Cómo cambio el tipo de base de datos?**
- Edita el archivo `backend/.env` y ajusta las variables `DB_CONNECTION`, `DB_DATABASE`, etc. para MySQL o PostgreSQL.

**¿Cómo subo imágenes?**
- Las imágenes se suben desde el panel de administración y se guardan en `backend/storage/app/public`.

**¿Cómo restablezco la base de datos?**
- Elimina el archivo `database.sqlite` (si usas SQLite) y ejecuta `php artisan migrate --seed`.

**¿Cómo agrego un nuevo administrador?**
- Crea un usuario desde la base de datos y asígnale el rol `admin`.

---

## 🌐 Despliegue en producción

1. **Instala dependencias en ambos proyectos**
2. Configura variables de entorno en `backend/.env` y `frontend/.env` (si aplica)
3. Ejecuta `npm run build` en `frontend` para generar la versión optimizada
4. Sube el contenido de `frontend/dist` y el backend a tu servidor
5. Configura el dominio, HTTPS y base de datos según tu proveedor

---

## 🔗 Enlaces útiles
- [Documentación Laravel](https://laravel.com/docs)
- [Documentación React](https://es.react.dev/)
- [Material UI](https://mui.com/)
- [Repositorio oficial](https://github.com/anndrees/moveo-software)

---

## 📬 Contacto

¿Tienes dudas, sugerencias o encontraste un bug?
- Abre un issue en GitHub
- O contacta con el equipo: **anndrees31@gmail.com**

---

¡Feliz gestión de flotas! Si tienes dudas, abre un issue o contacta con el equipo. 😃
