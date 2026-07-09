# Módulo Carrito y checkout


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

## Flujo cliente
1. Ve catálogo.
2. Elige producto y variante.
3. Agrega al carrito.
4. Carga nombre, teléfono, email opcional, dirección o retiro.
5. Selecciona fecha disponible.
6. Ve total y monto de seña.
7. Paga seña por Mercado Pago.
8. Recibe confirmación y número de pedido.

## Validaciones backend
- Producto activo.
- Variante activa.
- Fecha respeta anticipación mínima.
- Capacidad productiva disponible.
- Zona de entrega válida.
- Precio recalculado en servidor.
