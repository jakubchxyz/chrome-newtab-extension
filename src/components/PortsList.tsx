import { useEffect, useState } from 'react'

// Simple, robust port list: 3000-3050 + popular dev ports
const generatePorts = () => {
  const ports: number[] = []

  // Range 3000-3050 (51 ports)
  for (let port = 3000; port <= 3050; port++) {
    ports.push(port)
  }

  // Popular development ports
  const popularPorts = [
    5173, // Vite
    5432, // PostgreSQL
    8080, // Common web servers
    8000, // Django/Python
    4000, // Gatsby
    5000, // Flask/Python
    3333, // Nuxt
    4200, // Angular
    4321, // Astro
    8787, // SvelteKit
    6006, // Storybook
    9000, // PHP/Laravel
  ]

  ports.push(...popularPorts)
  return [...new Set(ports)] // Remove any duplicates
}

const PORTS_TO_CHECK = generatePorts()

export default function PortsList() {
  const [activePorts, setActivePorts] = useState<number[]>([])
  const [recentPorts, setRecentPorts] = useState<number[]>([])

  useEffect(() => {
    // Load recently active ports from localStorage
    const saved = localStorage.getItem('recent-active-ports')
    if (saved) {
      try {
        setRecentPorts(JSON.parse(saved))
      } catch {}
    }
  }, [])

  const checkPort = (port: number): Promise<boolean> => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest()
      xhr.timeout = 250 // 250ms timeout for fast detection
      xhr.open('HEAD', `http://localhost:${port}`, true)

      xhr.onload = () => resolve(true)
      xhr.onerror = () => resolve(false)
      xhr.ontimeout = () => resolve(false)

      try {
        xhr.send()
      } catch (error) {
        resolve(false)
      }
    })
  }

  const checkPorts = async () => {
    // Prioritize recent ports, then check all ports
    const portsToCheck = [...new Set([...recentPorts, ...PORTS_TO_CHECK])]

    // Check in batches of 15 to avoid overwhelming the browser
    const BATCH_SIZE = 15
    const running: number[] = []

    for (let i = 0; i < portsToCheck.length; i += BATCH_SIZE) {
      const batch = portsToCheck.slice(i, i + BATCH_SIZE)
      const batchChecks = batch.map(port => checkPort(port))
      const batchResults = await Promise.all(batchChecks)

      batchResults.forEach((isRunning, index) => {
        if (isRunning) {
          running.push(batch[index])
        }
      })
    }

    // Update recent ports (keep last 10 active ports for prioritization)
    const newRecentPorts = [...new Set([...recentPorts, ...running])].slice(-10)
    setRecentPorts(newRecentPorts)
    localStorage.setItem('recent-active-ports', JSON.stringify(newRecentPorts))

    setActivePorts(running.sort((a, b) => a - b)) // Sort ports numerically
  }

  useEffect(() => {
    checkPorts()
    const interval = setInterval(checkPorts, 1500) // Check every 1.5 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex justify-center">
      <div className={`grid gap-3 ${
        activePorts.length === 0
          ? ''
          : activePorts.length === 1
          ? 'grid-cols-1'
          : activePorts.length === 2
          ? 'grid-cols-1 md:grid-cols-2'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }`}>
        {activePorts.length === 0 ? (
          // Invisible placeholder to maintain consistent height
          <div className="opacity-0 pointer-events-none">
            <button className="flex items-center justify-center px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full"></div>
                <span className="font-medium text-sm">placeholder</span>
              </div>
            </button>
          </div>
        ) : (
          activePorts.map((port, index) => (
            <button
              key={port}
              onClick={() => window.open(`http://localhost:${port}`, '_blank')}
              className="group flex items-center justify-center px-4 py-3 bg-green-600/20 hover:bg-green-500/30 border border-green-500/30 hover:border-green-500/50 rounded-lg port-animation"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 group-hover:text-green-200 font-medium text-sm">
                  localhost:{port}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}