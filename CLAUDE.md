# Dulceras Team — SaaS para negocios gastronómicos

## Contexto del proyecto
SaaS multi-tenant para gestión de pedidos, catálogo y pagos. Dulceras Team es el cliente semilla/referencia visual.

## Documentación del kit
Toda la arquitectura, módulos y agentes están documentados en `docs/kit/dulceras_saas_claude_kit/`:
- `00_contexto/` — Contexto general del negocio
- `01_documentacion/` — Stack, arquitectura, multi-tenant, DB, API, auth, roles, roadmap
- `02_modulos/` — Especificación de cada módulo (landing, dashboard, catálogo, pedidos, pagos, etc.)
- `03_agentes/` — Roles y responsabilidades de cada agente Claude
- `04_checklists/` — MVP checklist y release readiness
- `05_prompts/` — Master prompt y template de tareas
- `06_templates/` — ADR y feature spec templates

**Antes de implementar cualquier módulo, leer el archivo correspondiente en `02_modulos/`.**

## Stack
- Backend: Django 6 + Django REST Framework + JWT
- Frontend: React + Vite + TypeScript (pendiente)
- Base de datos: SQL Server (`mssql-django`)
- Pagos: Mercado Pago
- Notificaciones: bell in-app + WhatsApp

## Apps Django
| App | Responsabilidad |
|-----|----------------|
| `core` | Modelos abstractos, utilidades base |
| `tenants` | Modelo Tenant, middleware multi-tenant |
| `users` | Auth JWT, perfiles de usuario |
| `catalog` | Productos, variantes, categorías |
| `orders` | Pedidos y estados |
| `payments` | Mercado Pago, webhooks |
| `notifications` | Bell in-app, WhatsApp |
| `customers` | Clientes |
| `audit` | Logs de auditoría |

## Reglas clave
- Nunca hardcodear "Dulceras" en config — todo configurable por tenant
- Toda query debe filtrar por tenant
- Lógica de negocio (precios, stock, calendario, depósitos) se valida en backend
- Webhooks idempotentes con log de integración

## Entorno
- Activar venv: `.\env\Scripts\Activate.ps1`
- Correr servidor: `python manage.py runserver`
- Configuración en `.env` (no commitear)
