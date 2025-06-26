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
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, reportType, description } = body;

    // Validar datos de entrada
    if (!projectId || !reportType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validReportTypes = ['inappropriate', 'spam', 'duplicate', 'other'];
    if (!validReportTypes.includes(reportType)) {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // Verificar que el proyecto existe y es público
    const [project] = await sql`
      SELECT id, owner_id, is_public FROM projects WHERE id = ${projectId}
    `;

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!project.is_public) {
      return NextResponse.json({ error: 'Cannot report private projects' }, { status: 400 });
    }

    // Verificar que el usuario no esté reportando su propio proyecto
    if (project.owner_id === currentUser.id) {
      return NextResponse.json({ error: 'Cannot report your own project' }, { status: 400 });
    }

    // Verificar si el usuario ya ha reportado este proyecto
    const [existingReport] = await sql`
      SELECT id FROM project_reports 
      WHERE project_id = ${projectId} 
      AND reporter_user_id = ${currentUser.id} 
      AND status != 'dismissed'
    `;

    if (existingReport) {
      return NextResponse.json({ error: 'You have already reported this project' }, { status: 400 });
    }

    // Crear el reporte
    const [result] = await sql`
      INSERT INTO project_reports (project_id, reporter_user_id, report_type, description)
      VALUES (${projectId}, ${currentUser.id}, ${reportType}, ${description || null})
      RETURNING id, created_at
    `;

    return NextResponse.json({
      success: true,
      reportId: result.id,
      createdAt: result.created_at,
    });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar si el usuario es administrador
    const [admin] = await sql`
      SELECT role FROM admin_users WHERE user_id = ${currentUser.id}
    `;

    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const reportType = searchParams.get('type');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Construir la consulta dinámicamente
    let whereClause = '';
    const filters: any[] = [];

    if (status) {
      whereClause += whereClause ? ' AND pr.status = ' : ' WHERE pr.status = ';
      filters.push(status);
    }

    if (reportType) {
      whereClause += whereClause ? ' AND pr.report_type = ' : ' WHERE pr.report_type = ';
      filters.push(reportType);
    }

    const reports = await sql`
      SELECT 
        pr.*,
        p.title as project_title,
        p.owner_id as project_owner_id,
        u1.email as reporter_email,
        u2.email as project_owner_email,
        u3.email as resolved_by_email
      FROM project_reports pr
      LEFT JOIN projects p ON pr.project_id = p.id
      LEFT JOIN users u1 ON pr.reporter_user_id = u1.id
      LEFT JOIN users u2 ON p.owner_id = u2.id
      LEFT JOIN users u3 ON pr.resolved_by = u3.id
      ${status ? sql`WHERE pr.status = ${status}` : sql``}
      ${reportType && status ? sql`AND pr.report_type = ${reportType}` : 
        reportType && !status ? sql`WHERE pr.report_type = ${reportType}` : sql``}
      ORDER BY pr.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Obtener el total de reportes para paginación
    const [{ count }] = await sql`
      SELECT COUNT(*) as count FROM project_reports pr
      ${status ? sql`WHERE pr.status = ${status}` : sql``}
      ${reportType && status ? sql`AND pr.report_type = ${reportType}` : 
        reportType && !status ? sql`WHERE pr.report_type = ${reportType}` : sql``}
    `;

    return NextResponse.json({
      reports,
      total: parseInt(count),
      page,
      limit,
      totalPages: Math.ceil(parseInt(count) / limit),
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
