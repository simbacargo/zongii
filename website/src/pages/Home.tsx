import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/Hero'
import StatsBar from '../components/StatsBar'
import Experience from '../components/Experience'
import Products from '../components/Products'
import WhyZongii from '../components/WhyZongii'
import Contact from '../components/Contact'

export default function Home() {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash)
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 80)
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [hash])

  return (
    <main>
      <section id="home"><Hero /></section>
      <StatsBar />
      <Experience />
      <Products />
      <WhyZongii />
      <Contact />
    </main>
  )
}
