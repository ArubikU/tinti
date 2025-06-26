import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/contexts/ToastContext';
import { useLanguage } from '@/lib/language';
import { AlertTriangle, Flag } from 'lucide-react';
import React, { useState } from 'react';
import { GlassButton } from './ui/GlassButton';

interface ReportProjectModalProps {
  projectId: string;
  projectTitle: string;
  currentUser?: any; // Usuario actual, null si no está logueado
}

const reportTypes = [
  { value: 'inappropriate', key: 'reports.types.inappropriate' },
  { value: 'spam', key: 'reports.types.spam' },
  { value: 'duplicate', key: 'reports.types.duplicate' },
  { value: 'other', key: 'reports.types.other' },
];

export function ReportProjectModal({ projectId, projectTitle, currentUser }: ReportProjectModalProps) {
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();
  const { success, error } = useToast();

  const handleOpenModal = () => {
    if (!currentUser) {
      error(
        'Acceso requerido',
        'Debes iniciar sesión para reportar un proyecto.'
      );
      return;
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      error(
        'Error de autenticación',
        'Debes iniciar sesión para reportar un proyecto.'
      );
      return;
    }
    
    if (!reportType) {
      error(
        t('reports.error.selectType') || 'Selecciona un tipo de reporte',
        'Por favor selecciona una categoría para tu reporte.'
      );
      return;
    }

    if (!projectId) {
      error(
        'Error',
        'ID del proyecto no válido.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          reportType,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Mostrar el mensaje de error específico del servidor
        const errorMessage = data.error || 'Error desconocido al enviar el reporte';
        throw new Error(errorMessage);
      }

      success(
        t('reports.success.title') || 'Reporte enviado',
        t('reports.success.description') || 'Tu reporte ha sido enviado exitosamente. Nuestro equipo lo revisará pronto.'
      );

      setOpen(false);
      setReportType('');
      setDescription('');
    } catch (err) {
      console.error('Error submitting report:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      error(
        'Error al enviar reporte',
        errorMessage
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <GlassButton variant="outline" size="sm" onClick={handleOpenModal}>
          <Flag className="h-4 w-4 mr-2" />
          {t('reports.button')}
        </GlassButton>
      </DialogTrigger>
      {currentUser && (
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              {t('reports.modal.title')}
            </DialogTitle>
            <DialogDescription>
              {t('reports.modal.description', { projectTitle })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">{t('reports.form.type')}</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('reports.form.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {t(type.key)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{t('reports.form.description')}</Label>
              <Textarea
                id="description"
                placeholder={t('reports.form.descriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('reports.submitting') : t('reports.submit')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
