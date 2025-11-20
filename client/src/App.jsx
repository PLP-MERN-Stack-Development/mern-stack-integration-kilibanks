import React from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import PostList from "./components/PostList";
import PostView from "./components/PostView";
import PostForm from "./components/PostForm";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts/new" element={<PostForm />} />
        <Route path="/posts/:id/edit" element={<PostForm editMode />} />
        <Route path="/posts/:id" element={<PostView />} />
      </Routes>
    </Layout>
  );
}
