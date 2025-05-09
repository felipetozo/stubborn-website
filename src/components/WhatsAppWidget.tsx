// src/components/WhatsAppWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface WhatsAppWidgetProps {
  phoneNumber: string;
  welcomeMessage?: string;
  headerTitle?: string;
  avatarUrl?: string;
  headerColor?: string;
  position?: 'left' | 'right';
  autoOpen?: boolean;
  autoOpenDelay?: number;
  formFields?: {
    id: string;
    label: string;
    type?: string;
    required?: boolean;
  }[];
}

export default function WhatsAppWidget({
  phoneNumber,
  welcomeMessage = 'Olá! Como posso ajudar?',
  headerTitle = 'Atendimento via WhatsApp',
  avatarUrl = '/whatsapp-avatar.png',
  headerColor = '#25D366',
  position = 'right',
  autoOpen = false,
  autoOpenDelay = 3000,
  formFields = []
}: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  
  // Auto open chat after delay if enabled
  useEffect(() => {
    if (autoOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, autoOpenDelay);
      
      return () => clearTimeout(timer);
    }
  }, [autoOpen, autoOpenDelay]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare message with form data
    let whatsappMessage = message || welcomeMessage;
    
    // Add form fields data to message if any
    if (Object.keys(formData).length > 0) {
      whatsappMessage += "\n\nDados do formulário:";
      Object.entries(formData).forEach(([key, value]) => {
        const field = formFields.find(f => f.id === key);
        if (field) {
          whatsappMessage += `\n${field.label} ${value}`;
        }
      });
    }
    
    // Create WhatsApp URL with message
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    
    // Check if it's a form field or message
    if (id === 'whatsapp-message') {
      setMessage(value);
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };
  
  return (
    <>
      {/* Widget Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed ${position === 'right' ? 'right-6' : 'left-6'} bottom-6 bg-[#25D366] hover:bg-[#20c65b] w-16 h-16 rounded-full flex items-center justify-center shadow-lg z-50 transition-all duration-200 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Chat WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.6 6.32A7.85 7.85 0 0 0 12 4.02 7.94 7.94 0 0 0 4.03 12c0 1.38.36 2.72 1.05 3.9l-1.1 3.92 4.1-1.08a8.07 8.07 0 0 0 3.83.96A7.94 7.94 0 0 0 20 12c0-2.19-.86-4.24-2.4-5.68zm-5.6 12.14c-1.2 0-2.36-.31-3.38-.9l-.25-.15-2.53.66.68-2.46-.16-.25a6.52 6.52 0 0 1-1.02-3.47 6.46 6.46 0 0 1 11.32-4.17 6.46 6.46 0 0 1-4.66 10.74zm3.7-4.86c-.2-.1-1.18-.58-1.37-.65-.18-.07-.32-.1-.45.1-.13.2-.52.65-.64.78-.12.13-.23.15-.43.05-.2-.1-.85-.31-1.62-.99-.6-.53-1-1.2-1.12-1.4-.12-.2-.01-.31.09-.41.1-.1.2-.25.3-.37.1-.13.13-.2.2-.35.07-.15.03-.27-.02-.38-.05-.1-.45-1.08-.62-1.48-.16-.39-.33-.33-.45-.33-.12 0-.25-.02-.39-.02-.13 0-.35.05-.54.25-.18.2-.7.68-.7 1.66s.72 1.93.82 2.07c.1.13 1.4 2.14 3.4 3 .47.2.84.33 1.13.42.47.15.9.13 1.25.08.38-.06 1.17-.48 1.34-.94.17-.46.17-.86.12-.94-.05-.08-.19-.13-.39-.23z" />
        </svg>
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed ${position === 'right' ? 'right-6' : 'left-6'} bottom-6 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50 transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}
        style={{ maxHeight: '70vh' }}
      >
        {/* Header */}
        <div 
          className="p-4 flex items-center justify-between"
          style={{ backgroundColor: headerColor }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <Image 
                  src={avatarUrl}
                  alt="Atendente"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2a10 10 0 0 0-7.35 16.76 10.001 10.001 0 0 0 14.7 0A9.999 9.999 0 0 0 12 2zm0 18a8 8 0 0 1-5.55-2.25 6 6 0 0 1 11.1 0A8 8 0 0 1 12 20zm-2-10a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm2-4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-white font-medium">{headerTitle}</h3>
              <p className="text-white/80 text-xs">Online</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white"
            aria-label="Fechar chat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
          </button>
        </div>
        
        {/* Welcome Message */}
        <div className="p-4 bg-gray-50">
          <div className="bg-white p-3 rounded-lg shadow-sm inline-block max-w-[85%]">
            <p className="text-sm">{welcomeMessage}</p>
          </div>
        </div>
        
        {/* Chat Form */}
        <form onSubmit={handleSubmit} className="p-4 bg-white">
          {formFields.length > 0 && (
            <div className="space-y-3 mb-4">
              {formFields.map(field => (
                <div key={field.id}>
                  <label 
                    htmlFor={field.id}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type || 'text'}
                    id={field.id}
                    required={field.required}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              ))}
            </div>
          )}
          
          <div className="mb-4">
            <label 
              htmlFor="whatsapp-message" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mensagem
            </label>
            <textarea
              id="whatsapp-message"
              rows={3}
              placeholder="Digite sua mensagem..."
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            ></textarea>
          </div>
          
          <button
            type="submit"
            className="w-full bg-[#25D366] hover:bg-[#20c65b] text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.6 6.32A7.85 7.85 0 0 0 12 4.02 7.94 7.94 0 0 0 4.03 12c0 1.38.36 2.72 1.05 3.9l-1.1 3.92 4.1-1.08a8.07 8.07 0 0 0 3.83.96A7.94 7.94 0 0 0 20 12c0-2.19-.86-4.24-2.4-5.68zm-5.6 12.14c-1.2 0-2.36-.31-3.38-.9l-.25-.15-2.53.66.68-2.46-.16-.25a6.52 6.52 0 0 1-1.02-3.47 6.46 6.46 0 0 1 11.32-4.17 6.46 6.46 0 0 1-4.66 10.74z" />
            </svg>
            Iniciar conversa
          </button>
        </form>
      </div>
    </>
  );
}