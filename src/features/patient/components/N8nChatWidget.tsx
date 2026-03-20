import { useEffect } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';
import useAuthStore from '@/store/auth-store';
import { getItem } from '@/lib/local-storage';

export const openN8nChat = () => {
  const chatElement = document.querySelector('n8n-chat');
  if (chatElement && chatElement.shadowRoot) {
    const trigger = chatElement.shadowRoot.querySelector('.chat-window-toggle');
    if (trigger) {
      (trigger as HTMLElement).click();
      return;
    }
  }

  const fallbackTrigger = document.querySelector('.chat-window-toggle');
  if (fallbackTrigger) {
    (fallbackTrigger as HTMLElement).click();
  }
};

export default function N8nChatWidget() {
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    // Prevent multiple initializations
    if (document.querySelector('.chat-window-toggle')) return;

    const token = getItem<string>('token');

    createChat({
      webhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL,
      showWelcomeScreen: false,
      metadata: {
        userId: user?.id,
        userEmail: user?.email,
        token: token,
      },
      theme: {
        // Match AuraEyes UI brand and typography
        active: 'light',
        light: {
          color: '#00e5ff',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        },
        dark: {
          color: '#00e5ff',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        },
      },
    });

    // Inject custom CSS to hide the default floating trigger since we only want
    // it to open when the user clicks 'Ask AURA AI Assistant'
    const style = document.createElement('style');
    style.id = 'n8n-chat-custom-style';
    style.innerHTML = `
      n8n-chat::part(chat-window-toggle) {
        display: none !important;
      }
      .chat-window-toggle {
        display: none !important;
      }
      n8n-chat::part(powered-by) {
        display: none !important;
      }
      n8n-chat::part(chat-header) {
        background-color: #001529; 
        color: #00e5ff;
      }
      n8n-chat::part(chat-input) {
        display: flex !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Clean up styles
      const customStyle = document.getElementById('n8n-chat-custom-style');
      if (customStyle) {
        document.head.removeChild(customStyle);
      }
      // Note: @n8n/chat doesn't export a destroy method, so the widget stays
      // in the DOM, which is fine since we want chat state to persist.
    };
  }, []);

  return null;
}
