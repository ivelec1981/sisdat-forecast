import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validar token (en un sistema real se verificaría contra la base de datos)
    if (!token || !token.startsWith('mock-reset-token')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token de restablecimiento inválido o expirado.' 
        },
        { status: 400 }
      );
    }

    // Validar contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'La contraseña no cumple con los requisitos de seguridad.' 
        },
        { status: 400 }
      );
    }

    // En un sistema real, aquí se actualizaría la contraseña en la base de datos
    console.log(`[MOCK] Contraseña actualizada para token: ${token}`);

    return NextResponse.json({
      success: true,
      message: 'Contraseña restablecida exitosamente.',
    });

  } catch (error) {
    console.error('Error en reset-password:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor. Intente nuevamente.' 
      },
      { status: 500 }
    );
  }
}