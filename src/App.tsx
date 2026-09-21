import { useState } from 'react'
import ContactDock from './components/ContactDock'
import Footer from './components/Footer'
import Nav from './components/Nav'
import Preloader from './components/Preloader'
import SEO from './components/SEO'
import About from './components/sections/About'
import Categories from './components/sections/Categories'
import Contact from './components/sections/Contact'
import Gallery from './components/sections/Gallery'
import Hero from './components/sections/Hero'
import TrustedByFinest from './components/sections/TrustedByFinest'
import WhyUs from './components/sections/WhyUs'
import { useSmoothScroll } from './lib/useSmoothScroll'

function App() {
  const [loading, setLoading] = useState(true)
  useSmoothScroll()

  return (
    <>
      <SEO />
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <Nav />
      <div className="pb-24 md:pb-0">
        <main>
          <Hero />
          <About />
          <Categories />
          <TrustedByFinest />
          <WhyUs />
          <Gallery />
          <Contact />
        </main>
        <Footer />
      </div>
      <ContactDock />
    </>
  )
}

export default App
