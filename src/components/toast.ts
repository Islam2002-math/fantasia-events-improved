'use client'

export function showToast(message: string, type: 'success' | 'error' = 'success') {
  try {
    const root = document.createElement('div')
    root.textContent = message
    root.style.position = 'fixed'
    root.style.right = '16px'
    root.style.bottom = '16px'
    root.style.zIndex = '9999'
    root.style.maxWidth = '80vw'
    root.style.padding = '10px 14px'
    root.style.borderRadius = '8px'
    root.style.color = type === 'success' ? '#0a0a0a' : '#fff'
    root.style.background = type === 'success' ? '#a7f3d0' : '#ef4444'
    root.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)'
    root.style.fontSize = '14px'
    root.style.opacity = '0'
    root.style.transition = 'opacity 150ms ease, transform 150ms ease'
    root.style.transform = 'translateY(8px)'
    document.body.appendChild(root)
    requestAnimationFrame(() => {
      root.style.opacity = '1'
      root.style.transform = 'translateY(0)'
    })
    setTimeout(() => {
      root.style.opacity = '0'
      root.style.transform = 'translateY(8px)'
      setTimeout(() => root.remove(), 180)
    }, 2200)
  } catch {}
}