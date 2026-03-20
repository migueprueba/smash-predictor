import { useState, useRef, useEffect } from 'react';
import { predictWinner, modelAssets } from '../utils/model';
import './PredictionForm.css';

const characters = Object.keys(modelAssets.chars).sort();
const stages = Object.keys(modelAssets.stages).sort();
const players = modelAssets.player_wr ? Object.keys(modelAssets.player_wr).sort() : [];

function PlayerAutocomplete({ label, id, onSelect }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [page, setPage] = useState(0);
    const dropdownRef = useRef(null);
    const ITEMS_PER_PAGE = 10;

    const filteredPlayers = players.filter(p =>
        p.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);
    const paginatedPlayers = filteredPlayers.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(0);
        setIsOpen(true);
    };

    const handleSelect = (playerName) => {
        const wr = modelAssets.player_wr[playerName];
        onSelect(Number(wr.toFixed(2)));
        setSearchTerm(playerName);
        setIsOpen(false);
    };

    return (
        <div className="form-group autocomplete-container" ref={dropdownRef}>
            <label htmlFor={id}>{label}</label>
            <input
                type="text"
                id={id}
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsOpen(true)}
                placeholder="Search player..."
                autoComplete="off"
            />
            {isOpen && (
                <div className="autocomplete-dropdown">
                    <ul>
                        {paginatedPlayers.map(p => (
                            <li key={p} onClick={() => handleSelect(p)}>
                                {p} <span className="wr-hint">({(modelAssets.player_wr[p] * 100).toFixed(1)}%)</span>
                            </li>
                        ))}
                        {filteredPlayers.length === 0 && <li>No players found</li>}
                    </ul>
                    {totalPages > 1 && (
                        <div className="pagination-controls">
                            <button
                                type="button"
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                Prev
                            </button>
                            <span>{page + 1} / {totalPages}</span>
                            <button
                                type="button"
                                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={page === totalPages - 1}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function PredictionForm() {
    const [formData, setFormData] = useState({
        p1_char: characters[0],
        p2_char: characters[0],
        stage: stages[0],
        p1_wr: 0.5,
        p2_wr: 0.5
    });

    const [result, setResult] = useState(null);

    const updateWinRate = (wr, playerKey) => {
        setFormData(prev => ({ ...prev, [playerKey]: wr }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePredict = (e) => {
        e.preventDefault();
        const prediction = predictWinner(formData);
        setResult(prediction);
    };

    return (
        <div className="prediction-container">
            <div className="card prediction-card">
                <h2>Match Predictor</h2>
                <form onSubmit={handlePredict} className="prediction-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="p1_char">Player 1 Character</label>
                            <select name="p1_char" id="p1_char" value={formData.p1_char} onChange={handleChange}>
                                {characters.map(char => (
                                    <option key={char} value={char}>{char}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="p2_char">Player 2 Character</label>
                            <select name="p2_char" id="p2_char" value={formData.p2_char} onChange={handleChange}>
                                {characters.map(char => (
                                    <option key={char} value={char}>{char}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group slide-in">
                        <label htmlFor="stage">Stage</label>
                        <select name="stage" id="stage" value={formData.stage} onChange={handleChange}>
                            {stages.map(stage => (
                                <option key={stage} value={stage}>{stage}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <PlayerAutocomplete
                            label="Load Player 1 (Optional)"
                            id="p1_player"
                            onSelect={(wr) => updateWinRate(wr, 'p1_wr')}
                        />
                        <PlayerAutocomplete
                            label="Load Player 2 (Optional)"
                            id="p2_player"
                            onSelect={(wr) => updateWinRate(wr, 'p2_wr')}
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="p1_wr">Player 1 Win Rate (0.0 - 1.0)</label>
                            <input
                                type="number"
                                name="p1_wr"
                                id="p1_wr"
                                value={formData.p1_wr}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                max="1"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="p2_wr">Player 2 Win Rate (0.0 - 1.0)</label>
                            <input
                                type="number"
                                name="p2_wr"
                                id="p2_wr"
                                value={formData.p2_wr}
                                onChange={handleChange}
                                step="0.01"
                                min="0"
                                max="1"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="predict-btn">Predict Outcome</button>
                </form>
            </div>

            {result && (
                <div className="card result-card">
                    <h3>Prediction Result</h3>
                    <div className="winner-display">
                        <span className="winner-highlight">{result.winner}</span> is predicted to win!
                    </div>
                    <div className="score-details">
                        <p>Raw Score: {result.scoreVal.toFixed(4)}</p>
                        <p>Probability confidence: {(result.probability * 100).toFixed(1)}%</p>
                    </div>
                </div>
            )}
        </div>
    );
}
