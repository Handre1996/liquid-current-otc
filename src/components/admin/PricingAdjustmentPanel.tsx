import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { priceService } from '@/services/priceService';
import { ExchangeRate, AdminSettings } from '@/types/trading';
import { toast } from 'sonner';
import { 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  DollarSign,
  Percent,
  Save,
  AlertTriangle
} from 'lucide-react';

const PricingAdjustmentPanel =  () => {
  const { user } = useAuth();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ExchangeRate | null>(null);
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);

  // Fee settings state
  const [feeSettings, setFeeSettings] = useState({
    default_buy_markup: '0.02',
    default_sell_markup: '0.02',
    admin_fee_percentage: '0.005',
    withdrawal_fee_zar: '50',
    withdrawal_fee_nad: '50',
  });

  // Rate adjustment state
  const [rateAdjustment, setRateAdjustment] = useState({
    buy_markup_adjustment: '0',
    sell_markup_adjustment: '0',
    base_rate_adjustment: '0'
  });

  const isAdmin = user?.email?.endsWith('@liquidcurrent.com');

  useEffect(() => {
    if (isAdmin) {
      loadPricingData();
    }
  }, [isAdmin]);

  const loadPricingData = async () => {
    setLoading(true);
    try {
      const [rates, settings] = await Promise.all([
        loadExchangeRates(),
        loadAdminSettings()
      ]);

      setExchangeRates(rates);
      setAdminSettings(settings);

      // Populate fee settings from admin settings
      const settingsMap = new Map(settings.map(s => [s.setting_key, s.setting_value]));
      setFeeSettings({
        default_buy_markup: settingsMap.get('default_buy_markup') || '0.02',
        default_sell_markup: settingsMap.get('default_sell_markup') || '0.02',
        admin_fee_percentage: settingsMap.get('admin_fee_percentage') || '0.005',
        withdrawal_fee_zar: settingsMap.get('withdrawal_fee_zar') || '50',
        withdrawal_fee_nad: settingsMap.get('withdrawal_fee_nad') || '50',
      });

    } catch (error) {
      console.error('Error loading pricing data:', error);
      toast.error('Failed to load pricing data');
    } finally {
      setLoading(false);
    }
  };

  const loadExchangeRates = async (): Promise<ExchangeRate[]> => {
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('from_currency', { ascending: true })
        .order('to_currency', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading exchange rates:', error);
      return [];
    }
  };

  const loadAdminSettings = async (): Promise<AdminSettings[]> => {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('setting_key', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading admin settings:', error);
      return [];
    }
  };

  const updateFeeSettings = async () => {
    setUpdating(true);
    try {
      const updates = Object.entries(feeSettings).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('admin_settings')
        .upsert(updates, { onConflict: 'setting_key' });

      if (error) throw error;

      toast.success('Fee settings updated successfully');
      await loadPricingData();
    } catch (error) {
      console.error('Error updating fee settings:', error);
      toast.error('Failed to update fee settings');
    } finally {
      setUpdating(false);
    }
  };

  const adjustExchangeRate = async () => {
    if (!selectedRate) return;

    setUpdating(true);
    try {
      const buyAdjustment = parseFloat(rateAdjustment.buy_markup_adjustment) / 100;
      const sellAdjustment = parseFloat(rateAdjustment.sell_markup_adjustment) / 100;
      const baseAdjustment = parseFloat(rateAdjustment.base_rate_adjustment) / 100;

      const newBuyMarkup = selectedRate.buy_markup + buyAdjustment;
      const newSellMarkup = selectedRate.sell_markup + sellAdjustment;
      const newBaseRate = selectedRate.base_rate * (1 + baseAdjustment);

      const newFinalBuyRate = newBaseRate * (1 + newBuyMarkup);
      const newFinalSellRate = newBaseRate * (1 - newSellMarkup);

      const { error } = await supabase
        .from('exchange_rates')
        .update({
          buy_markup: newBuyMarkup,
          sell_markup: newSellMarkup,
          base_rate: newBaseRate,
          final_buy_rate: newFinalBuyRate,
          final_sell_rate: newFinalSellRate,
          last_updated: new Date().toISOString()
        })
        .eq('id', selectedRate.id);

      if (error) throw error;

      toast.success('Exchange rate adjusted successfully');
      setShowAdjustDialog(false);
      setSelectedRate(null);
      setRateAdjustment({
        buy_markup_adjustment: '0',
        sell_markup_adjustment: '0',
        base_rate_adjustment: '0'
      });
      await loadPricingData();
    } catch (error) {
      console.error('Error adjusting exchange rate:', error);
      toast.error('Failed to adjust exchange rate');
    } finally {
      setUpdating(false);
    }
  };

  const refreshAllRates = async () => {
    setUpdating(true);
    try {
      await priceService.updateExchangeRates();
      toast.success('All exchange rates refreshed from market data');
      await loadPricingData();
    } catch (error) {
      console.error('Error refreshing rates:', error);
      toast.error('Failed to refresh exchange rates');
    } finally {
      setUpdating(false);
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toFixed(8)} ${currency}`;
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access pricing controls.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manual Pricing Adjustment</CardTitle>
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Manual Pricing Adjustment
              </CardTitle>
              <CardDescription>
                Adjust fees, markups, and exchange rates that customers see
              </CardDescription>
            </div>
            <Button
              onClick={refreshAllRates}
              disabled={updating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} />
              Refresh Market Rates
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fee Settings Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fee Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buy_markup">Default Buy Markup (%)</Label>
                <Input
                  id="buy_markup"
                  type="number"
                  step="0.001"
                  value={(parseFloat(feeSettings.default_buy_markup) * 100).toString()}
                  onChange={(e) => setFeeSettings(prev => ({
                    ...prev,
                    default_buy_markup: (parseFloat(e.target.value) / 100).toString()
                  }))}
                  placeholder="2.0"
                />
                <p className="text-xs text-gray-500">
                  Current: {formatPercentage(parseFloat(feeSettings.default_buy_markup))}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sell_markup">Default Sell Markup (%)</Label>
                <Input
                  id="sell_markup"
                  type="number"
                  step="0.001"
                  value={(parseFloat(feeSettings.default_sell_markup) * 100).toString()}
                  onChange={(e) => setFeeSettings(prev => ({
                    ...prev,
                    default_sell_markup: (parseFloat(e.target.value) / 100).toString()
                  }))}
                  placeholder="2.0"
                />
                <p className="text-xs text-gray-500">
                  Current: {formatPercentage(parseFloat(feeSettings.default_sell_markup))}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_fee">Admin Fee (%)</Label>
                <Input
                  id="admin_fee"
                  type="number"
                  step="0.001"
                  value={(parseFloat(feeSettings.admin_fee_percentage) * 100).toString()}
                  onChange={(e) => setFeeSettings(prev => ({
                    ...prev,
                    admin_fee_percentage: (parseFloat(e.target.value) / 100).toString()
                  }))}
                  placeholder="0.5"
                />
                <p className="text-xs text-gray-500">
                  Current: {formatPercentage(parseFloat(feeSettings.admin_fee_percentage))}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdrawal_fee_zar">ZAR Withdrawal Fee</Label>
                <Input
                  id="withdrawal_fee_zar"
                  type="number"
                  value={feeSettings.withdrawal_fee_zar}
                  onChange={(e) => setFeeSettings(prev => ({
                    ...prev,
                    withdrawal_fee_zar: e.target.value
                  }))}
                  placeholder="50"
                />
                <p className="text-xs text-gray-500">
                  Fixed fee in ZAR
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdrawal_fee_nad">NAD Withdrawal Fee</Label>
                <Input
                  id="withdrawal_fee_nad"
                  type="number"
                  value={feeSettings.withdrawal_fee_nad}
                  onChange={(e) => setFeeSettings(prev => ({
                    ...prev,
                    withdrawal_fee_nad: e.target.value
                  }))}
                  placeholder="50"
                />
                <p className="text-xs text-gray-500">
                  Fixed fee in NAD
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                onClick={updateFeeSettings}
                disabled={updating}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {updating ? 'Saving...' : 'Save Fee Settings'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Exchange Rates Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Exchange Rate Adjustments
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              These are the current exchange rates that customers see. You can adjust individual rates or refresh all from market data.
            </p>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency Pair</TableHead>
                    <TableHead>Base Rate</TableHead>
                    <TableHead>Buy Markup</TableHead>
                    <TableHead>Sell Markup</TableHead>
                    <TableHead>Customer Buy Rate</TableHead>
                    <TableHead>Customer Sell Rate</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exchangeRates.slice(0, 20).map((rate) => (
                    <TableRow key={rate.id}>
                      <TableCell className="font-medium">
                        {rate.from_currency} → {rate.to_currency}
                      </TableCell>
                      <TableCell>
                        {rate.base_rate.toFixed(8)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {formatPercentage(rate.buy_markup)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-red-600">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          {formatPercentage(rate.sell_markup)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {rate.final_buy_rate.toFixed(8)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {rate.final_sell_rate.toFixed(8)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(rate.last_updated).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRate(rate);
                            setShowAdjustDialog(true);
                          }}
                        >
                          Adjust
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {exchangeRates.length > 20 && (
              <p className="text-sm text-gray-500 mt-2">
                Showing first 20 of {exchangeRates.length} exchange rates
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rate Adjustment Dialog */}
      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adjust Exchange Rate</DialogTitle>
            <DialogDescription>
              Make manual adjustments to the exchange rate for {selectedRate?.from_currency} → {selectedRate?.to_currency}
            </DialogDescription>
          </DialogHeader>

          {selectedRate && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Current Rates</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Base Rate:</strong> {selectedRate.base_rate.toFixed(8)}</p>
                    <p><strong>Buy Markup:</strong> {formatPercentage(selectedRate.buy_markup)}</p>
                    <p><strong>Sell Markup:</strong> {formatPercentage(selectedRate.sell_markup)}</p>
                  </div>
                  <div>
                    <p><strong>Customer Buy Rate:</strong> {selectedRate.final_buy_rate.toFixed(8)}</p>
                    <p><strong>Customer Sell Rate:</strong> {selectedRate.final_sell_rate.toFixed(8)}</p>
                    <p><strong>Last Updated:</strong> {new Date(selectedRate.last_updated).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="base_rate_adjustment">Base Rate Adjustment (%)</Label>
                  <Input
                    id="base_rate_adjustment"
                    type="number"
                    step="0.1"
                    value={rateAdjustment.base_rate_adjustment}
                    onChange={(e) => setRateAdjustment(prev => ({
                      ...prev,
                      base_rate_adjustment: e.target.value
                    }))}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">
                    Positive values increase the base rate, negative values decrease it
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buy_markup_adjustment">Buy Markup Adjustment (%)</Label>
                  <Input
                    id="buy_markup_adjustment"
                    type="number"
                    step="0.01"
                    value={rateAdjustment.buy_markup_adjustment}
                    onChange={(e) => setRateAdjustment(prev => ({
                      ...prev,
                      buy_markup_adjustment: e.target.value
                    }))}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">
                    Additional markup on buy orders (added to current markup)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sell_markup_adjustment">Sell Markup Adjustment (%)</Label>
                  <Input
                    id="sell_markup_adjustment"
                    type="number"
                    step="0.01"
                    value={rateAdjustment.sell_markup_adjustment}
                    onChange={(e) => setRateAdjustment(prev => ({
                      ...prev,
                      sell_markup_adjustment: e.target.value
                    }))}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">
                    Additional markup on sell orders (added to current markup)
                  </p>
                </div>
              </div>

              {/* Preview of new rates */}
              {(rateAdjustment.base_rate_adjustment !== '0' || 
                rateAdjustment.buy_markup_adjustment !== '0' || 
                rateAdjustment.sell_markup_adjustment !== '0') && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-2 text-blue-800">Preview New Rates</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>New Base Rate:</strong> {(selectedRate.base_rate * (1 + parseFloat(rateAdjustment.base_rate_adjustment || '0') / 100)).toFixed(8)}</p>
                      <p><strong>New Buy Markup:</strong> {formatPercentage(selectedRate.buy_markup + parseFloat(rateAdjustment.buy_markup_adjustment || '0') / 100)}</p>
                      <p><strong>New Sell Markup:</strong> {formatPercentage(selectedRate.sell_markup + parseFloat(rateAdjustment.sell_markup_adjustment || '0') / 100)}</p>
                    </div>
                    <div>
                      <p><strong>New Customer Buy Rate:</strong> {(selectedRate.base_rate * (1 + parseFloat(rateAdjustment.base_rate_adjustment || '0') / 100) * (1 + selectedRate.buy_markup + parseFloat(rateAdjustment.buy_markup_adjustment || '0') / 100)).toFixed(8)}</p>
                      <p><strong>New Customer Sell Rate:</strong> {(selectedRate.base_rate * (1 + parseFloat(rateAdjustment.base_rate_adjustment || '0') / 100) * (1 - selectedRate.sell_markup - parseFloat(rateAdjustment.sell_markup_adjustment || '0') / 100)).toFixed(8)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAdjustDialog(false);
                setRateAdjustment({
                  buy_markup_adjustment: '0',
                  sell_markup_adjustment: '0',
                  base_rate_adjustment: '0'
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={adjustExchangeRate}
              disabled={updating}
            >
              {updating ? 'Applying...' : 'Apply Adjustment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingAdjustmentPanel;