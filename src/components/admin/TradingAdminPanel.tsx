import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Currency } from '@/types/trading';
import { toast } from 'sonner';
import SuperUserManager from './SuperUserManager';
import PricingAdjustmentPanel from './PricingAdjustmentPanel';
import { RefreshCw, AlertTriangle } from 'lucide-react';

const TradingAdminPanel = () => {
  const { user } = useAuth();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isAdmin = user?.email?.endsWith('@liquidcurrent.com');

  useEffect(() => {
    if (isAdmin) {
      loadCurrencies();
    }
  }, [isAdmin]);

  const loadCurrencies = async () => {
    try {
      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true })
        .order('code', { ascending: true });

      if (error) throw error;
      setCurrencies(data || []);
    } catch (error) {
      console.error('Error loading currencies:', error);
      toast.error('Failed to load currencies');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access trading administration.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trading Administration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trading Administration</h2>
          <p className="text-gray-600">Manage pricing, SuperUsers, and trading settings</p>
        </div>
      </div>

      <Tabs defaultValue="pricing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pricing">Pricing & Rates</TabsTrigger>
          <TabsTrigger value="superusers">SuperUser Management</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-0">
          <PricingAdjustmentPanel />
        </TabsContent>

        <TabsContent value="superusers" className="space-y-0">
          <SuperUserManager currencies={currencies} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradingAdminPanel;