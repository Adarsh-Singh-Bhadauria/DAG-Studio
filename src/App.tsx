import { useState } from 'react'
import './App.css'
import ReactFlowWrapper from './components/ReactFlowWrapper'

function App() {
  const [count, setCount] = useState(0)

  return (
     <div className="w-full h-screen bg-gray-50">
      <ReactFlowWrapper />
    </div>
  )
}

export default App
