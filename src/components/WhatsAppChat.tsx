import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, X, Send, Phone, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppChatProps {
  supportNumber?: string;
  businessHours?: {
    start: string;
    end: string;
    timezone: string;
  };
}

const WhatsAppChat = ({ 
  supportNumber = "+971 58 573 0141", // Updated WhatsApp number
  businessHours = {
    start: "08:00",
    end: "17:00", 
    timezone: "SAST"
  }
}: WhatsAppChatProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [isBusinessHours, setIsBusinessHours] = useState(true);
  const [isButtonStable, setIsButtonStable] = useState(false);

  useEffect(() => {
    // Check if current time is within business hours
    const checkBusinessHours = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const startHour = parseInt(businessHours.start.split(':')[0]);
      const endHour = parseInt(businessHours.end.split(':')[0]);
      
      setIsBusinessHours(currentHour >= startHour && currentHour < endHour);
    };

    checkBusinessHours();
    
    // Use a longer interval to check business hours (every 5 minutes)
    const interval = window.setInterval(checkBusinessHours, 5 * 60 * 1000);

    // Set button as stable after a short delay
    const stabilizeTimeout = setTimeout(() => {
      setIsButtonStable(true);
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(stabilizeTimeout);
    };
  }, [businessHours]);

  const generateWhatsAppMessage = () => {
    const baseMessage = `Hello Liquid Current OTC Desk Support,\n\n`;
    
    let userInfo = '';
    if (user) {
      userInfo = `User: ${user.email}\n`;
    }
    
    const customMessage = message ? `Message: ${message}\n\n` : '';
    
    const footer = `Please assist me with my inquiry.\n\nThank you!`;
    
    return encodeURIComponent(baseMessage + userInfo + customMessage + footer);
  };

  const openWhatsApp = () => {
    const whatsappMessage = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${supportNumber.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Log support request
    toast.success('Opening WhatsApp chat with support team');
    
    // Reset form
    setMessage('');
    setIsOpen(false);
  };

  const quickMessages = [
    "I need help with my KYC verification",
    "I have a question about my trading order",
    "I need assistance with my account",
    "I want to report a technical issue",
    "I need help with a transaction"
  ];

  const selectQuickMessage = (quickMsg: string) => {
    setMessage(quickMsg);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className={`h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${isButtonStable ? '' : 'animate-none'}`}
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Floating WhatsApp Button */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className={`h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${isButtonStable ? '' : 'animate-none'}`}
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* WhatsApp Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96">
          <Card className="shadow-2xl border-0 overflow-hidden">
            {/* Header */}
            <CardHeader className="bg-green-500 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-sm font-semibold">
                      Liquid Current Support
                    </CardTitle>
                    <CardDescription className="text-green-100 text-xs">
                      {isBusinessHours ? (
                        <span className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-green-300 rounded-full"></div>
                          Online • Typically replies instantly
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Outside business hours ({businessHours.start}-{businessHours.end} {businessHours.timezone})
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(true)}
                    className="h-8 w-8 text-white hover:bg-green-600"
                  >
                    <span className="text-lg">−</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-white hover:bg-green-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Welcome Message */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Liquid Current Support</p>
                    <p className="text-xs text-gray-600">
                      Hello! How can we help you today? Click the button below to start a WhatsApp chat with our support team.
                    </p>
                    {!isBusinessHours && (
                      <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded mt-2">
                        Note: You're contacting us outside business hours. We'll respond as soon as we're back online.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Messages */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">Common Questions:</Label>
                <div className="flex flex-wrap gap-2">
                  {quickMessages.map((msg, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs py-1 h-auto"
                      onClick={() => selectQuickMessage(msg)}
                    >
                      {msg}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs text-gray-500">Your Message:</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    window.open(`tel:${supportNumber}`, '_blank');
                  }}
                >
                  <Phone className="h-4 w-4" />
                  Call Us
                </Button>
                <Button
                  className="flex-1 gap-2 bg-green-500 hover:bg-green-600"
                  onClick={openWhatsApp}
                >
                  <Send className="h-4 w-4" />
                  Chat on WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default WhatsAppChat;