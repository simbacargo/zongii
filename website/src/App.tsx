import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './ui/ScrollToTop'
import Home from './pages/Home'
import About from './pages/About'
import News from './pages/News'
import NewsDetail from './pages/NewsDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
      <ScrollToTop />
    </BrowserRouter>
  )
}
