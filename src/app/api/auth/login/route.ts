import { NextRequest, NextResponse } from 'next/server';

// Credenciales de prueba para diferentes roles
const mockUsers = [
  {
    id: '1',
    email: 'admin@arconel.gob.ec',
    password: 'Admin123@',
    name: 'Dr. Carlos Mendoza',
    role: 'administrador' as const,
    company: 'ARCONEL',
  },
  {
    id: '2',
    email: 'operador@celec.gob.ec',
    password: 'Operador123@',
    name: 'Ing. María Rodríguez',
    role: 'operador_empresa' as const,
    company: 'CELEC',
  },
  {
    id: '3',
    email: 'consultor@mem.gob.ec',
    password: 'Consultor123@',
    name: 'Ing. Luis Herrera',
    role: 'consultor_mem' as const,
    company: 'MEM',
  },
];

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Formato de datos inválido.' 
        },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Validar campos requeridos
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email y contraseña son requeridos.' 
        },
        { status: 400 }
      );
    }

    // Simular delay de autenticación
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Buscar usuario en las credenciales mock
    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Usuario o contraseña incorrectos. Verifique sus credenciales.' 
        },
        { status: 401 }
      );
    }

    // Generar token mock (en producción sería un JWT real)
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Autenticación exitosa',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
      },
      token,
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor. Intente nuevamente.' 
      },
      { status: 500 }
    );
  }
}