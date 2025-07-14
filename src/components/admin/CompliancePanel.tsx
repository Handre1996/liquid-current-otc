import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Shield, 
  FileText, 
  Download, 
  AlertTriangle, 
  Activity,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

interface AuditLog {
  id: string;
  user_id: string;
  action_type: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface ComplianceReport {
  id: string;
  report_type: string;
  report_period_start: string;
  report_period_end: string;
  generated_by: string;
  file_path: string;
  status: string;
  metadata: any;
  created_at: string;
  completed_at: string;
}

interface SystemNotification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  severity: string;
  related_table: string;
  related_id: string;
  is_read: boolean;
  created_by: string;
  created_at: string;
}

const CompliancePanel = () => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [generating, setGenerating] = useState(false);

  const isAdmin = user?.email?.endsWith('@liquidcurrent.com');

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAuditLogs(),
        loadComplianceReports(),
        loadNotifications()
      ]);
    } catch (error) {
      console.error('Error loading compliance data:', error);
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    }
  };

  const loadComplianceReports = async () => {
    try {
      const { data, error } = await supabase
        .from('compliance_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplianceReports(data || []);
    } catch (error) {
      console.error('Error loading compliance reports:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const generateComplianceReport = async (reportType: string, startDate: string, endDate: string) => {
    if (!user) return;

    setGenerating(true);
    try {
      const { data, error } = await supabase
        .from('compliance_reports')
        .insert({
          report_type: reportType,
          report_period_start: startDate,
          report_period_end: endDate,
          generated_by: user.id,
          status: 'generating'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Compliance report generation started');
      await loadComplianceReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate compliance report');
    } finally {
      setGenerating(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('system_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, is_read: true }
          : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      info: 'default',
      warning: 'secondary',
      error: 'destructive',
      critical: 'destructive'
    };
    return variants[severity as keyof typeof variants] || 'default';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'generating':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const filteredLogs = auditLogs.filter(log => 
    log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access compliance controls.</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance & Audit</CardTitle>
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
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Compliance & Audit
          </h2>
          <p className="text-gray-600">Monitor system activity, generate compliance reports, and manage notifications</p>
        </div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80"
          />
          <Button onClick={loadData} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Logs Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {auditLogs.filter(log => 
                new Date(log.created_at).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              System activities logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {notifications.filter(n => !n.is_read).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {complianceReports.filter(r => r.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Generated this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {notifications.filter(n => n.severity === 'critical' && !n.is_read).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need immediate action
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audit-logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audit-logs">Audit Logs ({auditLogs.length})</TabsTrigger>
          <TabsTrigger value="reports">Compliance Reports ({complianceReports.length})</TabsTrigger>
          <TabsTrigger value="notifications">Notifications ({notifications.filter(n => !n.is_read).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="audit-logs">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Logs</CardTitle>
              <CardDescription>
                Track all system activities and user actions for compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No audit logs found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.slice(0, 50).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {new Date(log.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action_type}</Badge>
                          </TableCell>
                          <TableCell>{log.table_name || '-'}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.user_id ? log.user_id.slice(0, 8) + '...' : 'System'}
                          </TableCell>
                          <TableCell>{log.ip_address || '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLog(log);
                                setShowLogDialog(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Compliance Reports</CardTitle>
                  <CardDescription>
                    Generate and manage regulatory compliance reports
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Generate Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Compliance Report</DialogTitle>
                      <DialogDescription>
                        Create a new compliance report for regulatory purposes
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="report-type">Report Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kyc-summary">KYC Summary</SelectItem>
                            <SelectItem value="transaction-report">Transaction Report</SelectItem>
                            <SelectItem value="user-activity">User Activity</SelectItem>
                            <SelectItem value="suspicious-activity">Suspicious Activity</SelectItem>
                            <SelectItem value="audit-trail">Audit Trail</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start-date">Start Date</Label>
                          <Input
                            id="start-date"
                            type="date"
                            defaultValue={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end-date">End Date</Label>
                          <Input
                            id="end-date"
                            type="date"
                            defaultValue={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={() => generateComplianceReport('kyc-summary', '2024-01-01', '2024-12-31')}
                        disabled={generating}
                      >
                        {generating ? 'Generating...' : 'Generate Report'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {complianceReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No compliance reports generated</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Type</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Generated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complianceReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            {report.report_type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </TableCell>
                          <TableCell>
                            {new Date(report.report_period_start).toLocaleDateString()} - {new Date(report.report_period_end).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadge(report.status)}>
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(report.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {report.status === 'completed' && report.file_path && (
                              <Button variant="ghost\" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
              <CardDescription>
                Monitor system alerts and important notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications</p>
                  <p className="text-sm text-gray-400 mt-2">All systems operating normally</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 ${
                        notification.is_read ? 'bg-gray-50' : 'bg-white border-blue-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={getSeverityBadge(notification.severity)}>
                            {notification.severity}
                          </Badge>
                          <h3 className="font-semibold">{notification.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{notification.message}</p>
                      {notification.related_table && (
                        <div className="text-sm text-gray-500">
                          Related to: {notification.related_table}
                          {notification.related_id && ` (ID: ${notification.related_id.slice(0, 8)}...)`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Audit Log Detail Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Detailed information about this system activity
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Timestamp</Label>
                  <p>{new Date(selectedLog.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="font-medium">Action Type</Label>
                  <p>{selectedLog.action_type}</p>
                </div>
                <div>
                  <Label className="font-medium">Table</Label>
                  <p>{selectedLog.table_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="font-medium">Record ID</Label>
                  <p className="font-mono">{selectedLog.record_id || 'N/A'}</p>
                </div>
                <div>
                  <Label className="font-medium">User ID</Label>
                  <p className="font-mono">{selectedLog.user_id || 'System'}</p>
                </div>
                <div>
                  <Label className="font-medium">IP Address</Label>
                  <p>{selectedLog.ip_address || 'N/A'}</p>
                </div>
              </div>

              {selectedLog.user_agent && (
                <div>
                  <Label className="font-medium">User Agent</Label>
                  <p className="text-sm text-gray-600 break-all">{selectedLog.user_agent}</p>
                </div>
              )}

              {selectedLog.old_values && (
                <div>
                  <Label className="font-medium">Previous Values</Label>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <Label className="font-medium">New Values</Label>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowLogDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompliancePanel;