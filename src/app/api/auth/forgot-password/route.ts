import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Simular delay de procesamiento
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Formato de correo electrónico inválido.' 
        },
        { status: 400 }
      );
    }

    // En un sistema real, aquí se verificaría si el email existe
    // y se enviaría un email con el token de restablecimiento
    console.log(`[MOCK] Enviando email de recuperación a: ${email}`);
    console.log(`[MOCK] Token de prueba: mock-reset-token-${Date.now()}`);

    return NextResponse.json({
      success: true,
      message: 'Si su correo está registrado, recibirá un enlace para restablecer su contraseña.',
    });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor. Intente nuevamente.' 
      },
      { status: 500 }
    );
  }
}