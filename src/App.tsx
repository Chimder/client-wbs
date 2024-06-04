import React, { useState } from "react";

const App: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const connectWebSocket = () => {
    const newSocket = new WebSocket("ws://localhost:4000/ws");

    newSocket.onopen = () => {
      console.log("Connected to server");
    };

    newSocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      let displayMessage = "";

      if (message.event === "user_list") {
        displayMessage = `User connected: ${message.data.connected_users}`;
      } else {
        displayMessage = `User ${message.user_id}: ${message.data}`;
      }

      setMessages((prevMessages) => [...prevMessages, displayMessage]);
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    newSocket.onclose = () => {
      console.log("Disconnected from server");
    };

    setSocket(newSocket);
  };

  const disconnectWebSocket = () => {
    if (socket) {
      socket.close();
      setSocket(null);
      console.log("Disconnected from server");
    }
  };

  const sendMessage = () => {
    if (socket && inputValue.trim() !== "") {
      socket.send(JSON.stringify({ data: inputValue }));
      setInputValue("");
    }
  };

  return (
    <div>
      <h1>WebSocket Communication</h1>
      <button
        disabled={socket}
        onClick={connectWebSocket}
        style={{ width: "100px" }}
      >
        Connect
      </button>
      <button
        onClick={disconnectWebSocket}
        style={{ width: "100px", marginLeft: "10px" }}
        disabled={!socket}
      >
        Disconnect
      </button>
      <textarea
        readOnly
        value={messages.join("\n")}
        rows={10}
        cols={50}
        style={{ width: "100%", height: "200px", marginTop: "10px" }}
      />
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type your message here"
        style={{
          width: "calc(100% - 100px)",
          marginRight: "10px",
          marginTop: "10px",
        }}
      />
      <button
        onClick={sendMessage}
        style={{ width: "90px", marginTop: "10px" }}
        disabled={!socket}
      >
        Send
      </button>
    </div>
  );
};

export default App;
