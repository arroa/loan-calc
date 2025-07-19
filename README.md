# Simulador de Crédito Chile

Simulador de préstamos con algoritmo validado según normativa chilena.

## 🚀 Características

- ✅ Algoritmo de amortización francés validado
- ✅ Cálculo de cuotón final
- ✅ Integración con Banco Central de Chile (UF, TMC)
- ✅ Interfaz moderna con React + TypeScript
- ✅ Validaciones según normativa chilena
- ✅ Cálculo de días exactos entre fechas
- ✅ Soporte para capitalización de intereses
- ✅ Casos especiales: meses sin pago y cuotas especiales
- ✅ Herramienta de debug completa

## 📋 Prerrequisitos

- Node.js 18+ 
- npm o yarn

## 🛠️ Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno

**Opción A: Usando archivo .env.local (recomendado para desarrollo)**
```bash
# Copiar archivo de ejemplo
copy env.example .env.local

# Editar .env.local y agregar tu API key de Gemini
GEMINI_API_KEY=tu_api_key_aqui
```

**Opción B: Variables de entorno del sistema**
```bash
# Windows
set GEMINI_API_KEY=tu_api_key_aqui

# Linux/Mac
export GEMINI_API_KEY=tu_api_key_aqui
```

### 3. Obtener API Key de Gemini
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Agrega la key a tu archivo .env.local

## 🏃‍♂️ Ejecutar la aplicación

### Desarrollo completo (frontend + backend)
```bash
npm run dev:full
```

### Solo frontend
```bash
npm run dev
```

### Solo backend
```bash
npm run server
```

### Build para producción
```bash
npm run build
npm run preview
```

## 📊 Variables de Entorno Disponibles

| Variable | Descripción | Requerida | Valor por defecto |
|----------|-------------|-----------|-------------------|
| `GEMINI_API_KEY` | API Key de Google Gemini | ✅ Sí | - |
| `PORT` | Puerto del servidor backend | ❌ No | 3001 |
| `NODE_ENV` | Modo de ejecución | ❌ No | development |
| `BC_USER` | Usuario Banco Central | ❌ No | - |
| `BC_PASS` | Contraseña Banco Central | ❌ No | - |

## 🔧 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo frontend
- `npm run server` - Servidor backend
- `npm run dev:full` - Frontend + Backend simultáneamente
- `npm run build` - Build para producción
- `npm run preview` - Preview del build

## 📁 Estructura del Proyecto

```
LoanSimulator/
├── components/          # Componentes React
├── services/           # Servicios y APIs
├── tests/             # Tests del algoritmo
├── loans.js           # Algoritmo principal
├── server.js          # Servidor backend
├── config.js          # Configuración centralizada
└── env.example        # Variables de entorno
```

## 🧮 Algoritmo

El simulador utiliza un algoritmo de amortización francés con las siguientes características:

- **Cálculo de días exactos** entre fechas
- **Interés compuesto** según normativa chilena
- **Soporte para cuotón final**
- **Validaciones** de límites y parámetros

## 🔒 Seguridad

- Variables de entorno para configuración sensible
- Validación de entrada en frontend y backend
- CORS configurado para orígenes permitidos
- Sanitización de datos de entrada

## 📈 Monitoreo

- Logs estructurados
- Endpoint de health check: `/api/health`
- Métricas básicas de rendimiento

## 🚀 Despliegue

### Heroku
```bash
# Configurar variables de entorno
heroku config:set GEMINI_API_KEY=tu_api_key

# Desplegar
git push heroku main
```

### Vercel
```bash
# Configurar variables de entorno en dashboard
# Desplegar automáticamente desde GitHub
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Para reportar bugs o solicitar features, abre un issue en GitHub.

# Simulador de Préstamos - Algoritmo de Cálculo

## Algoritmo de Determinación de Cuota Fija (Amortización Francesa)

### Parámetros de Entrada
- **Capital**: Monto del préstamo
- **Plazo**: Número de cuotas (N)
- **Cuotón**: Pago final (opcional)
- **Fecha de firma**: Fecha de contratación
- **Fecha de primer vencimiento**: Fecha de la primera cuota
- **Tasa de interés mensual**: Tasa en porcentaje

### Parámetros Técnicos (Debug)
- **Debug**: `ON/OFF/vacío` - Controla nivel de detalle en logs
- **Tolerancia**: 20 pesos (configurable según plazo/capital/tasa)
- **Tolerancia de variación**: 5 pesos entre iteraciones
- **Máximo iteraciones**: Para evitar loops infinitos

### Lógica de Fechas
- **Día fijo**: Todas las cuotas vencen el mismo día del mes
- **Meses sucesivos**: No se saltan meses
- **Días variables**: Entre cuotas puede haber 28, 29, 30 o 31 días
- **Caso especial**: Si vencimiento es 29/30/31 y el mes no tiene ese día, usar último día natural del mes

### Estructura de Datos
Cada fila (cuota) tiene 9 columnas:
1. **Número de cuota**
2. **Fecha de vencimiento**
3. **Días del período** (DPi)
4. **Tasa del período** = (Tasa/30/100) × DPi
5. **Capital inicial del período**
6. **Valor cuota** (variable de iteración)
7. **Interés del período** = Tasa × Capital inicial (redondeado)
8. **Capital de la cuota** = Cuota - Interés (entero)
9. **Capital residual** = Capital inicial - Capital de la cuota (entero)

### Algoritmo de Iteración

#### Inicialización
- **Cuota inicial**: 1/4 del capital redondeado al entero
- **Tolerancia**: 20 pesos (configurable según plazo/capital/tasa)
- **Tolerancia de variación**: 5 pesos entre iteraciones

#### Proceso Iterativo

**Para cada iteración:**

1. **Generar tabla completa** con N filas usando la cuota actual
2. **Evaluar capital residual final** (fila N, columna 9)
3. **Decidir siguiente acción**:
   - **Si residual < tolerancia**: Terminar iteración
   - **Si residual < 0**: Cuota muy alta → Reducir cuota
   - **Si residual > 0**: Cuota muy baja → Aumentar cuota
   - **Si variación cuota < 5 pesos**: Terminar iteración

#### Ajuste Final
- **Residual final**: Se suma al capital de la última cuota
- **Resultado**: Capital residual = 0 (exacto)

### Capitalización de Intereses

#### Comportamiento Natural
- **Períodos largos**: Cuando hay muchos días entre cuotas, el interés puede ser mayor que la cuota
- **Capital negativo**: Si cuota < interés, el capital de la cuota es negativo
- **Capital residual aumenta**: El capital residual se incrementa en lugar de disminuir
- **Soporte nativo**: El algoritmo maneja esto naturalmente sin casos especiales

#### Ejemplo
- **Período**: 155 días (18/07 → 20/12)
- **Interés**: 277.450 (alto por período largo)
- **Cuota fija**: 166.625 (insuficiente)
- **Capital**: -110.825 (negativo)
- **Residual**: Aumenta de 3.000.000 a 3.110.825

### Casos Especiales

#### Meses Sin Pago
- **Lógica**: Período largo que combina meses
- **Ejemplo**: Febrero → Abril (sin pago en marzo)
- **Días del período**: Fecha abril - Fecha febrero
- **Tasa del período**: (Tasa/30/100) × días del período largo
- **Interés**: Se calcula sobre el período completo
- **Capital**: Se paga normalmente

#### Cuotas Especiales
- **Lógica**: Cuota con valor fijo predefinido
- **Ejemplo**: Abril = $200.000, Octubre = $150.000
- **Implementación**: Fila con cuota fija, no se itera
- **Resto de filas**: Cuota variable (se itera)

#### Combinación de Casos
- **Parámetros extendidos**:
```javascript
{
  capital: 3000000,
  plazo: 84,
  tasa: 1.79,
  fechaFirma: "2025-01-15",
  primerVencimiento: "2025-02-10",
  cuoton: 0,
  mesesSinPago: [3, 8], // marzo y agosto
  cuotasEspeciales: [
    {mes: 4, valor: 200000}, // abril
    {mes: 10, valor: 150000} // octubre
  ]
}
```

### Algoritmo con Cuotón

#### Estructura Modificada
- **N+1 filas** en lugar de N filas
- **Fila N+1**: Cuota fija = valor del cuotón
- **Filas 1 a N**: Cuota variable (se itera)

#### Lógica del Algoritmo
1. **Generar tabla** con N+1 filas
2. **Fila N+1**: Cuota = cuotón (fijo, no cambia)
3. **Evaluar residual final** (fila N+1, columna 9)
4. **Iterar** sobre las cuotas 1 a N para que el residual final sea ≈ 0

### Características del Algoritmo
- **Precisión**: Maneja días reales entre cuotas
- **Convergencia**: Método de bisección para encontrar cuota óptima
- **Redondeo**: Todos los valores monetarios son enteros
- **Flexibilidad**: Maneja cuotón final y fechas variables
- **Capitalización**: Soporte nativo para intereses no pagados
- **Casos especiales**: Meses sin pago y cuotas especiales

### Ventajas
- **Exactitud**: Saldo final siempre es cero
- **Realismo**: Considera días reales entre cuotas
- **Eficiencia**: Converge rápidamente con tolerancia configurable
- **Robustez**: Maneja casos edge de fechas
- **Simplicidad**: Fórmulas matemáticas simples sin casos especiales
- **Extensibilidad**: Fácil agregar nuevos casos especiales

### Herramientas de Debug
- **debug.html**: Interfaz completa para análisis de iteraciones
- **loansdebug.js**: Implementación con debug detallado
- **Parámetro debug**: Controla nivel de detalle en logs
- **Tabla de iteraciones**: Muestra todas las iteraciones del algoritmo
