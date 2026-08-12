# Descripción general del proyecto: Sistema de Gestión Documental DocuFlow

## 1. Nombre del proyecto

**DocuFlow: Sistema de Gestión Documental con seguimiento y trazabilidad**

## 2. Descripción general

DocuFlow es un sistema web de gestión documental orientado a organizaciones que necesitan centralizar, almacenar, controlar y hacer seguimiento a documentos digitalizados. El sistema está pensado para un cliente con presupuesto ajustado, por lo que se prioriza una solución funcional, simple y escalable, evitando características complejas como OCR, digitalización automática, firma digital avanzada o inteligencia artificial.

El cliente se encargará de escanear manualmente sus documentos físicos. Una vez escaneados, el sistema permitirá subir esos archivos digitales, registrar sus datos principales, almacenarlos en una cuenta institucional de Google Drive y controlar el recorrido del documento dentro de la organización.

La finalidad principal del sistema no es solo guardar archivos, sino permitir saber qué pasó con cada documento: quién lo subió, a quién se derivó, qué consigna se dejó, quién lo revisó, qué acción realizó, cuál es su estado actual y qué usuarios participaron en su proceso.

## 3. Problema que busca resolver

Actualmente, muchas organizaciones manejan documentos físicos o archivos digitales dispersos en computadoras, carpetas locales, memorias USB o cuentas personales. Esto genera problemas como pérdida de documentos, dificultad para encontrar información, falta de control sobre quién revisó un documento y poca claridad sobre el estado de un trámite o proceso documental.

DocuFlow busca resolver estos problemas mediante una plataforma web centralizada donde los documentos puedan ser registrados, almacenados, derivados, revisados, archivados y trazados de forma ordenada.

El sistema permitirá responder preguntas como:

¿Quién subió el documento?
¿Cuándo se subió?
¿A quién se lo derivó?
¿Qué instrucción o consigna recibió el responsable?
¿Qué hizo el responsable con el documento?
¿El documento fue aprobado, observado, archivado o derivado nuevamente?
¿Qué usuarios participaron en el proceso?
¿Cuál fue la última acción realizada?
¿Dónde se encuentra actualmente el documento dentro del flujo?

## 4. Alcance del sistema

El sistema será una aplicación web de gestión documental básica, pero con trazabilidad completa.

El alcance inicial incluye:

Registro e inicio de sesión de usuarios mediante usuario y contraseña.
Roles básicos: Administrador y Usuario.
Subida de documentos digitales escaneados.
Almacenamiento de archivos en una cuenta institucional de Google Drive.
Registro automático de código interno del documento.
Registro de nombre, descripción, archivo, usuario que subió, fecha y hora de subida.
Decisión al subir: archivar directamente o derivar a otro usuario.
Bandeja de pendientes para usuarios responsables.
Cambio de estados del documento.
Aprobación, observación, archivo o derivación de documentos.
Subida de documentos relacionados.
Trazabilidad visual del documento.
Bitácora general de acciones del sistema.
Notificaciones internas simples.
Control de usuarios participantes en cada documento.
Eliminación lógica de documentos.

No se incluye en la primera versión:

OCR automático.
Escaneo desde el sistema.
Firma digital.
Inteligencia artificial.
Edición colaborativa avanzada.
App móvil.
Reportes complejos.
Flujos BPM demasiado rígidos.
Integración con múltiples cuentas de Google por usuario.

## 5. Almacenamiento de archivos

El sistema usará **Google Drive mediante API** como almacenamiento documental.

Los archivos no se guardarán directamente en la base de datos. La base de datos solo almacenará los metadatos del documento y la referencia al archivo en Google Drive, como el identificador del archivo, nombre, tipo, tamaño y enlace de visualización si corresponde.

Se usará una sola cuenta institucional de Google Drive, proporcionada por el administrador o cliente. Esto permite que los documentos pertenezcan a la organización y no a cuentas personales de los usuarios.

Los usuarios normales no necesitan iniciar sesión con Google. El acceso al sistema será mediante usuario y contraseña propios del sistema. El backend será el encargado de comunicarse con Google Drive para subir y gestionar los archivos.

## 6. Autenticación y usuarios

El sistema manejará autenticación propia con:

usuario,
contraseña,
token de sesión,
roles.

Los roles iniciales serán:

**Administrador:** puede ver todos los documentos, usuarios, trazabilidad, bitácora general y realizar acciones administrativas.

**Usuario:** puede subir documentos, ver documentos en los que participa, recibir documentos derivados, realizar acciones sobre documentos asignados y consultar la trazabilidad de los documentos permitidos.

La autenticación será sencilla, sin login con Google para los usuarios. Esto reduce la complejidad del sistema y permite mantener el control desde la propia aplicación.

## 7. Flujo principal del documento

El flujo principal del sistema inicia cuando un usuario autenticado sube un documento escaneado.

El proceso será el siguiente:

1. El usuario inicia sesión en el sistema.
2. El usuario ingresa a la opción “Nuevo documento”.
3. El usuario selecciona el archivo escaneado desde su computadora.
4. El usuario registra datos básicos como nombre, descripción o contexto.
5. El sistema genera automáticamente un código interno, por ejemplo DOC-2026-0001.
6. El sistema registra automáticamente fecha y hora de subida.
7. El sistema sube el archivo a Google Drive institucional.
8. El sistema guarda los metadatos en PostgreSQL.
9. El usuario decide qué hacer con el documento:

   * solo guardar y archivar;
   * o derivar a otro usuario para revisión.
10. Si se archiva, el documento queda finalizado como “Archivado”.
11. Si se deriva, el usuario selecciona al responsable, escribe una consigna o instrucción y puede indicar una fecha límite opcional.
12. El responsable recibe el documento en su bandeja de pendientes.
13. El responsable puede marcarlo en atención, aprobarlo, observarlo, archivarlo, derivarlo a otro usuario o subir un documento relacionado.
14. Cada acción queda registrada en la trazabilidad documental y en la bitácora general del sistema.

## 8. Bandeja de pendientes

La bandeja de pendientes será una sección donde cada usuario podrá ver los documentos que tiene asignados.

No funcionará solo como una lista de archivos, sino como una bandeja de tareas documentales.

Cada pendiente mostrará de forma clara:

código del documento,
nombre del documento,
estado actual,
prioridad si corresponde,
fecha límite si existe,
archivo recibido,
usuario que subió el documento,
usuario que lo derivó,
responsable actual,
consigna recibida,
acción requerida,
última acción realizada.

Desde la bandeja, el responsable podrá realizar acciones como:

ver documento,
descargar documento,
marcar en atención,
aprobar,
observar,
archivar,
derivar a otro usuario,
subir documento relacionado,
ver trazabilidad.

La bandeja debe ser compacta y fácil de entender. Los detalles extensos se mostrarán en una vista de detalle o modal, para no saturar la pantalla.

## 9. Estados del documento

Los estados definidos para el flujo documental son:

**Registrado:** el documento fue subido al sistema.

**Derivado:** el documento fue enviado a un usuario responsable.

**En atención:** el responsable comenzó a revisar o trabajar el documento.

**Aprobado:** el documento fue revisado y aceptado.

**Observado:** el documento tiene una observación o problema registrado.

**Archivado:** el proceso del documento terminó y queda guardado para consulta.

**Eliminado lógico:** el documento fue marcado como eliminado, pero se conserva el registro histórico.

El flujo permitido será flexible, pero controlado. Un documento puede subirse y archivarse directamente, o puede pasar por derivaciones y revisión.

Un flujo común sería:

Registrado → Derivado → En atención → Aprobado → Archivado

Otro flujo posible:

Registrado → Derivado → En atención → Observado → Archivado

También puede ocurrir:

Registrado → Archivado

La eliminación física del archivo en Google Drive solo debería permitirse a usuarios con permisos suficientes, principalmente al administrador. Aun así, debe quedar registrado el evento de eliminación.

## 10. Trazabilidad documental

El sistema manejará una trazabilidad específica por documento.

Esta trazabilidad responde a la pregunta:

¿Qué pasó con este documento?

Debe registrar eventos como:

documento subido,
documento derivado,
documento abierto,
archivo visualizado,
archivo descargado,
marcado en atención,
aprobado,
observado,
archivado,
derivado a otro usuario,
documento relacionado subido,
eliminado lógicamente.

Cada evento debe registrar:

documento afectado,
usuario que realizó la acción,
acción realizada,
estado anterior,
estado nuevo,
responsable anterior,
responsable nuevo,
comentario o consigna,
fecha y hora.

La trazabilidad visual permitirá ver el recorrido del documento en forma de línea de tiempo, por ejemplo:

Ana subió el documento.
Ana derivó el documento a Juan.
Juan marcó el documento en atención.
Juan aprobó el documento.
Juan archivó el documento.

Esto permitirá al cliente controlar el movimiento de cada documento dentro de la organización.

## 11. Bitácora general del sistema

Además de la trazabilidad documental, el sistema tendrá una bitácora general.

Esta bitácora responde a la pregunta:

¿Qué hizo cada usuario dentro del sistema?

Aquí se registrarán acciones generales como:

inicio de sesión exitoso,
intento fallido de inicio de sesión,
cierre de sesión,
apertura del dashboard,
apertura de la bandeja de pendientes,
búsqueda de documentos,
apertura del detalle de un documento,
visualización de archivo,
descarga de archivo,
creación de usuario,
actualización de usuario,
desactivación de usuario,
intento de acceso no autorizado,
eliminación lógica de documento.

No todas estas acciones aparecerán en la trazabilidad visual del documento. La trazabilidad documental se enfoca en el recorrido del documento, mientras que la bitácora general se enfoca en la actividad completa del sistema.

Las acciones relacionadas directamente con un documento pueden registrarse en ambos lugares: en la trazabilidad documental y en la bitácora general.

## 12. Participantes del documento

El sistema también debe registrar todos los usuarios que participaron en un documento.

No basta con saber quién lo subió y quién es el responsable actual. También se necesita saber quiénes pasaron por el documento en algún momento.

Por eso se manejará una tabla o registro de participantes del documento.

Un usuario puede participar como:

quien subió el documento,
quien derivó el documento,
responsable,
revisor,
aprobador,
observador,
usuario que descargó,
usuario que visualizó,
administrador que realizó una acción.

Esto ayudará a responder rápidamente:

¿Qué usuarios participaron en este documento?
¿Qué rol tuvo cada usuario en el proceso?
Cuándo interactuó por primera vez.
Cuándo fue su última interacción.

Además, esta información servirá para controlar permisos, ya que un usuario normal podrá ver los documentos en los que participó.

## 13. Documentos relacionados

El sistema permitirá subir documentos relacionados a un documento principal.

Esto sirve cuando un responsable recibe un documento y necesita generar otro archivo complementario, como un informe, respuesta, revisión, carta o respaldo.

Ejemplo:

Documento principal: DOC-2026-0001 Carta de solicitud
Documento relacionado: DOC-2026-0002 Informe de revisión

La relación debe quedar registrada para que desde el documento principal se puedan ver sus documentos vinculados.

## 14. Notificaciones internas

El sistema manejará notificaciones internas simples.

Al inicio no será necesario enviar correos electrónicos. Las notificaciones pueden mostrarse dentro del sistema, por ejemplo en una campanita, contador o bandeja.

Se generarán notificaciones cuando:

un documento sea derivado a un usuario,
un documento tenga fecha límite próxima,
un documento asignado no sea atendido a tiempo,
un documento sea observado,
un documento sea reasignado.

Si un responsable no atiende un documento en cierto tiempo, el sistema deberá alertar al responsable, al usuario que inició el proceso y al administrador.

## 15. Base de datos definida

La base de datos usará PostgreSQL.

Las tablas principales serán:

**users:** usuarios del sistema.

**documents:** documentos registrados en el sistema.

**document_assignments:** asignaciones o derivaciones de documentos.

**document_events:** trazabilidad documental.

**document_participants:** usuarios que participaron en cada documento.

**related_documents:** relación entre documentos principales y documentos vinculados.

**notifications:** notificaciones internas.

**audit_logs:** bitácora general del sistema.

La relación conceptual más importante es que un documento puede tener muchos eventos, muchas asignaciones, muchos participantes y muchas notificaciones.

También existe una relación muchos a muchos entre usuarios y documentos mediante la tabla de participantes, porque un usuario puede participar en muchos documentos y un documento puede tener muchos usuarios participantes.

También existe una relación entre documentos y documentos mediante la tabla de documentos relacionados.

## 16. Arquitectura tecnológica

El sistema se implementará con la siguiente arquitectura:

Frontend: React JS con Vite y Tailwind CSS.
Backend: FastAPI.
Base de datos: PostgreSQL.
Almacenamiento de archivos: Google Drive API.
Autenticación: usuario y contraseña con JWT.
Control de versiones: Git y GitHub.

La comunicación será así:

React JS se comunica con FastAPI mediante endpoints REST.
FastAPI valida usuarios, permisos y acciones.
FastAPI guarda información en PostgreSQL.
FastAPI se conecta con Google Drive para almacenar archivos.
PostgreSQL guarda usuarios, documentos, estados, trazabilidad, bitácora y notificaciones.

El frontend no se conectará directamente ni a la base de datos ni a Google Drive. Todo deberá pasar por el backend.

## 17. Estructura de carpetas del proyecto

El proyecto se dividirá en dos carpetas principales:

backend
frontend

En el backend se manejarán las siguientes carpetas:

core: configuración general, seguridad, constantes.
db: conexión a PostgreSQL.
models: modelos de base de datos con SQLAlchemy.
schemas: esquemas Pydantic para entrada y salida de datos.
routers: endpoints de FastAPI.
services: lógica de negocio.
utils: funciones auxiliares.

En el frontend se manejarán las siguientes carpetas:

api: conexión con la API.
components: componentes reutilizables.
pages: pantallas principales.
routes: rutas de la aplicación.
context: manejo de sesión del usuario.
utils: funciones auxiliares.
layouts: estructura visual del sistema.

## 18. Endpoints principales esperados

Los endpoints principales serán:

Autenticación:

POST /api/auth/login
GET /api/auth/me

Usuarios:

GET /api/users
POST /api/users
PUT /api/users/{id}
PATCH /api/users/{id}/deactivate

Documentos:

POST /api/documents
GET /api/documents
GET /api/documents/{id}
GET /api/documents/{id}/timeline
PATCH /api/documents/{id}/derive
PATCH /api/documents/{id}/mark-in-progress
PATCH /api/documents/{id}/approve
PATCH /api/documents/{id}/observe
PATCH /api/documents/{id}/archive
PATCH /api/documents/{id}/delete-logical
POST /api/documents/{id}/related

Pendientes:

GET /api/assignments/my-pending

Notificaciones:

GET /api/notifications
PATCH /api/notifications/{id}/read

Auditoría:

GET /api/audit-logs

## 19. Orden de implementación

El desarrollo se realizará por fases.

Primero se implementará la base técnica:

configuración de FastAPI,
conexión a PostgreSQL,
modelos iniciales,
autenticación con JWT,
usuarios y roles.

Después se implementará el flujo documental sin Google Drive real, para validar la lógica:

crear documento,
generar código,
derivar documento,
bandeja de pendientes,
cambio de estados,
trazabilidad documental,
bitácora general,
notificaciones internas.

Luego se integrará Google Drive:

subida real de archivos,
almacenamiento en cuenta institucional,
guardado de identificador del archivo,
descarga o visualización controlada desde el sistema.

Finalmente se completará el frontend:

login,
dashboard,
nuevo documento,
bandeja de pendientes,
lista de documentos,
detalle del documento,
trazabilidad,
usuarios,
bitácora general.

## 20. Idea central aprobada

La idea central aprobada para DocuFlow es la siguiente:

El sistema permitirá que cualquier usuario autenticado suba documentos escaneados. Al subir un documento, el usuario podrá decidir si el proceso termina con el almacenamiento y archivo del documento, o si el documento debe ser derivado a otro usuario para revisión, aprobación, observación, archivo o generación de un documento relacionado.

En todo momento el sistema registrará el estado actual, el responsable actual, la última acción realizada, los usuarios participantes y el historial completo de movimientos.

El administrador podrá visualizar todos los documentos, todos los procesos, todos los usuarios participantes y la bitácora general del sistema. Los usuarios normales solo podrán acceder a los documentos donde participaron o que tengan asignados.

El sistema usará Google Drive institucional como almacenamiento de archivos, pero la lógica de seguimiento, permisos, estados, historial y auditoría será controlada por DocuFlow.
