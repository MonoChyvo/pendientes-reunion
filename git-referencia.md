# Git — Referencia rápida

## Configuración inicial (solo una vez)

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

---

## Flujo diario

```bash
git status                  # ver qué cambió
git add .                   # agregar todos los cambios
git add archivo.jsx         # agregar un archivo específico
git commit -m "descripción" # guardar cambios con mensaje
git push                    # subir a GitHub
```

---

## Ramas — para experimentar sin romper nada

```bash
git branch                        # ver en qué rama estás
git checkout -b nombre-rama       # crear y entrar a rama nueva
git checkout main                 # regresar a main
git merge nombre-rama             # fusionar rama a main (estando en main)
git branch -d nombre-rama         # borrar rama ya fusionada
```

### Flujo típico con ramas

```bash
# 1. Crear rama para experimentar
git checkout -b experimento-dark-mode

# 2. Hacer cambios, guardar
git add .
git commit -m "prueba dark mode"

# 3a. Si funcionó — fusionar a main y publicar
git checkout main
git merge experimento-dark-mode
git push

# 3b. Si no funcionó — descartar sin afectar main
git checkout main
git branch -D experimento-dark-mode
```

---

## Deshacer cosas

```bash
git restore archivo.jsx           # descartar cambios sin guardar
git restore .                     # descartar TODOS los cambios sin guardar
git revert HEAD                   # deshacer el último commit (seguro)
git log --oneline                 # ver historial de commits
```

---

## Sincronizar con GitHub

```bash
git pull                          # traer cambios de GitHub a tu máquina
git push                          # subir tus cambios a GitHub
git clone URL                     # descargar un repo por primera vez
```

---

## Situaciones comunes

### Subiste algo que no querías
```bash
git revert HEAD
git push
```

### Quieres ver qué cambió antes de hacer commit
```bash
git diff
```

### Te cambiaste de rama con cambios sin guardar
```bash
git stash          # guarda cambios temporalmente
git checkout main
git stash pop      # recupera los cambios guardados
```

### Conflicto al hacer merge
Abre el archivo con conflicto, busca las líneas con `<<<<<<<` y `>>>>>>>`, 
edita dejando solo lo que quieres, luego:
```bash
git add .
git commit -m "resuelve conflicto"
```

---

## Referencia de estados

| Estado | Qué significa |
|--------|---------------|
| `modified` | archivo cambiado, no guardado aún |
| `staged` | listo para commit (después de `git add`) |
| `committed` | guardado en historial local |
| `pushed` | subido a GitHub |

---

## Regla de oro

> Haz commits pequeños y frecuentes con mensajes claros.  
> Una rama por experimento. Fusiona solo cuando funcione.
