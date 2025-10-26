import { useEffect, useState } from 'react'

const PORTS = [3000, 3001, 3005, 5173, 8080, 3025]

export default function PortsList() {
  const [activePorts, setActivePorts] = useState<number[]>([])

  useEffect(() => {
    const checkPorts = async () => {
      const running: number[] = []
      for (const port of PORTS) {
        try {
          const res = await fetch(`http://localhost:${port}`, { method: 'HEAD' })
          if (res.ok) running.push(port)
        } catch {}
      }
      setActivePorts(running)
    }

    checkPorts()
    const interval = setInterval(checkPorts, 3000)
    return () => clearInterval(interval)
  }, [])

  if (activePorts.length === 0)
    return <div className="text-zinc-400 text-sm">No local servers running</div>

  return (
    <div className="flex flex-wrap gap-3">
      {activePorts.map((port) => (
        <button
          key={port}
          onClick={() => window.open(`http://localhost:${port}`, '_blank')}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg"
        >
          localhost:{port}
        </button>
      ))}
    </div>
  )
}
