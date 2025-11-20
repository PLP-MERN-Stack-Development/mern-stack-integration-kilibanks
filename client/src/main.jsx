import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { PostsProvider } from "./context/PostsContext";
import "./styles.css";

function Main() {
  return (
    <BrowserRouter>
      <PostsProvider>
        <App />
      </PostsProvider>
    </BrowserRouter>
  );
}

const container = document.getElementById("root");
createRoot(container).render(<Main />);
