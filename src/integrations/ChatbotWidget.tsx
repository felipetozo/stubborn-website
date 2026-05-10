import Script from 'next/script'

export default function ChatbotWidget() {
  return (
    <Script
      src="https://chat.stubborn.com.br/widget.js"
      data-client-id="1701c3b0-d559-43a8-9125-09736459e897"
      data-api-url="https://chat.stubborn.com.br"
      strategy="afterInteractive"
    />
  )
}
