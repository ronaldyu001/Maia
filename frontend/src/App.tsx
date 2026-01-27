import "./App.css";
import { useState, useCallback } from "react";
import Sidebar, { type Page } from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import Calendar from "./components/Calendar";
import tokens from "./tokens";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("chat");
  const [chatKey, setChatKey] = useState(0);
  const [hasConversation, setHasConversation] = useState(false);

  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const handleNewConversation = useCallback(() => {
    setChatKey((k) => k + 1);
    setHasConversation(false);
  }, []);

  const handleConversationChange = useCallback((has: boolean) => {
    setHasConversation(has);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: tokens.colors.background,
        fontFamily: tokens.fonts.sans,
        display: "flex",
        overflow: "hidden",
      }}
    >
      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        hasConversation={hasConversation}
        onNewConversation={handleNewConversation}
      />

      {/* Content area — animated page container */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Chat page */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: currentPage === "chat" ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <ChatWindow
            key={chatKey}
            onConversationChange={handleConversationChange}
          />
        </div>

        {/* Calendar page */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: currentPage === "calendar" ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Calendar />
        </div>
      </div>

      {/* Global styles: fonts, keyframes, scrollbar */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Handlee&family=Gochi+Hand&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');

        @keyframes pulse {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }

        ::placeholder {
          color: #8a7b6d;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #4a3f38;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #5a4d44;
        }
      `}</style>
    </div>
  );
}

export default App;
