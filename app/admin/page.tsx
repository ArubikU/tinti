'use client';

import { AdminPanel } from '@/components/AdminPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/language';
import { Lock, Shield } from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Verificar si ya está autenticado en sessionStorage
    const savedAuth = sessionStorage.getItem('admin_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminKey,
          adminSecret,
        }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
        toast({
          title: t('admin.auth.success'),
          description: t('admin.auth.welcome'),
        });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: t('admin.auth.error'),
        description: t('admin.auth.invalidCredentials'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setAdminKey('');
    setAdminSecret('');
    toast({
      title: t('admin.auth.logout'),
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t('admin.auth.title')}</CardTitle>
            <p className="text-gray-600">{t('admin.auth.description')}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adminKey">{t('admin.auth.key')}</Label>
                <Input
                  id="adminKey"
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder={t('admin.auth.keyPlaceholder')}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminSecret">{t('admin.auth.secret')}</Label>
                <Input
                  id="adminSecret"
                  type="password"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  placeholder={t('admin.auth.secretPlaceholder')}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                <Lock className="h-4 w-4 mr-2" />
                {loading ? t('admin.auth.authenticating') : t('admin.auth.login')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">{t('admin.panel.title')}</h1>
          <Button variant="outline" onClick={handleLogout}>
            {t('admin.auth.logout')}
          </Button>
        </div>
      </div>
      
      <AdminPanel adminKey={adminKey} adminSecret={adminSecret} />
    </div>
  );
}
