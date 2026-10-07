# PagoClaro Portal

Frontend local en React y Vite, con tres experiencias según el rol:

- Administrador: Resumen, Pagos y Control.
- Operador: Bandeja, Registrar y Revisión.
- Cliente: Inicio, Nuevo pago e Historial.

## Inicio rápido

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Abrir `http://localhost:5173`. El backend debe estar ejecutándose en `http://localhost:8000`.

## Cuentas de demostración

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin@pagoclaro.co` | `Admin123!` |
| Operador | `operador@pagoclaro.co` | `Operador123!` |
| Cliente | `cliente@pagoclaro.co` | `Cliente123!` |

## Recorrido recomendado

1. Ingresar como Cliente y registrar una solicitud en **Nuevo pago**.
2. Ingresar como Operador y procesarla desde **Revisión**.
3. Ingresar como Administrador y consultar **Resumen**, **Pagos** y **Control**.

## Backend

Este frontend consume la API del repositorio [backAdopcionBOCC](https://github.com/AcamposPeriferia/backAdopcionBOCC).

