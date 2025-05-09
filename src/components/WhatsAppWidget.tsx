/**
 * WhatsAppWidget.tsx
 *
 * Um componente de chat flutuante para WhatsApp que permite aos usuários
 * iniciar uma conversa diretamente do seu site.
 */

"use client";

import React, { useState, useEffect, FormEvent } from "react";

// 1. Defina a interface para as props do componente
interface WhatsappWidgetProps {
  phoneNumber: string;
  welcomeMessage: string;
  headerTitle: string;
  position?: 'left' | 'right';
  formFields?: { id: string; label: string; required: boolean; }[];
}

// 2. Define the type for messages
interface Message {
  from: 'bot' | 'user';
  text: string;
  isButtonList?: boolean;
  buttons?: { label: string; value: string; }[];
}

const WhatsappWidget: React.FC<WhatsappWidgetProps> = ({
  phoneNumber,
  welcomeMessage,
  headerTitle,
  position = 'right',
  formFields,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [product, setProduct] = useState("");
  const [messages, setMessages] = useState<Message[]>([]); // Use the Message interface here
  const [isTyping, setIsTyping] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setName("");
      setCity("");
      setWhatsappNumber("");
      setProduct("");
      setMessages([]);
      setIsTyping(false);
    } else {
      setTimeout(() => {
        addBotMessage(welcomeMessage);
        setStep(1);
      }, 500);
    }
  }, [isOpen, welcomeMessage]);

  const addBotMessage = (text: string, isButtonList = false, buttons: { label: string; value: string; }[] = []) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "bot", text, isButtonList, buttons }]);
      setIsTyping(false);
    }, 800);
  };

  const handleUserInput = (text: string) => {
    setMessages((prev) => [...prev, { from: "user", text }]);
    if (step === 1) {
      setName(text);
      if (formFields?.find(field => field.id === 'city')) {
        addBotMessage(`Prazer, ${text}! De qual cidade você está falando?`);
        setStep(2);
      } else if (formFields?.find(field => field.id === 'whatsapp')) {
        addBotMessage(`Prazer, ${text}! Qual o seu número de WhatsApp?`);
        setStep(3);
      }
      else {
        addBotMessage(`Prazer, ${text}! Selecione o produto desejado:`, true, [
          { label: "Telhas Isotérmicas", value: "Telhas Isotérmicas" },
          { label: "Painéis Isotérmicas", value: "Painéis Isotérmicas" },
          { label: "Lajes em EPS", value: "Lajes em EPS" },
          { label: "Flocos em EPS", value: "Flocos em EPS" },
        ]);
        setStep(4);
      }
    } else if (step === 2) {
      setCity(text);
      if (formFields?.find(field => field.id === 'whatsapp')) {
        addBotMessage("Qual o seu número de WhatsApp para contato?");
        setStep(3);
      } else {
        addBotMessage("Selecione o produto desejado:", true, [
          { label: "Telhas Isotérmicas", value: "Telhas Isotérmicas" },
          { label: "Painéis Isotérmicas", value: "Painéis Isotérmicas" },
          { label: "Lajes em EPS", value: "Lajes em EPS" },
          { label: "Flocos em EPS", value: "Flocos em EPS" },
        ]);
        setStep(4);
      }
    } else if (step === 3) {
      setWhatsappNumber(text); // Usar o estado correto
      addBotMessage("Selecione o produto desejado:", true, [
        { label: "Telhas Isotérmicas", value: "Telhas Isotérmicas" },
        { label: "Painéis Isotérmicas", value: "Painéis Isotérmicas" },
        { label: "Lajes em EPS", value: "Lajes em EPS" },
        { label: "Flocos em EPS", value: "Flocos em EPS" },
      ]);
      setStep(4);
    } else if (step === 4) {
      setProduct(text);
      const whatsappMessage = whatsappNumber
        ? `Obrigado pelo seu contato, ${name}! Em breve, um de nossos consultores entrará em contato com você pelo WhatsApp: ${whatsappNumber} para falar sobre ${text}.`
        : `Obrigado pelo seu contato, ${name}! Em breve, um de nossos consultores entrará em contato com você para falar sobre ${text}.`;
      addBotMessage(whatsappMessage);
      setTimeout(() => {
        addBotMessage("Agradecemos seu interesse nos produtos Isoart!");
        setStep(5);
      }, 1500);
    }
  };

  const selectProductHandler = (productValue: string) => {
    setProduct(productValue);
    handleUserInput(productValue);
  };

  // CSS transitions instead of framer-motion
  const chatContainerStyle = {
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    display: isOpen ? 'flex' : 'none',
    [position === 'right' ? 'right' : 'right']: '6',
  };

  return (
    <div>
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 ${position}-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </button>

      <div
        style={chatContainerStyle}
        className="fixed bottom-20 w-80 bg-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-gray-300"
      >
        <div className="bg-green-600 text-white p-4 font-semibold">{headerTitle}</div>
        <div className="p-4 space-y-2 flex-1 overflow-y-auto max-h-96">
          {messages.map((msg, i) => (
            <div key={i}>
              <div
                className={`text-sm p-2 rounded-lg max-w-[80%] ${msg.from === "bot" ? "bg-gray-100 text-gray-800 self-start" : "bg-green-600 text-white self-end ml-auto"}`}
              >
                {msg.text}
              </div>
              {msg.from === "bot" && msg.isButtonList && msg.buttons?.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {msg.buttons.map((button) => (
                    <button
                      key={button.value}
                      onClick={() => selectProductHandler(button.value)}
                      className="bg-green-600 text-white p-2 rounded text-sm hover:bg-green-700"
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="text-sm text-gray-500 italic">Digitando...</div>
          )}
        </div>
        {step < 4 && !messages.some(msg => msg.from === 'bot' && msg.isButtonList) && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.target.elements.userInput as HTMLInputElement).value.trim();
              if (input) {
                handleUserInput(input);
                (e.target as HTMLFormElement).reset();
              }
            }}
            className="p-2 border-t flex gap-2"
          >
            <input
              name="userInput"
              autoFocus
              placeholder="Digite aqui..."
              className="flex-1 p-2 border rounded text-sm focus:border-green-600 focus:outline-none"
              type={step === 3 ? "tel" : "text"}
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 rounded hover:bg-green-700"
            >
              Enviar
            </button>
          </form>
        )}
        {step >= 5 && (
          <div className="p-4 border-t flex justify-center">
            <button
              onClick={() => setIsOpen(false)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsappWidget;

