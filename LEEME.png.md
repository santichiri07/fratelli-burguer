# Cómo hacer funcionar tu página (paso a paso)

No necesitás entender todo el código para verla funcionando. Seguí estos pasos en orden.

## 1) Instalá lo básico (una sola vez)

- Instalá **Node.js**: https://nodejs.org/ (bajate la versión que dice "LTS")
- Instalá **VS Code**: https://code.visualstudio.com/ (el programa donde vas a ver el código)

## 2) Abrí el proyecto

1. Descomprimí la carpeta que te di (`cheese-burger-web`) en tu escritorio.
2. Abrí **VS Code**.
3. Andá a `Archivo > Abrir carpeta` y seleccioná `cheese-burger-web`.

## 3) Instalá las dependencias

Esto descarga las piezas que necesita el proyecto para funcionar (solo se hace una vez).

1. En VS Code, abrí la terminal: menú `Terminal > Nueva Terminal`.
2. Escribí esto y apretá Enter:

```
npm install
```

Va a tardar uno o dos minutos. Cuando termina, volvés a ver el cursor libre.

## 4) Prendé la página

En la misma terminal, escribí:

```
npm run dev
```

Te va a aparecer algo como `Local: http://localhost:3000`. Mantené apretado Ctrl y hacé clic ahí (o copialo y pegalo en el navegador). **Ahí está tu página funcionando.**

Para apagarla: volvé a la terminal y apretá `Ctrl + C`.

## 5) Poné tu número de WhatsApp

Esto es lo único que TENÉS que cambiar para que el botón de pedidos te funcione:

1. Abrí el archivo `app/page.js`
2. Buscá esta línea (cerca del principio):

```js
const WHATSAPP_NUMBER = "549221XXXXXXX";
```

3. Reemplazá `549221XXXXXXX` por tu número real, así: `54` + código de área sin el 0 + tu número sin el 15.
   - Ejemplo si tu número es 221 555-1234 → `5492215551234`
4. Guardá el archivo (Ctrl + S). La página se actualiza sola.

## 6) Editá el menú (opcional, cuando quieras)

En el mismo archivo `app/page.js`, más abajo vas a ver un bloque que arranca así:

```js
const MENU = [
  {
    id: "cheese",
    name: "Burger Cheese",
    ...
```

Ahí está cada hamburguesa con su nombre, descripción, y precios. Podés copiar un bloque `{ ... }` completo para agregar un producto nuevo, o editar los precios directamente.

## 7) Cuando quieras subirla a internet (que cualquiera la vea)

Ese es el siguiente paso, no hace falta ahora. Cuando llegues ahí, avisame y te guío para subirla gratis con Vercel y ponerle tu propio dominio.

---

### ¿Qué hace esta página ahora mismo?

- Muestra el menú con las hamburguesas y variantes (simple/doble, sazonada/no)
- El cliente arma su pedido en un carrito con estilo "comanda de cocina"
- Al tocar "Enviar pedido por WhatsApp", se abre WhatsApp con el pedido ya escrito, listo para mandar

### Lo que todavía NO hace (próximos pasos posibles)

- Cobro online (Mercado Pago)
- Cálculo automático de zona/costo de envío
- Guardar pedidos en una base de datos / panel para el local

Andá de a un paso a la vez. Primero hacela funcionar así como está, jugá con los precios y el menú, y cuando te sientas cómodo seguimos con el siguiente paso.
