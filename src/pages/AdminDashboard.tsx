import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import KycAdmin from '@/components/KycAdmin';
import TradingAdminPanel from '@/components/admin/TradingAdminPanel';
import QuoteManagementPanel from '@/components/admin/QuoteManagementPanel';
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

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    {
      id: 'trading',
      label: 'Trading Admin',
      icon: TrendingUp,
      description: 'Manage pricing, rates & SuperUsers',
      badge: 'Core'
    },
    {
      id: 'quotes',
      label: 'Quote Management',
      icon: Activity,
      description: 'Process user quotes & assign TXIDs'
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
    setSidebarOpen(false); // Close mobile sidebar when selecting item
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'trading':
        return <TradingAdminPanel />;
      case 'quotes':
        return <QuoteManagementPanel currencies={currencies} />;
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
          <div className="bg-blanc/90 dark:bg-navy/80 rounded-xl shadow-lg border border-navy/20 dark:border-foam/20 overflow-hidden">
            <div className="p-8 bg-gradient-to-br from-foam/30 to-ivory/50 dark:from-teal/20 dark:to-navy/30">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-navy dark:text-foam">Registered Users</h2>
                  <p className="font-body text-teal dark:text-foam/80 mt-1">Manage and monitor user accounts</p>
                </div>
                <Button
                  variant="outline"
                  onClick={fetchUsers}
                  disabled={isLoadingUsers}
                  className="flex items-center gap-2 bg-blanc/90 dark:bg-navy/90 border-navy/20 dark:border-foam/20 text-navy dark:text-foam hover:bg-navy/10 dark:hover:bg-foam/10 font-body"
                >
                  <Activity className="h-4 w-4" />
                  {isLoadingUsers ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
              <div className="border border-navy/20 dark:border-foam/20 rounded-lg overflow-hidden bg-blanc/90 dark:bg-navy/80 shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-foam/20 to-ivory/30 dark:from-teal/20 dark:to-navy/30 border-b border-navy/20 dark:border-foam/20">
                      <TableHead className="font-heading font-semibold text-navy dark:text-foam">Name</TableHead>
                      <TableHead className="font-heading font-semibold text-navy dark:text-foam">Email</TableHead>
                      <TableHead className="font-heading font-semibold text-navy dark:text-foam">Created At</TableHead>
                      <TableHead className="font-heading font-semibold text-navy dark:text-foam">Last Sign In</TableHead>
                      <TableHead className="text-right font-heading font-semibold text-navy dark:text-foam">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingUsers ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 font-body text-navy dark:text-foam">
                          <div className="flex items-center justify-center gap-2">
                            <Activity className="h-4 w-4 animate-spin" />
                            Loading users...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 font-body text-navy/50 dark:text-foam/50">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-navy/5 dark:hover:bg-foam/5 border-b border-navy/10 dark:border-foam/10">
                          <TableCell className="font-heading font-medium text-navy dark:text-foam">{getUserFullName(user)}</TableCell>
                          <TableCell className="font-body text-navy dark:text-foam">{user.email}</TableCell>
                          <TableCell className="font-body text-navy dark:text-foam">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-body text-navy dark:text-foam">
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
                              className="font-body"
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-ivory to-foam dark:from-navy dark:to-teal">
      <Header />
      {isAdmin && (
        <div className="flex-1 flex">
          {/* Mobile Menu Button */}
          <div className="lg:hidden fixed top-20 left-4 z-40">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              variant="outline"
              size="icon"
              className="bg-blanc/90 dark:bg-navy/90 border-navy/20 dark:border-foam/20 shadow-lg"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Left Sidebar */}
          <div className={cn(
            "fixed inset-y-0 left-0 z-30 w-80 bg-gradient-to-b from-blanc/80 to-foam/50 dark:from-navy/80 dark:to-teal/50 border-r border-navy/20 dark:border-foam/20 shadow-xl backdrop-blur-sm flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 top-16",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}>
            <div className="p-6 border-b border-navy/20 dark:border-foam/20 bg-gradient-to-r from-navy to-teal">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blanc/20 backdrop-blur-sm rounded-lg">
                    <Settings className="h-6 w-6 text-blanc" />
                  </div>
                  <div>
                    <h1 className="text-xl font-heading font-bold text-blanc">Admin Portal</h1>
                    <p className="text-sm font-body text-foam">System Management</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-blanc hover:bg-blanc/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <nav className="p-4 space-y-2 flex-1 overflow-y-auto pb-32">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group font-body",
                      isActive
                        ? "bg-gradient-to-r from-navy to-teal text-blanc border border-navy/30 shadow-sm"
                        : "text-navy dark:text-foam hover:bg-navy/10 dark:hover:bg-foam/10 hover:text-navy dark:hover:text-blanc"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-200",
                      isActive 
                        ? "bg-blanc/20 text-blanc" 
                        : "bg-navy/10 dark:bg-foam/10 text-navy dark:text-foam group-hover:bg-navy/20 dark:group-hover:bg-foam/20"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.label}</span>
                        {item.badge && (
                          <span className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded-full font-body",
                            isActive 
                              ? "bg-blanc/20 text-blanc" 
                              : "bg-navy/10 dark:bg-foam/10 text-navy dark:text-foam"
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs truncate mt-0.5 font-body",
                        isActive ? "text-foam" : "text-navy/70 dark:text-foam/70"
                      )}>
                        {item.description}
                      </p>
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 transition-all duration-200 font-body",
                      isActive 
                        ? "text-blanc rotate-90" 
                        : "text-navy/40 dark:text-foam/40 group-hover:text-navy/60 dark:group-hover:text-foam/60"
                    )} />
                  </button>
                );
              })}
            </nav>

            {/* Admin Info Footer */}
            <div className="mt-auto p-4 border-t border-navy/20 dark:border-foam/20 bg-gradient-to-r from-foam/20 to-ivory/30 dark:from-teal/20 dark:to-navy/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-navy to-teal rounded-lg">
                  <Crown className="h-4 w-4 text-blanc" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-heading font-medium text-navy dark:text-foam truncate">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs font-body text-navy/70 dark:text-foam/70">Administrator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-20 lg:hidden top-16"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto lg:ml-0">
            <div className="p-6 lg:p-8 lg:ml-80">
              {renderContent()}
            </div>
          </div>
        </div>
      )}
      <Footer />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gradient-to-br from-blanc to-foam/30 dark:from-navy to-teal/30 border border-navy/20 dark:border-foam/20">
          <DialogHeader>
            <DialogTitle className="font-heading text-navy dark:text-foam">Delete User</DialogTitle>
            <DialogDescription className="font-body text-teal dark:text-foam/80">
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
              className="font-body"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-gradient-to-r from-redAccent to-red-600 hover:from-redAccent/90 hover:to-red-700 font-body"
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