import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import StatsBar from './components/StatsBar'
import Experience from './components/Experience'
import Products from './components/Products'
import WhyZongii from './components/WhyZongii'
import Contact from './components/Contact'
import Footer from './components/Footer'
import ScrollToTop from './ui/ScrollToTop'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <section id="home"><Hero /></section>
        <StatsBar />
        <Experience />
        <Products />
        <WhyZongii />
        <Contact />
      </main>
      <Footer />
      <ScrollToTop />
    </>
  )
}
