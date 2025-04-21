import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import EditorPage from './pages/EditorPage'
import Tools from './pages/Tools'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Editor" element={<EditorPage />} />
        <Route path="/tools" element={<Tools />} />
      </Routes>
    </Router>
  )
}

export default App