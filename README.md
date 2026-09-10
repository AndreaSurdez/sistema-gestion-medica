# Sistema Web de Gestión Médica

**Proyecto Capstone - Carver University (CAP 499)**  
**Autora:** Andrea Mariana Surdez Espeleta  
**Centro de Aplicación:** Centro de Salud Comunitario San José, Aguascalientes, México.

![Estado](https://img.shields.io/badge/Estado-En%20Producción-success)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react)
![Node](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/BD-PostgreSQL-4169E1?logo=postgresql)

## Descripción del Proyecto
Sistema web integral diseñado para optimizar el control de fichas de pacientes, el agendamiento de citas por especialidad y el registro del historial clínico. La solución reemplaza los procesos manuales en papel, reduciendo tiempos de espera, eliminando errores de doble asignación y garantizando la seguridad de los datos clínicos en cumplimiento con la **LFPDPPP** y la **NOM-004-SSA3-2012** de México.

## Enlaces de Producción (Demo en Vivo)
- **Frontend (Vercel):** [https://sistema-gestion-medica-puce.vercel.app](https://sistema-gestion-medica-puce.vercel.app)
- **Backend API (Render):** [https://sistema-gestion-medica.onrender.com](https://sistema-gestion-medica.onrender.com)
- **Base de Datos:** Supabase (PostgreSQL 14)

## Credenciales de Prueba
Para evaluar el sistema, puedes utilizar los siguientes usuarios de prueba:

| Rol | Usuario | Contraseña |
| :--- | :--- | :--- |
| **Administrativo** | `admin` | `admin123` |
| **Médico** | `jperez` | `admin123` |
| **Paciente** | `ana.martinez` | `admin123` |

## Características Principales
- **Dashboard en tiempo real:** Indicadores operativos y gráficas de gestión.
- **Gestión de Pacientes:** CRUD completo con validación oficial de CURP.
- **Agendamiento Inteligente:** Prevención de sobreposición de citas y filtros por especialidad.
- **Historial Clínico:** Trazabilidad, auditoría de accesos y cumplimiento normativo.
- **Seguridad Robusta:** Cifrado TLS 1.3, JWT, bcrypt y Control de Acceso por Roles (RBAC).

## Stack Tecnológico
- **Frontend:** React.js, Material-UI, Axios, Recharts.
- **Backend:** Node.js, Express, JWT, Winston, Helmet.
- **Base de Datos:** PostgreSQL 14 (Supabase).
- **Despliegue:** Vercel (Frontend), Render (Backend).

## Instalación Local (Desarrollo)

Si deseas clonar y ejecutar el proyecto en tu entorno local, sigue estos pasos:

### 1. Clonar el repositorio
```bash
git clone https://github.com/AndreaSurdez/sistema-gestion-medica.git
cd sistema-gestion-medica
```

### 2. Configurar el Backend (`/server`)
```bash
cd server
npm install
```
Crea un archivo `.env` en la carpeta `server` con las siguientes variables:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=tu_url_de_supabase
JWT_SECRET=tu_secreto_super_seguro
FRONTEND_URL=http://localhost:3000
```
Inicia el servidor:
```bash
npm run dev
```

### 3. Configurar el Frontend (`/client`)
```bash
cd ../client
npm install
```
Crea un archivo `.env` en la carpeta `client` con la siguiente variable:
```env
REACT_APP_API_URL=http://localhost:5000/api
```
Inicia la aplicación:
```bash
npm start
```

## Documentación Técnica
En la carpeta `/docs` de este repositorio encontrarás:
- Manual de Usuario.
- Manual Técnico.
- Diagramas de Arquitectura y Entidad-Relación.
- Reportes de Pruebas (Jest).
- Artículo Científico y Presentación Final.

## Licencia y Derechos
Proyecto desarrollado con fines académicos en el marco del curso CAP 499 de Carver University.  
© 2026 Andrea Mariana Surdez Espeleta.
```