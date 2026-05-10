import Script from 'next/script'

export default function ChatbotWidget() {
  return (
    <>
      <Script id="chatbot-config" strategy="beforeInteractive">{`
        window.__chatbot = {
          clientId: '1701c3b0-d559-43a8-9125-09736459e897',
          apiUrl: 'https://chat.stubborn.com.br'
        }
      `}</Script>
      <Script
        src="https://chat.stubborn.com.br/widget.js"
        strategy="afterInteractive"
      />
    </>
  )
}
