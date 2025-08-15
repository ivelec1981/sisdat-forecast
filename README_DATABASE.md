# 🗄️ Implementación de Base de Datos - SISDAT Forecast

## 📊 **Estado Actual vs Nuevo Sistema**

### **❌ Antes (Datos Estáticos):**
- Datos hardcodeados en archivos `.ts`
- Sin persistencia
- Sin capacidad de actualización en tiempo real
- Datos simulados con `Math.random()`

### **✅ Después (Base de Datos PostgreSQL + Prisma):**
- Datos persistentes en PostgreSQL
- API REST completa
- Actualizaciones en tiempo real
- Capacidad de carga masiva de datos
- Sistema de logs y auditoría

---

## 🚀 **Configuración e Instalación**

### **1. Instalar PostgreSQL**

#### **Ubuntu/WSL2:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start

# Crear base de datos
sudo -u postgres psql
CREATE DATABASE sisdat_forecast;
CREATE USER sisdat_user WITH PASSWORD 'sisdat_password';
GRANT ALL PRIVILEGES ON DATABASE sisdat_forecast TO sisdat_user;
\q
```

#### **Docker (Recomendado):**
```bash
docker run --name sisdat-postgres \
  -e POSTGRES_DB=sisdat_forecast \
  -e POSTGRES_USER=sisdat_user \
  -e POSTGRES_PASSWORD=sisdat_password \
  -p 5432:5432 \
  -d postgres:15
```

### **2. Configurar Variables de Entorno**
```bash
cp .env.example .env.local
```

Editar `.env.local`:
```env
DATABASE_URL="postgresql://sisdat_user:sisdat_password@localhost:5432/sisdat_forecast"
```

### **3. Generar Prisma Client y Crear Tablas**
```bash
# Generar cliente Prisma
npm run db:generate

# Crear tablas en la base de datos
npm run db:push

# Poblar con datos de ejemplo
npm run db:seed
```

### **4. Verificar Instalación**
```bash
# Abrir Prisma Studio (interfaz web para ver los datos)
npm run db:studio
```

---

## 📋 **Estructura de la Base de Datos**

### **Tablas Principales:**

#### **🏢 Companies** - Empresas Distribuidoras
```sql
- id (PK)
- name (E.E. Quito, CNEL-Guayaquil, etc.)
- code (EEQ, CNEL-GYE, etc.)
- region (Sierra Norte, Costa Sur, etc.)
- population (habitantes servidos)
- area (área de cobertura en km²)
```

#### **⚡ Energy Records** - Datos Energéticos
```sql
- id (PK)
- companyId (FK -> companies)
- category (res, com, ind, ap, otr)
- year, month
- model (hist, prophet, gru, lstm, etc.)
- energy (consumo/predicción en MWh)
- accuracy (precisión del modelo)
```

#### **🗼 Transmission Stations** - Estaciones de Transmisión
```sql
- id (PK)
- companyId (FK -> companies)
- name, lat, lng
- voltage (kV), demand (MW), maxDemand (MW)
- stationType, status, sector, tariff
```

#### **🤖 Model Configs** - Configuración de Modelos ML
```sql
- id (PK)
- name (prophet, gru, etc.)
- displayName, isActive
- parameters (JSON con configuración)
- lastTrained, accuracy
```

---

## 🔌 **APIs Disponibles**

### **GET /api/companies**
Obtiene todas las empresas distribuidoras
```typescript
fetch('/api/companies')
  .then(res => res.json())
  .then(data => console.log(data.data));
```

### **GET /api/energy-data**
Obtiene datos energéticos con filtros
```typescript
const params = new URLSearchParams({
  companyId: '1',
  category: 'res',
  year: '2024',
  model: 'prophet'
});

fetch(`/api/energy-data?${params}`)
  .then(res => res.json())
  .then(data => console.log(data.data));
```

### **POST /api/energy-data**
Crea nuevo registro energético
```typescript
fetch('/api/energy-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyId: 1,
    category: 'res',
    year: 2025,
    model: 'prophet',
    energy: 125000.5,
    accuracy: 94.2
  })
});
```

### **GET /api/transmission-stations**
Obtiene estaciones de transmisión
```typescript
fetch('/api/transmission-stations?companyId=1')
  .then(res => res.json())
  .then(data => console.log(data.data));
```

---

## 🎯 **Migración de Componentes**

### **Hooks Actualizados:**

#### **useEnergyData** - Reemplaza useSimpleProjectionData
```typescript
import { useEnergyData, useCompanies } from '@/hooks/useEnergyData';

function ProjectionsTab() {
  const { companies } = useCompanies();
  const { energyData, loading } = useEnergyData({
    companyId: 1,
    category: 'res'
  });
  
  return (
    <div>
      {loading ? 'Loading...' : energyData.map(record => (
        <div key={record.id}>{record.energy} MWh</div>
      ))}
    </div>
  );
}
```

#### **useTransmissionStations** - Para el mapa
```typescript
import { useTransmissionStations } from '@/hooks/useEnergyData';

function TransmissionMapTab() {
  const { stations, loading } = useTransmissionStations(1);
  
  return (
    <SimpleMap cargas={stations} onCargaSelect={handleSelect} />
  );
}
```

---

## 🔄 **Comandos de Base de Datos**

```bash
# Desarrollo
npm run db:generate    # Generar cliente Prisma
npm run db:push       # Aplicar cambios del schema
npm run db:seed       # Poblar con datos de ejemplo
npm run db:studio     # Abrir interfaz visual
npm run db:migrate    # Crear migración

# Producción
npm run db:deploy     # Aplicar migraciones en producción
```

---

## 📊 **Datos de Ejemplo Incluidos**

Después de ejecutar `npm run db:seed`:

- **10 empresas** distribuidoras reales de Ecuador
- **6 modelos** ML configurados (Prophet, GRU, WaveNet, etc.)
- **2,750+ registros** energéticos (2020-2030)
- **50+ estaciones** de transmisión con coordenadas GPS
- **5 categorías** de consumo (res, com, ind, ap, otr)

---

## 🌐 **Opciones de Despliegue**

### **Desarrollo Local:**
- PostgreSQL local o Docker
- Prisma Studio para visualizar datos

### **Producción:**
- **Vercel Postgres** (recomendado para Vercel)
- **PlanetScale** (MySQL compatible)
- **Railway Postgres**
- **AWS RDS**
- **Digital Ocean Database**

---

## 🔍 **Monitoreo y Logs**

El sistema incluye:
- **Logs automáticos** de todas las operaciones
- **Métricas de precisión** por modelo
- **Auditoría** de cambios de datos
- **Tracking** de actualizaciones

---

¿Quieres que proceda a implementar alguna parte específica o prefieres que configure primero la base de datos?