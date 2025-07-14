import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

export default function KycAdmin() {
  const { toast } = useToast();
  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('kyc_submissions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setApplications(data || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: "Error loading applications",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [toast]);

  useEffect(() => {
    if (selectedApplication) {
      fetchDocuments(selectedApplication.id);
    }
  }, [selectedApplication]);

  const fetchDocuments = async (submissionId) => {
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select(`
          id,
          submission_id,
          document_type,
          file_path,
          created_at,
          document_type_id,
          status_id,
          verified_at
        `)
        .eq('submission_id', submissionId);
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error loading documents",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Filter applications based on search term
  const filteredApplications = applications.filter(app => 
    app.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingApplications = filteredApplications.filter(app => app.status === 'pending');
  const approvedApplications = filteredApplications.filter(app => app.status === 'approved');
  const rejectedApplications = filteredApplications.filter(app => app.status === 'rejected');

  const handleApprove = async (id) => {
    try {
      const { error } = await supabase
        .from('kyc_submissions')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      setApplications(apps => apps.map(app => 
        app.id === id ? { ...app, status: 'approved' } : app
      ));
      
      sonnerToast.success("KYC approved successfully");
      toast({
        title: "KYC Approved",
        description: "Email notification has been sent to the applicant.",
      });
    } catch (error) {
      console.error('Error approving application:', error);
      sonnerToast.error(error.message || "Failed to approve KYC application");
      toast({
        title: "Error approving application",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleReject = async (id, reason) => {
    try {
      const { error } = await supabase
        .from('kyc_submissions')
        .update({ 
          status: 'rejected', 
          rejection_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setApplications(apps => apps.map(app => 
        app.id === id ? { ...app, status: 'rejected', rejection_reason: reason } : app
      ));
      
      setRejectionReason('');
      
      sonnerToast.success("KYC rejected successfully");
      toast({
        title: "KYC Rejected",
        description: "Email notification with reason has been sent to the applicant.",
      });
    } catch (error) {
      console.error('Error rejecting application:', error);
      sonnerToast.error(error.message || "Failed to reject KYC application");
      toast({
        title: "Error rejecting application",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getDocumentUrl = async (filePath) => {
    try {
      const { data: { publicUrl }, error } = await supabase.storage
        .from('kyc_documents')
        .getPublicUrl(filePath);
      
      if (error) throw error;
      return publicUrl;
    } catch (error) {
      console.error('Error getting document URL:', error);
      toast.error("Failed to access document");
      return null;
    }
  };

  const handleViewDocument = async (filePath) => {
    const url = await getDocumentUrl(filePath);
    if (url) {
      window.open(url, '_blank');
    }
  };

  const getBadgeVariant = (status) => {
    switch(status) {
      case 'pending':
        return 'outline';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getBadgeText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getSourceOfFundsLabel = (key) => {
    const sources = {
      'employment': 'Employment Income',
      'business': 'Business Income',
      'investment': 'Investment Income',
      'savings': 'Savings',
      'gift': 'Gift/Inheritance',
      'loan': 'Loan Proceeds',
      'crypto': 'Sale of Crypto Assets',
      'other': 'Other'
    };
    return sources[key] || key;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">KYC Administration</h1>
            <p className="text-gray-600">Review and manage customer verification applications</p>
          </div>
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <Card>
          <Tabs defaultValue="pending">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>KYC Applications</CardTitle>
                <TabsList>
                  <TabsTrigger value="pending">
                    Pending ({pendingApplications.length})
                  </TabsTrigger>
                  <TabsTrigger value="approved">
                    Approved ({approvedApplications.length})
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    Rejected ({rejectedApplications.length})
                  </TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                Review customer verification applications
              </CardDescription>
            </CardHeader>
            
            <TabsContent value="pending">
              <ApplicationTable 
                applications={pendingApplications} 
                getBadgeVariant={getBadgeVariant}
                getBadgeText={getBadgeText}
                setSelectedApplication={setSelectedApplication}
                loading={loading}
              />
            </TabsContent>
            
            <TabsContent value="approved">
              <ApplicationTable 
                applications={approvedApplications} 
                getBadgeVariant={getBadgeVariant}
                getBadgeText={getBadgeText}
                setSelectedApplication={setSelectedApplication}
                loading={loading}
              />
            </TabsContent>
            
            <TabsContent value="rejected">
              <ApplicationTable 
                applications={rejectedApplications} 
                getBadgeVariant={getBadgeVariant}
                getBadgeText={getBadgeText}
                setSelectedApplication={setSelectedApplication}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Application Detail Dialog */}
        <Dialog
          open={!!selectedApplication}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedApplication(null);
              setRejectionReason('');
            }
          }}
        >
          <DialogContent className="sm:max-w-[700px]">
            {selectedApplication && (
              <>
                <DialogHeader>
                  <DialogTitle>KYC Application Details</DialogTitle>
                  <DialogDescription>
                    Submitted on {formatDate(selectedApplication.created_at)}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">First Name</Label>
                      <p className="text-gray-900">{selectedApplication.first_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Surname</Label>
                      <p className="text-gray-900">{selectedApplication.surname}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-gray-900">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-gray-900">{selectedApplication.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">ID Type</Label>
                      <p className="text-gray-900">{selectedApplication.id_type}</p>
                    </div>
                    {selectedApplication.national_id_number && (
                      <div>
                        <Label className="text-sm font-medium">
                          {selectedApplication.id_type === 'passport' ? 'Passport Number' : 'National ID Number'}
                        </Label>
                        <p className="text-gray-900">{selectedApplication.national_id_number}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <p className="text-gray-900">
                      {selectedApplication.address}, {selectedApplication.city}, {selectedApplication.postal_code}, {selectedApplication.country}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Source of Funds</Label>
                      <p className="text-gray-900">{getSourceOfFundsLabel(selectedApplication.source_of_funds)}</p>
                    </div>
                    {selectedApplication.source_of_funds === 'other' && selectedApplication.other_source_description && (
                      <div>
                        <Label className="text-sm font-medium">Other Source Description</Label>
                        <p className="text-gray-900">{selectedApplication.other_source_description}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <Badge variant={getBadgeVariant(selectedApplication.status)}>
                        {getBadgeText(selectedApplication.status)}
                      </Badge>
                    </div>
                  </div>

                  {selectedApplication.rejection_reason && (
                    <div>
                      <Label className="text-sm font-medium">Rejection Reason</Label>
                      <p className="text-gray-900">{selectedApplication.rejection_reason}</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium">Documents</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                      {documents.map((doc) => (
                        <Card key={doc.id} className="p-2">
                          <div className="text-center">
                            <div className="h-12 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <p className="mt-1 text-xs font-medium">{doc.document_type.replace(/_/g, ' ')}</p>
                            <div className="mt-2 flex justify-center space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2"
                                onClick={() => handleViewDocument(doc.file_path)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                <span className="text-xs">View</span>
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {documents.length === 0 && (
                        <p className="text-gray-500 col-span-3">No documents found</p>
                      )}
                    </div>
                  </div>

                  {selectedApplication.status === 'pending' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="rejectionReason">Rejection Reason (if rejecting)</Label>
                        <Textarea
                          id="rejectionReason"
                          className="mt-1"
                          rows={3}
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Provide a reason for rejection..."
                        />
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  {selectedApplication.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (!rejectionReason) {
                            toast({
                              title: "Rejection reason required",
                              description: "Please provide a reason for rejection.",
                              variant: "destructive"
                            });
                            return;
                          }
                          handleReject(selectedApplication.id, rejectionReason);
                          setSelectedApplication(null);
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() => {
                          handleApprove(selectedApplication.id);
                          setSelectedApplication(null);
                        }}
                      >
                        Approve
                      </Button>
                    </div>
                  )}
                  {selectedApplication.status !== 'pending' && (
                    <Button
                      onClick={() => setSelectedApplication(null)}
                    >
                      Close
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Table component for applications
function ApplicationTable({ applications, getBadgeVariant, getBadgeText, setSelectedApplication, loading }) {
  if (loading) {
    return (
      <CardContent className="text-center py-10">
        <p className="text-gray-500">Loading applications...</p>
      </CardContent>
    );
  }

  if (applications.length === 0) {
    return (
      <CardContent className="text-center py-10">
        <p className="text-gray-500">No applications found</p>
      </CardContent>
    );
  }

  return (
    <CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Source of Funds</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell className="font-medium">{`${app.first_name} ${app.surname}`}</TableCell>
                <TableCell>{app.email}</TableCell>
                <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{app.source_of_funds}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(app.status)}>
                    {getBadgeText(app.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedApplication(app)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
}