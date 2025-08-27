import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import KycAdmin from '@/components/KycAdmin';
import TradingAdminPanel from '@/components/admin/TradingAdminPanel';
import WalletBankApprovalPanel from '@/components/admin/WalletBankApprovalPanel';
import CompliancePanel from '@/components/admin/CompliancePanel';
import TradingLimitsManager from '@/components/admin/TradingLimitsManager';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Currency } from '@/types/trading';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  Shield, 
  FileCheck, 
  Wallet, 
  Users, 
  UserCheck, 
  Settings,
  BarChart3,
  Activity,
  ChevronRight,
  Crown
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    first_name?: string;
    surname?: string;
  };
  created_at: string;
  last_sign_in_at: string | null;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
}

const AdminDashboard = () => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.email?.endsWith('@liquidcurrent.com');
  const [users, setUsers] = useState<User[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [activeTab, setActiveTab] = useState('trading');

  const sidebarItems: SidebarItem[] = [
    {
      id: 'trading',
      label: 'Trading Admin',
      icon: TrendingUp,
      description: 'Manage pricing, rates & SuperUsers',
      badge: 'Core'
    },
    {
      id: 'limits',
      label: 'Trading Limits',
      icon: BarChart3,
      description: 'Set user trading limits & monitor usage'
    },
    {
      id: 'compliance',
      label: 'Compliance',
      icon: Shield,
      description: 'Audit logs, reports & notifications'
    },
    {
      id: 'approvals',
      label: 'Wallet & Bank',
      icon: Wallet,
      description: 'Approve wallets & bank accounts'
    },
    {
      id: 'kyc',
      label: 'KYC Management',
      icon: FileCheck,
      description: 'Review & approve KYC submissions'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      description: 'Manage registered users'
    }
  ];

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (!isAdmin) {
        toast.error('You do not have permission to access this page');
        navigate('/');
      } else {
        fetchUsers();
        loadCurrencies();
      }
    }
  }, [user, loading, isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      // Get the latest session to ensure we have a valid token
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('Failed to get session');
      }
      
      if (!currentSession?.access_token) {
        throw new Error('No valid session found');
      }

      setIsLoadingUsers(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/list-users`,
        {
          headers: {
            Authorization: `Bearer ${currentSession.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Authentication required');
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

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
      setCurrencies([]);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Get the latest session to ensure we have a valid token
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !currentSession?.access_token) {
        toast.error('Authentication required');
        return;
      }

      setIsDeleting(true);
      const deleteToast = toast.loading('Deleting user and associated data...');
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user?id=${selectedUser.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${currentSession.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }

      toast.dismiss(deleteToast);
      toast.success('User deleted successfully');
      
      // Refresh users list
      fetchUsers();
      setShowDeleteDialog(false);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.dismiss(deleteToast);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
      setSelectedUser(null);
    }
  };

  const getUserFullName = (user: User) => {
    const firstName = user.user_metadata?.first_name || '';
    const surname = user.user_metadata?.surname || '';
    return firstName || surname ? `${firstName} ${surname}`.trim() : 'N/A';
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'trading':
        return <TradingAdminPanel />;
      case 'limits':
        return <TradingLimitsManager currencies={currencies} />;
      case 'compliance':
        return <CompliancePanel />;
      case 'approvals':
        return <WalletBankApprovalPanel />;
      case 'kyc':
        return <KycAdmin />;
      case 'users':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Registered Users</h2>
                  <p className="text-gray-600 mt-1">Manage and monitor user accounts</p>
                </div>
                <Button
                  variant="outline"
                  onClick={fetchUsers}
                  disabled={isLoadingUsers}
                  className="flex items-center gap-2 bg-white hover:bg-blue-50"
                >
                  <Activity className="h-4 w-4" />
                  {isLoadingUsers ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Created At</TableHead>
                      <TableHead className="font-semibold">Last Sign In</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingUsers ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex items-center justify-center gap-2">
                            <Activity className="h-4 w-4 animate-spin" />
                            Loading users...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-blue-50">
                          <TableCell className="font-medium">{getUserFullName(user)}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {user.last_sign_in_at 
                              ? new Date(user.last_sign_in_at).toLocaleDateString()
                              : 'Never'
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDeleteDialog(true);
                              }}
                              disabled={user.email.endsWith('@liquidcurrent.com')}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        );
      default:
        return <TradingAdminPanel />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col admin-content-bg">
      <Header />
      {isAdmin && (
        <div className="flex-1 flex">
          {/* Left Sidebar */}
          <div className="w-80 admin-sidebar border-r border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Admin Portal</h1>
                  <p className="text-sm text-blue-100">System Management</p>
                </div>
              </div>
            </div>
            
            <nav className="p-4 space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      isActive 
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white" 
                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.label}</span>
                        {item.badge && (
                          <span className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded-full",
                            isActive 
                              ? "bg-blue-100 text-blue-700" 
                              : "bg-gray-100 text-gray-600"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs truncate mt-0.5",
                        isActive ? "text-blue-600" : "text-gray-500"
                      )}>
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-all duration-200",
                      isActive 
                        ? "text-blue-600 rotate-90" 
                        : "text-gray-400 group-hover:text-gray-600"
                    )} />
                  </button>
                );
              })}
            </nav>

            {/* Admin Info Footer */}
            <div className="absolute bottom-0 left-0 right-0 w-80 p-4 border-t border-gray-200 bg-gradient-to-r from-yellow-50 to-amber-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-lg">
                  <Crown className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto">
            <div className="p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      )}
      <Footer />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gradient-to-br from-white to-gray-50">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action will:
              <ul className="list-disc list-inside mt-2">
                <li>Delete the user account</li>
                <li>Remove all KYC submissions</li>
                <li>Delete all uploaded documents</li>
                <li>Remove all trading quotes and orders</li>
              </ul>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;