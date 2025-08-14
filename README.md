## Resumen del proyecto

**SafeTasks** es una aplicación web para la gestión de tareas con soporte multiusuario
y control de roles (usuario y administrador), **buscar y eliminar** sus tareas.
Los adminitradores, además, pueden **visualizar y gestionar todas las tareas** en el sistema
mediante un panel dedicado.

## Instalación y configuración

### Requisitos previos
* Node.js 20+
* npm o yarn
* Base de datos PostgreSQL (o la de su preferencia con Prisma)
* Prisma CLI `(npm install prisma -g)`

#### Pasos:
```
# Clonar el repositorio
git clone <repo-url>
cd safe-tasks

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con credenciales DB y secretos JWT

# Ejecutar migraciones Prisma
npx prisma migrate dev

# Levantar en desarrollo
npm run dev
```

## Manual de uso

### Roles y acceso
* **Usuario**: Puede ver, crear, editar y borrar sólo sus propias tareas.
* **Administrador**: Tiene acceso al panel admin, donde puede ver y modificar todas las tareas.

### Flujo básico
1. **Registro**
   * En la pantalla de Login hay un enlace azul "Regístrate aquí".
   * Completar el formulario y enviar.

2. **Inicio de sesión**
   * Ingresar credenciales.
   * Dependiendo del rol, se mostrará la barra de navegación con las opciones correspondientes.

3. **Gestión de tareas**:
    * Buscar, filtrar y paginar tareas.
    * Marcar como hecha o pendiente.
    * Crear o eliminar tareas.
   
4. **Panel Admin**:
    * Disponible sólo para administradores.
    * Muestra todas las tareas del sistema.

## Detalles técnicos
### Autenticación
* JWT + Cookies HTTPOnly.
* Rutas protegidas por middleware en el frontend (`/tasks, /admin`).
* Endpoint `/api/auth/me` para obtener el usuario actual.

### Endpoints principales (Backend)

| Método | Ruta           | Descripción                            | Roles |
|--------|----------------|----------------------------------------|-------|
| POST   | `/auth/login`  | Inicia sesión y devuelve cookie JWT    | Todos |
| POST   | `/auth/logout` | Cierra sesión                          | Todos |
| GET    | `/auth/me`     | Devuelve datos del usuario autenticado | Todos |
| GET    | `/tasks`       | Lista tarea del usuario autenticado    | User  |
| POST   | `/tasks`       | Crea tarea                             | User  |
| PATCH  | `/tasks/:id`   | Actualiza tarea                        | User  |
| DELETE | `/tasks/:id`   | Elimina tarea                          | User  |
| GET    | `/admin/tasks` | Lista todas las tareas del sistema     | Admin |

## Despliegue
### Producción con Node.js

```
npm install
npm run build
npm run start
```
* Usar reverse proxy (Nginx) para manejar HTTPS
* Configurar variables de entorno seguras (`JWT_SECRET, DATABASE_URL`)
