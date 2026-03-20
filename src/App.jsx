import { Routes, Route, Link } from 'react-router-dom'

function Home() {
    return (
        <div className="page-content">
            <h1>Welcome to Smash Predictor</h1>
            <p>This is a premium React scaffolding optimized for GitHub Pages.</p>
            <div className="card">
                <p>Start building your amazing project here.</p>
            </div>
        </div>
    )
}

function About() {
    return (
        <div className="page-content">
            <h1>About This Project</h1>
            <p>This project uses Vite, React Router (HashRouter), and GitHub Actions for seamless deployment.</p>
        </div>
    )
}

function App() {
    return (
        <div className="app-container">
            <nav className="glass-nav">
                <div className="nav-logo">Smash Predictor</div>
                <div className="nav-links">
                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>
                </div>
            </nav>

            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </main>

            <footer className="glass-footer">
                <p>&copy; 2026 Smash Predictor Scaffolding</p>
            </footer>
        </div>
    )
}

export default App
