import { html, useEffect, useState } from '../lib/react.js'

export function SectionNav({ sections = [], topOffset = 96 }) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean)

    if (!sectionElements.length || typeof IntersectionObserver === 'undefined') {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visibleEntries[0]?.target?.id) {
          setActiveId(visibleEntries[0].target.id)
        }
      },
      {
        rootMargin: `-${topOffset}px 0px -55% 0px`,
        threshold: [0.2, 0.35, 0.5, 0.8],
      },
    )

    sectionElements.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [sections, topOffset])

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (!element) return
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return html`
    <div className="section-nav sticky top-0 z-30 -mx-1 overflow-x-auto px-1 pb-2 pt-1">
      <div className="flex min-w-max gap-2 rounded-2xl border border-slate-800/80 bg-slate-950/85 p-1.5 shadow-lg shadow-slate-950/40 backdrop-blur-xl">
        ${sections.map((section) => {
          const active = section.id === activeId
          return html`
            <button
              key=${section.id}
              type="button"
              onClick=${() => scrollToSection(section.id)}
              className=${`rounded-xl px-4 py-2.5 text-sm font-medium transition ${active ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}
            >
              ${section.label}
            </button>
          `
        })}
      </div>
    </div>
  `
}
