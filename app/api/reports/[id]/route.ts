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

async function isAdmin(userId: string) {
  const [admin] = await sql`
    SELECT role FROM admin_users WHERE user_id = ${userId}
  `;
  return admin?.role;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminRole = await isAdmin(currentUser.id);
    if (!adminRole) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reportId = params.id;
    const body = await request.json();
    const { status, adminNotes, action } = body;

    // Validar estado
    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Si la acción es eliminar proyecto
    if (action === 'delete_project') {
      // Obtener información del reporte
      const [report] = await sql`
        SELECT project_id FROM project_reports WHERE id = ${reportId}
      `;

      if (!report) {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }

      // Eliminar el proyecto
      await sql`
        DELETE FROM projects WHERE id = ${report.project_id}
      `;

      // Actualizar el reporte como resuelto
      const [updatedReport] = await sql`
        UPDATE project_reports
        SET 
          status = 'resolved',
          admin_notes = ${adminNotes || 'Project deleted by admin'},
          resolved_by = ${currentUser.id},
          resolved_at = NOW(),
          updated_at = NOW()
        WHERE id = ${reportId}
        RETURNING *
      `;

      return NextResponse.json({
        success: true,
        report: updatedReport,
        action: 'project_deleted'
      });
    }

    // Actualizar el reporte normalmente
    const updateFields: any = {
      updated_at: new Date().toISOString()
    };

    if (status) {
      updateFields.status = status;
      if (status === 'resolved' || status === 'dismissed') {
        updateFields.resolved_by = currentUser.id;
        updateFields.resolved_at = new Date().toISOString();
      }
    }

    if (adminNotes !== undefined) {
      updateFields.admin_notes = adminNotes;
    }

    const [updatedReport] = await sql`
      UPDATE project_reports
      SET 
        status = ${updateFields.status || sql`status`},
        admin_notes = ${updateFields.admin_notes || sql`admin_notes`},
        resolved_by = ${updateFields.resolved_by || sql`resolved_by`},
        resolved_at = ${updateFields.resolved_at || sql`resolved_at`},
        updated_at = NOW()
      WHERE id = ${reportId}
      RETURNING *
    `;

    if (!updatedReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      report: updatedReport
    });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminRole = await isAdmin(currentUser.id);
    if (adminRole !== 'admin' && adminRole !== 'super_admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const reportId = params.id;

    const [deletedReport] = await sql`
      DELETE FROM project_reports WHERE id = ${reportId}
      RETURNING *
    `;

    if (!deletedReport) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
