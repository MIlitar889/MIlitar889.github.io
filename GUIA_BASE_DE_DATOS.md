# Guía: crear la base de datos (Supabase), paso a paso

Los nombres de los botones pueden cambiar un poco con el tiempo; si algo no coincide, mándame una captura.

## Antes de empezar: qué plan elegir
- **Gratis (Free):** sirve para las pruebas. Límites importantes: el proyecto **se pausa si pasa una semana sin actividad** (hay que reactivarlo a mano), **no incluye respaldos diarios** y tiene 500 MB de base de datos.
- **Pro (25 USD al mes aprox.):** no se pausa y trae respaldos diarios de 7 días. Es lo recomendable para operar con ventas reales.
- Los precios y límites cambian: confírmalos en supabase.com/pricing antes de pagar.
- Mi sugerencia: empezar gratis, probar una semana, y pasar a Pro antes de usarlo con ventas reales.

## Paso 1: Crear la cuenta
1. Entra a supabase.com y toca **Start your project / Sign up**.
2. Regístrate con **el correo del restaurante** (no con uno personal), para que la cuenta no dependa de una sola persona.
3. Guarda el correo y la contraseña en el Drive del negocio.

## Paso 2: Crear el proyecto
1. **New project**. Nombre: `sushi-puuk`.
2. **Database password:** crea una contraseña larga y **guárdala en el Drive del negocio**. No se puede ver después.
3. **Region:** una de Estados Unidos; la más cercana a Yucatán suele ser *East US*.
4. Plan: Free por ahora. Espera 1 o 2 minutos a que termine de crearse.

## Paso 3: Crear las tablas
1. En el menú izquierdo: **SQL Editor → New query**.
2. Abre el archivo `supabase/01_esquema.sql`, copia **todo** y pégalo.
3. Toca **Run**. Debe decir que terminó sin errores (*Success*). Si marca error, mándame una captura.

## Paso 4: Desactivar el registro abierto (importante)
1. **Authentication → Sign In / Providers → Email**.
2. Apaga **Allow new users to sign up** (permitir que se registren usuarios nuevos).
3. Apaga **Confirm email** (para que los usuarios que tú crees puedan entrar sin confirmar por correo).

## Paso 5: Crear a las personas
1. **Authentication → Users → Add user → Create new user**.
2. Escribe un correo y una contraseña para cada rol y marca **Auto Confirm User**:
   - Dueño, Caja, Cocina y uno por cada mesero.
   - Los correos pueden ser inventados con tu dominio (ej. `caja@tudominio.com`); no necesitan existir, porque no se usa recuperación por correo.
3. Apunta cada correo y contraseña en el Drive del negocio.
4. Vuelve al **SQL Editor**, abre `supabase/02_usuarios.sql`, **cambia los correos** por los que creaste y dale **Run**. Eso les asigna su papel.

## Paso 6: Qué puede hacer cada papel
| Papel | Ve | Puede escribir |
|---|---|---|
| Dueño y caja | Todo | Todo |
| Cocina y meseros | Todo menos "finanzas" | Solo pedidos, mesas, rondas, chat, clientes y canjes. **Nunca** menú, precios ni configuración |

Nota de privacidad: cocina y meseros pueden ver la lista de clientes (con teléfonos). Si prefieren que no, me avisan y lo restrinjo.

## Paso 7: Las dos llaves que me tienes que dar
1. **Project Settings → API** (o *API Keys*).
2. Copia **Project URL** (algo como `https://xxxx.supabase.co`) y la llave **anon / publishable**.
3. Esas dos **sí se pueden compartir conmigo**: están hechas para ir dentro de la página, y lo que protege los datos son las reglas del Paso 3.
4. **NUNCA** me mandes ni pegues en ningún lado la llave **service_role / secret** ni la contraseña de la base de datos.

## Si algo sale mal
- *"permission denied" o "relation does not exist":* el Paso 3 no terminó bien; corre el `01_esquema.sql` otra vez.
- *Un usuario entra pero no ve nada:* falta correr el Paso 5.4 con su correo bien escrito.
- *La app dice que no hay conexión después de una semana sin usarla:* el plan gratis se pausó; entra a supabase.com y toca **Restore project**.

## Lo que haré yo mientras tanto
1. Cambiar el panel para que lea y guarde en la base de datos en lugar del navegador (con números de pedido que no se repitan entre aparatos).
2. Pantalla de inicio de sesión por papel (caja, cocina, meseros, dueño), que reemplaza al bloqueo básico actual.
3. Que los cambios lleguen en tiempo real a todos los aparatos.
4. Pruebas con una base de datos simulada. **Mi sandbox no puede conectarse a Supabase**, así que la primera prueba real será con ustedes, con la caja y un celular a la vez.
5. Pasar los datos que ya tienen (menú, clientes, configuración) a la base, con el respaldo de Configuración.
