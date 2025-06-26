import { verifyToken } from '@/lib/auth';
import { sql } from '@/lib/database';
import { NextRequest, NextResponse } from 'next/server';

async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const [user] = await sql`
    SELECT id, username, email FROM users WHERE id = ${payload.userId}
  `;

  return user || null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminKey, adminSecret } = body;

    // Verificar las credenciales contra las variables de entorno
    const validKey = process.env.ADMIN_PANEL_KEY;
    const validSecret = process.env.ADMIN_PANEL_SECRET;

    if (!validKey || !validSecret) {
      console.error('Admin panel credentials not configured in environment variables');
      return NextResponse.json({ error: 'Admin panel not configured' }, { status: 500 });
    }

    if (adminKey !== validKey || adminSecret !== validSecret) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Obtener el usuario actual después de verificar las credenciales de admin
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Verificar si el usuario ya existe en la tabla admin_users
    const [existingAdmin] = await sql`
      SELECT id, role FROM admin_users WHERE user_id = ${currentUser.id}
    `;

    if (!existingAdmin) {
      // Crear el registro en admin_users si no existe
      await sql`
        INSERT INTO admin_users (user_id, role, created_at)
        VALUES (${currentUser.id}, 'admin', NOW())
      `;
      console.log(`User ${currentUser.email} added to admin_users table`);
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Authentication successful',
      user: {
        id: currentUser.id,
        email: currentUser.email,
        username: currentUser.username
      }
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
