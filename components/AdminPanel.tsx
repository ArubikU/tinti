import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/language';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Eye,
    Filter,
    Shield,
    Trash2,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Report {
  id: string;
  project_id: string;
  project_title: string;
  reporter_email: string;
  project_owner_email: string;
  report_type: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_notes: string;
  created_at: string;
  updated_at: string;
  resolved_at: string;
  resolved_by_email: string;
}

interface AdminPanelProps {
  adminKey: string;
  adminSecret: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  dismissed: 'bg-gray-100 text-gray-800',
};

const statusIcons = {
  pending: Clock,
  reviewed: Eye,
  resolved: CheckCircle,
  dismissed: XCircle,
};

export function AdminPanel({ adminKey, adminSecret }: AdminPanelProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionType, setActionType] = useState<'update' | 'delete_project'>('update');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 20,
  });
  const { t } = useLanguage();

  useEffect(() => {
    fetchReports();
  }, [statusFilter, typeFilter, pagination.page]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }

      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) throw new Error('Failed to fetch reports');

      const data = await response.json();
      setReports(data.reports);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: t('admin.error.fetchReports'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (report: Report, action: 'update' | 'delete_project', newStatus?: string) => {
    try {
      const body: any = { action };
      
      if (newStatus) {
        body.status = newStatus;
      }
      
      if (adminNotes.trim()) {
        body.adminNotes = adminNotes.trim();
      }

      const response = await fetch(`/api/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to update report');

      const data = await response.json();
      
      if (action === 'delete_project') {
        toast({
          title: t('admin.success.projectDeleted'),
          description: t('admin.success.reportResolved'),
        });
      } else {
        toast({
          title: t('admin.success.reportUpdated'),
        });
      }

      setActionDialogOpen(false);
      setSelectedReport(null);
      setAdminNotes('');
      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: t('admin.error.updateReport'),
        variant: 'destructive',
      });
    }
  };

  const openActionDialog = (report: Report, action: 'update' | 'delete_project') => {
    setSelectedReport(report);
    setActionType(action);
    setAdminNotes(report.admin_notes || '');
    setActionDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const Icon = statusIcons[status as keyof typeof statusIcons];
    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        <Icon className="h-3 w-3 mr-1" />
        {t(`admin.status.${status}`)}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      inappropriate: 'bg-red-100 text-red-800',
      spam: 'bg-orange-100 text-orange-800',
      duplicate: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={colors[type as keyof typeof colors]}>
        {t(`reports.types.${type}`)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold">{t('admin.title')}</h1>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('admin.filters.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="space-y-2">
            <Label>{t('admin.filters.status')}</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.filters.all')}</SelectItem>
                <SelectItem value="pending">{t('admin.status.pending')}</SelectItem>
                <SelectItem value="reviewed">{t('admin.status.reviewed')}</SelectItem>
                <SelectItem value="resolved">{t('admin.status.resolved')}</SelectItem>
                <SelectItem value="dismissed">{t('admin.status.dismissed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('admin.filters.type')}</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.filters.all')}</SelectItem>
                <SelectItem value="inappropriate">{t('reports.types.inappropriate')}</SelectItem>
                <SelectItem value="spam">{t('reports.types.spam')}</SelectItem>
                <SelectItem value="duplicate">{t('reports.types.duplicate')}</SelectItem>
                <SelectItem value="other">{t('reports.types.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de reportes */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('admin.reports.title')} ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t('common.loading')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.table.project')}</TableHead>
                    <TableHead>{t('admin.table.type')}</TableHead>
                    <TableHead>{t('admin.table.status')}</TableHead>
                    <TableHead>{t('admin.table.reporter')}</TableHead>
                    <TableHead>{t('admin.table.date')}</TableHead>
                    <TableHead>{t('admin.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{report.project_title}</p>
                          <p className="text-sm text-gray-500">{report.project_owner_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(report.report_type)}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>{report.reporter_email}</TableCell>
                      <TableCell>
                        {new Date(report.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openActionDialog(report, 'update')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {t('admin.actions.review')}
                          </Button>
                          {report.status === 'pending' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openActionDialog(report, 'delete_project')}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {t('admin.actions.deleteProject')}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    {t('common.previous')}
                  </Button>
                  <span className="flex items-center px-4">
                    {t('common.pageOf', { page: pagination.page.toString(), total: pagination.totalPages.toString() })}
                  </span>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de acciones */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'delete_project' ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  {t('admin.dialog.deleteProject.title')}
                </>
              ) : (
                <>
                  <Eye className="h-5 w-5" />
                  {t('admin.dialog.review.title')}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedReport && (
                <div className="space-y-3 mt-4">
                  <div>
                    <strong>{t('admin.dialog.project')}:</strong> {selectedReport.project_title}
                  </div>
                  <div>
                    <strong>{t('admin.dialog.type')}:</strong> {getTypeBadge(selectedReport.report_type)}
                  </div>
                  <div>
                    <strong>{t('admin.dialog.reporter')}:</strong> {selectedReport.reporter_email}
                  </div>
                  {selectedReport.description && (
                    <div>
                      <strong>{t('admin.dialog.description')}:</strong>
                      <p className="mt-1 p-2 bg-gray-50 rounded text-sm">
                        {selectedReport.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="adminNotes">{t('admin.dialog.notes')}</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={t('admin.dialog.notesPlaceholder')}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            
            {actionType === 'delete_project' ? (
              <Button
                variant="destructive"
                onClick={() => selectedReport && handleAction(selectedReport, 'delete_project')}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('admin.actions.confirmDelete')}
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => selectedReport && handleAction(selectedReport, 'update', 'dismissed')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t('admin.actions.dismiss')}
                </Button>
                <Button
                  onClick={() => selectedReport && handleAction(selectedReport, 'update', 'resolved')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('admin.actions.resolve')}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
