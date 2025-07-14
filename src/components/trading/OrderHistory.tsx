import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OTCOrder, Currency } from '@/types/trading';
import { Eye, Download } from 'lucide-react';

interface OrderHistoryProps {
  orders: OTCOrder[];
  currencies: Currency[];
}

const OrderHistory = ({ orders, currencies }: OrderHistoryProps) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
      case 'payment_pending':
        return 'secondary';
      case 'processing':
      case 'payment_confirmed':
        return 'outline';
      case 'cancelled':
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencyData = currencies.find(c => c.code === currency);
    const decimals = currencyData?.decimals || 2;
    return `${amount.toFixed(decimals)} ${currency}`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'payment_pending':
        return 'Payment Pending';
      case 'payment_confirmed':
        return 'Payment Confirmed';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Your trading order history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No orders found</p>
            <p className="text-sm text-gray-400 mt-2">
              Your completed trades will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>
          View all your trading orders and their current status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.order_type === 'buy' ? 'default' : 'secondary'}>
                      {order.order_type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(order.from_amount, order.from_currency)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(order.net_amount, order.to_currency)}
                  </TableCell>
                  <TableCell>
                    {order.exchange_rate.toFixed(8)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(order.total_fee, order.to_currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Navigate to order details
                          window.location.href = `/trade/order/${order.id}`;
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Download receipt/invoice
                            toast.info('Receipt download feature coming soon');
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderHistory;