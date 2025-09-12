# 🔐 Credenciales de Prueba - SISDAT-forecast

## Credenciales Válidas para Testing

### Usuario Administrador ARCONEL
- **Email**: `admin@arconel.gob.ec`
- **Contraseña**: `Arconel2025!#$`
- **Código MFA**: `804216`

### Director Ministerio de Energía
- **Email**: `director@mem.gob.ec`
- **Contraseña**: `MinEnergia2025@!`
- **Código MFA**: `926374`

### Operador CELEC
- **Email**: `operador@celec.gob.ec`
- **Contraseña**: `Celec2025$%&`
- **Código MFA**: `713948`

### Analista CENACE
- **Email**: `analista@cenace.gob.ec`
- **Contraseña**: `Cenace2025*()!`
- **Código MFA**: `105827`

## Códigos MFA Adicionales Válidos
- `294631`
- `680427`

## Características de las Contraseñas

Todas las contraseñas cumplen con los requisitos de seguridad:
- ✅ Mínimo 8 caracteres
- ✅ Contiene mayúsculas (A-Z)
- ✅ Contiene minúsculas (a-z)
- ✅ Contiene números (0-9)
- ✅ Contiene símbolos especiales (!@#$%^&*(),.?\":{}|<>)
- ✅ No contiene patrones repetitivos
- ✅ No contiene secuencias comunes
- ✅ No contiene palabras comunes como "password" o "admin"

## Flujo de Autenticación

1. **Acceso**: Navegar a `/login` o `/login/secure`
2. **Credenciales**: Ingresar email y contraseña válidos
3. **reCAPTCHA**: Se activa después de 2 intentos fallidos
4. **MFA**: Ingresar código de 6 dígitos
5. **Dashboard**: Acceso concedido al completar MFA

## Notas de Seguridad

- Las contraseñas están diseñadas para cumplir con estándares gubernamentales
- Los códigos MFA evitan patrones secuenciales y repetitivos
- El sistema valida dominios institucionales ecuatorianos
- Sesiones expiran automáticamente después de 15 minutos

## Para Desarrollo

Estas credenciales están configuradas únicamente para:
- Testing local
- Demostración de funcionalidades
- Validación de seguridad
- Desarrollo y debugging

**⚠️ IMPORTANTE**: En producción, estas credenciales deben ser reemplazadas con un sistema de autenticación real conectado a Active Directory o base de datos institucional.

---
**Actualizado**: Agosto 2025  
**Entorno**: Desarrollo/Testing  
**Seguridad**: Demo/Simulación