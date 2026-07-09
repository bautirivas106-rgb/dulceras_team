# Master Prompt para Claude


# Contexto obligatorio del proyecto

Este proyecto NO es solo una página web para Dulceras Team. Es un SaaS gastronómico multiempresa, donde Dulceras Team será el primer tenant/cliente real y el modelo visual de referencia.

La nueva web debe respetar la identidad de la página actual de Dulceras Team: pastelería artesanal chic de Almagro, estética cálida, bajonera, dulce, cercana, con foco en Román y la ayuda a gatitos. La landing debe sentirse como “Dulceras Team, pero 10 veces más profesional”.

Referencia visual y de contenido actual:
- Sitio: https://dulcerasteam.com.ar/
- Marca: dulceras.team / La pastelería de Román
- Mensaje: “Un postre para vos, una ayuda para ellos”
- Categorías actuales: Cookies estilo NY, Budines, Tortas enteras, Postres bajoneros, Brownie Box, Chipá.
- Flujo actual: elegir producto, pedir por WhatsApp, coordinar entrega y pago.
- Reglas actuales: pedidos con 48 hs de anticipación, envío gratis en Almagro, envíos a CABA con costo según zona, entregas de 18 a 21 hs, retiro presencial lunes a sábados.
- Formas actuales: efectivo y transferencia. Nuevo sistema: seña por Mercado Pago y resto a coordinar.
- Propósito social: cada compra ayuda a gatitos. Debe mantenerse presente en UX, textos y diseño.

Stack obligatorio:
- Backend: Django + Django REST Framework.
- Frontend: React + Vite + TypeScript.
- Base de datos: SQL Server.
- Autenticación: JWT.
- Pagos: Mercado Pago, pago de seña, webhooks.
- Notificaciones: campanita en dashboard + WhatsApp al administrador.
- Arquitectura: multi-tenant configurable, preparada para futuros negocios gastronómicos.

Reglas clave:
1. No hardcodear Dulceras Team donde deba existir configuración por tenant.
2. Dulceras Team sí puede usarse como seed/demo principal.
3. Todo módulo debe pensarse para escalar a panaderías, cafeterías, pastelerías, casas de comida, rotiserías o emprendimientos similares.
4. No romper la estética actual: mejorarla, modernizarla y hacerla más vendible.
5. Priorizar código claro, mantenible y documentado antes que soluciones mágicas difíciles de sostener.

---

Actuá como un equipo senior de desarrollo SaaS. Vas a construir una plataforma gastronómica multiempresa usando Django + DRF + React/Vite/TypeScript + SQL Server. Dulceras Team será el primer cliente y la referencia visual obligatoria.

Antes de escribir código, leé todos los archivos del kit. No improvises arquitectura si ya está documentada. Si detectás conflicto entre documentos, priorizá: contexto general, reglas de desarrollo, arquitectura, módulo específico, agente específico.

Objetivo MVP: cliente entra a landing Dulceras, elige productos, carga carrito, selecciona fecha, paga seña por Mercado Pago, webhook confirma pago, dashboard muestra pedido, campanita notifica y se avisa por WhatsApp al administrador.

Reglas absolutas:
1. Mantener estilo Dulceras Team.
2. Pensar SaaS multi-tenant.
3. Validar lógica de negocio en backend.
4. No hardcodear credenciales.
5. No confirmar pagos sin webhook validado.
6. Mobile first.
7. Código limpio y mantenible.
