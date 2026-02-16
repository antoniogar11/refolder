# Guia de Git y GitHub - Refolder

## Tabla de Contenidos

- [Push Basico](#push-basico)
- [GitHub Desktop](#github-desktop)
- [Solucion de Problemas](#solucion-de-problemas)

---

## Push Basico

### Que es un Push?

- **Commit** = Guardar los cambios en tu ordenador
- **Push** = Subir esos cambios a Internet (GitHub)
- Vercel necesita ver los cambios en GitHub para desplegar

### Opcion Terminal: Push Manual

Ejecuta estos comandos en tu terminal:

```bash
cd /Users/macdeantonio/Refolder/refolder
git push origin main
```

Si te pide usuario y contrasena:
- **Usuario**: Tu nombre de usuario de GitHub (probablemente `antoniogar11`)
- **Contrasena**: **NO uses tu contrasena de GitHub**, usa un **Personal Access Token**

### Crear Personal Access Token

1. Ve a GitHub.com e inicia sesion
2. Click en tu foto de perfil > **Settings**
3. En el menu izquierdo, ve a **Developer settings**
4. Click en **Personal access tokens** > **Tokens (classic)**
5. Click en **Generate new token** > **Generate new token (classic)**
6. Dale un nombre: "Refolder Push"
7. Selecciona el scope: **repo** (todo marcado)
8. Click en **Generate token**
9. **COPIA EL TOKEN INMEDIATAMENTE!** (solo se muestra una vez, empieza con `ghp_...`)
10. Usalo como contrasena cuando hagas `git push`

### Guardar Credenciales (Una sola vez)

Para no tener que poner usuario/token cada vez:

```bash
cd /Users/macdeantonio/Refolder/refolder

# Guardar credenciales (preguntara usuario y token la primera vez)
git config --global credential.helper osxkeychain

# Ahora haz push (solo pedira credenciales una vez)
git push origin main
```

### Verificar que funciono

Despues del push, verifica:
```bash
git status
```

Deberia decir: `Your branch is up to date with 'origin/main'`

O ve a tu repositorio en GitHub:
https://github.com/antoniogar11/refolder

### Hacer Push paso a paso desde Terminal

1. Abre la Terminal en tu Mac (Cmd + Espacio, escribe "Terminal", Enter)
2. Escribe estos comandos (uno por uno, presiona Enter despues de cada uno):
   ```bash
   cd /Users/macdeantonio/Refolder/refolder
   git push origin main
   ```
3. Cuando te pida "Username": escribe tu nombre de usuario de GitHub (probablemente `antoniogar11`)
4. Cuando te pida "Password": NO pongas tu contrasena normal. Pega el TOKEN que copiaste
5. Presiona Enter
6. Deberia decir algo como "Successfully pushed"

---

## GitHub Desktop

### Pasos en GitHub Desktop

1. **Abre** GitHub Desktop. Deberias ver tu proyecto "refolder" en la lista.

2. **Selecciona** el proyecto "refolder". Haz click en el para verlo.

3. **Mira arriba** en la barra de herramientas (parte superior de la ventana).

4. **Busca un boton** que dice:
   - "Push origin"
   - "Push to origin"
   - "Push origin/main"
   - O un numero como "1" con un icono de flecha hacia arriba

   Este boton esta en la parte superior, a la derecha.

5. **Haz click** en ese boton.

6. **Espera** unos segundos mientras sube.

7. **Listo!** Deberia decir "Successfully pushed" o algo similar.

### Ubicacion del boton (Descripcion Visual)

GitHub Desktop tiene esta estructura:

```
+-----------------------------------------------------+
| [Menu] File Edit View Repository Branch Help         |
+-----------------------------------------------------+
|                                                       |
|  Current repository: refolder                        |
|  [Branch: main] [Fetch origin] [Push origin] <-- AQUI|
|                                                       |
|  +--------------------------------------------------+|
|  | Changes (archivos modificados)                    ||
|  +--------------------------------------------------+|
|                                                       |
|  +--------------------------------------------------+|
|  | History (commits)                                 ||
|  +--------------------------------------------------+|
+-----------------------------------------------------+
```

El boton "Push origin" esta en la barra superior, junto a "Fetch origin" y el nombre de la rama.

### Si NO ves el boton "Push"

Verifica lo siguiente:

**A) Esta seleccionado el proyecto correcto?**
- Asegurate de que "refolder" este seleccionado

**B) Ya esta actualizado?**
- Ve a: Repository > Pull (o Fetch origin) primero
- Luego busca el boton Push

**C) Esta conectado a GitHub?**
- Arriba, en "Repository" > "Repository Settings"
- Verifica que el "Remote URL" sea: `https://github.com/antoniogar11/refolder.git`

**D) Tienes commits para subir?**
- En la parte inferior, en "History"
- Busca un commit pendiente de subir
- Si no esta en GitHub, necesita hacer Push

### Verificar que funciono

Despues del push:

1. En GitHub Desktop, en la parte inferior (History): el commit deberia aparecer con un icono de nube o deberia desaparecer de la lista si ya esta subido.

2. Ve a tu navegador: https://github.com/antoniogar11/refolder
   - Deberias ver el commit nuevo.

---

## Solucion de Problemas

### No aparece el boton Push en GitHub Desktop

Si no ves el boton "Push" en GitHub Desktop, puede ser porque:
1. El repositorio no esta conectado correctamente
2. Ya esta todo actualizado
3. Hay un problema de configuracion

#### Solucion: Hacer Push desde la Terminal

Como GitHub Desktop no muestra el boton, hazlo directamente desde la Terminal:

**Paso 1: Crear un Token de GitHub** (si no lo tienes)
1. Abre tu navegador
2. Ve a: https://github.com/settings/tokens
3. Click en "Generate new token" > "Generate new token (classic)"
4. Nombre: "Refolder Push"
5. Marca la casilla "repo" (todo)
6. Click en "Generate token" (abajo)
7. COPIA EL TOKEN! (empieza con ghp_...)

**Paso 2: Hacer Push desde Terminal**
1. Abre la Terminal en tu Mac (Cmd + Espacio, escribe "Terminal", Enter)
2. Copia y pega estos comandos (uno por uno):
   ```bash
   cd /Users/macdeantonio/Refolder/refolder
   git push origin main
   ```
3. Cuando te pida "Username": escribe `antoniogar11`
4. Cuando te pida "Password": pega el TOKEN que copiaste (NO tu contrasena)
5. Presiona Enter
6. Deberia decir: "Successfully pushed" o similar

#### Alternativa: Configurar GitHub Desktop

Si prefieres usar GitHub Desktop:
1. En GitHub Desktop, ve a: Repository > Repository Settings
2. Verifica que el "Remote URL" sea: `https://github.com/antoniogar11/refolder.git`
3. Si no es correcto, cambialo
4. Cierra y vuelve a abrir GitHub Desktop
5. Ahora deberia aparecer el boton Push

Pero la forma mas rapida es usar la Terminal.

### Si algo falla al hacer push

Ejecuta esto para ver mas detalles:
```bash
cd /Users/macdeantonio/Refolder/refolder
git push origin main -v
```

### Verificacion general

Abre tu navegador y ve a:
https://github.com/antoniogar11/refolder

Deberias ver tus commits mas recientes. Si los ves, el push funciono correctamente y ya puedes hacer deploy en Vercel.
