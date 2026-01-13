import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Plus, RefreshCw, Trash2, Edit2, X, AlertCircle, Check } from 'lucide-react';

export default function StudyApp() {
  const [currentPage, setCurrentPage] = useState('Inputs');
  const [inputPairs, setInputPairs] = useState([{ word: '', answer: '' }]);
  const [database, setDatabase] = useState([]);
  const [studyCards, setStudyCards] = useState([]);
  const [visibleAnswers, setVisibleAnswers] = useState({});
  const [mistakes, setMistakes] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editWord, setEditWord] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [mistakeAnimations, setMistakeAnimations] = useState({});
  
  const inputRefs = useRef([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedDatabase = localStorage.getItem('studyDatabase');
    const savedMistakes = localStorage.getItem('studyMistakes');
    
    if (savedDatabase) {
      setDatabase(JSON.parse(savedDatabase));
    }
    if (savedMistakes) {
      setMistakes(JSON.parse(savedMistakes));
    }
  }, []);

  // Save database to localStorage
  useEffect(() => {
    localStorage.setItem('studyDatabase', JSON.stringify(database));
  }, [database]);

  // Save mistakes to localStorage
  useEffect(() => {
    localStorage.setItem('studyMistakes', JSON.stringify(mistakes));
  }, [mistakes]);

  // Focus first input when navigating to Inputs page
  useEffect(() => {
    if (currentPage === 'Inputs' && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [currentPage]);

  const addInputPair = () => {
    setInputPairs([...inputPairs, { word: '', answer: '' }]);
    setTimeout(() => {
      const newIndex = inputPairs.length * 2;
      inputRefs.current[newIndex]?.focus();
    }, 50);
  };

  const updateInputPair = (index, field, value) => {
    const newPairs = [...inputPairs];
    newPairs[index][field] = value;
    setInputPairs(newPairs);
  };

  const removeInputPair = (index) => {
    if (inputPairs.length > 1) {
      setInputPairs(inputPairs.filter((_, i) => i !== index));
    }
  };

  const handleKeyDown = (e, pairIndex, field) => {
    const target = e.target;
    const cursorAtStart = target.selectionStart === 0;
    const cursorAtEnd = target.selectionStart === target.value.length;

    if (e.key === 'ArrowRight' && field === 'word' && cursorAtEnd) {
      e.preventDefault();
      const answerIndex = pairIndex * 2 + 1;
      inputRefs.current[answerIndex]?.focus();
    } else if (e.key === 'ArrowLeft' && field === 'answer' && cursorAtStart) {
      e.preventDefault();
      const wordIndex = pairIndex * 2;
      inputRefs.current[wordIndex]?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (pairIndex === inputPairs.length - 1) {
        addInputPair();
      } else {
        const nextIndex = (pairIndex + 1) * 2;
        inputRefs.current[nextIndex]?.focus();
      }
    }
  };

  const completeInput = () => {
    const validPairs = inputPairs.filter(pair => pair.word.trim() && pair.answer.trim());
    if (validPairs.length === 0) return;

    const newCards = validPairs.map((pair, index) => ({
      id: Date.now() + index,
      word: pair.word.trim(),
      answer: pair.answer.trim()
    }));

    const updatedDatabase = [...database, ...newCards];
    setDatabase(updatedDatabase);
    setStudyCards(newCards);
    setInputPairs([{ word: '', answer: '' }]);
    setVisibleAnswers({});
    setCurrentPage('Study');
  };

  const toggleAnswer = (id) => {
    setVisibleAnswers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const scrambleCards = () => {
    const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setVisibleAnswers({});
  };

  const markAsMistake = (card) => {
    const exists = mistakes.find(m => m.id === card.id);
    
    if (exists) {
      // Remove from mistakes
      setMistakes(mistakes.filter(m => m.id !== card.id));
      setMistakeAnimations(prev => ({ ...prev, [card.id]: false }));
    } else {
      // Add to mistakes with animation
      setMistakes([...mistakes, card]);
      setMistakeAnimations(prev => ({ ...prev, [card.id]: true }));
      
      // Remove animation after delay
      setTimeout(() => {
        setMistakeAnimations(prev => ({ ...prev, [card.id]: false }));
      }, 1000);
    }
  };

  const isMistake = (id) => {
    return mistakes.some(m => m.id === id);
  };

  const completeStudy = () => {
    setStudyCards([]);
    setVisibleAnswers({});
  };

  const deleteFromDatabase = (id) => {
    setDatabase(database.filter(item => item.id !== id));
    setMistakes(mistakes.filter(item => item.id !== id));
    setStudyCards(studyCards.filter(item => item.id !== id));
  };

  const deleteAllDatabase = () => {
    if (confirm('Are you sure you want to delete all data from the database?')) {
      setDatabase([]);
      setMistakes([]);
      setStudyCards([]);
    }
  };

  const deleteFromMistakes = (id) => {
    setMistakes(mistakes.filter(item => item.id !== id));
  };

  const deleteAllMistakes = () => {
    if (confirm('Are you sure you want to delete all mistakes?')) {
      setMistakes([]);
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditWord(item.word);
    setEditAnswer(item.answer);
  };

  const saveEdit = () => {
    setDatabase(database.map(item => 
      item.id === editingId 
        ? { ...item, word: editWord.trim(), answer: editAnswer.trim() }
        : item
    ));
    setMistakes(mistakes.map(item => 
      item.id === editingId 
        ? { ...item, word: editWord.trim(), answer: editAnswer.trim() }
        : item
    ));
    setStudyCards(studyCards.map(item => 
      item.id === editingId 
        ? { ...item, word: editWord.trim(), answer: editAnswer.trim() }
        : item
    ));
    setEditingId(null);
  };

  const quickStudyDatabase = () => {
    setStudyCards([...database]);
    setVisibleAnswers({});
    setCurrentPage('Study');
  };

  const quickStudyMistakes = () => {
    setStudyCards([...mistakes]);
    setVisibleAnswers({});
    setCurrentPage('Study');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="flex space-x-0.5 sm:space-x-1 overflow-x-auto">
            {['Inputs', 'Study', 'Database', 'Mistakes'].map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 sm:px-6 py-3 sm:py-4 font-semibold transition-colors whitespace-nowrap text-sm sm:text-base ${
                  currentPage === page
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-3 sm:p-6">
        {/* Inputs Page */}
        {currentPage === 'Inputs' && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Add New Words</h2>
            <div className="space-y-3 sm:space-y-4">
              {inputPairs.map((pair, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 items-start">
                  <textarea
                    ref={el => inputRefs.current[index * 2] = el}
                    placeholder="Word/Question"
                    value={pair.word}
                    onChange={(e) => updateInputPair(index, 'word', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, 'word')}
                    className="w-full sm:flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm sm:text-base"
                    rows="2"
                  />
                  <textarea
                    ref={el => inputRefs.current[index * 2 + 1] = el}
                    placeholder="Answer"
                    value={pair.answer}
                    onChange={(e) => updateInputPair(index, 'answer', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, 'answer')}
                    className="w-full sm:flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm sm:text-base"
                    rows="2"
                  />
                  {inputPairs.length > 1 && (
                    <button
                      onClick={() => removeInputPair(index)}
                      className="self-end sm:self-start p-2 sm:p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
              <button
                onClick={addInputPair}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
              >
                <Plus size={18} className="sm:w-5 sm:h-5" /> Add More
              </button>
              <button
                onClick={completeInput}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                Complete
              </button>
            </div>
          </div>
        )}

        {/* Study Page */}
        {currentPage === 'Study' && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Study Session</h2>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={scrambleCards}
                  className="flex items-center justify-center gap-2 flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
                >
                  <RefreshCw size={16} className="sm:w-4 sm:h-4" /> Scramble
                </button>
                <button
                  onClick={completeStudy}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  Complete
                </button>
              </div>
            </div>
            
            {studyCards.length === 0 ? (
              <p className="text-center text-gray-500 py-8 sm:py-12 text-sm sm:text-base">No cards to study. Add some words first!</p>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {studyCards.map(card => (
                  <div key={card.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-base sm:text-lg font-semibold text-gray-800 mb-2 break-words">{card.word}</p>
                        {visibleAnswers[card.id] && (
                          <p className="text-sm sm:text-base text-gray-600 bg-gray-50 p-2 sm:p-3 rounded whitespace-pre-wrap break-words">{card.answer}</p>
                        )}
                      </div>
                      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleAnswer(card.id)}
                          className="p-1.5 sm:p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          {visibleAnswers[card.id] ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                        </button>
                        <button
                          onClick={() => markAsMistake(card)}
                          className={`relative p-1.5 sm:p-2 rounded-lg transition-all ${
                            isMistake(card.id)
                              ? 'bg-red-100 text-red-700'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={isMistake(card.id) ? "Remove from mistakes" : "Mark as mistake"}
                        >
                          {isMistake(card.id) ? <Check size={18} className="sm:w-5 sm:h-5" /> : <AlertCircle size={18} className="sm:w-5 sm:h-5" />}
                          {mistakeAnimations[card.id] && (
                            <span className="absolute inset-0 rounded-lg bg-red-500 animate-ping opacity-75"></span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Database Page */}
        {currentPage === 'Database' && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Database ({database.length})</h2>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                {database.length > 0 && (
                  <>
                    <button
                      onClick={quickStudyDatabase}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base whitespace-nowrap"
                    >
                      Quick Study All
                    </button>
                    <button
                      onClick={deleteAllDatabase}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base whitespace-nowrap"
                    >
                      Delete All
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {database.length === 0 ? (
              <p className="text-center text-gray-500 py-8 sm:py-12 text-sm sm:text-base">No data in database yet.</p>
            ) : (
              <div className="space-y-3">
                {database.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                    {editingId === item.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editWord}
                          onChange={(e) => setEditWord(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none text-sm sm:text-base"
                          rows="2"
                        />
                        <textarea
                          value={editAnswer}
                          onChange={(e) => setEditAnswer(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none text-sm sm:text-base"
                          rows="2"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="flex-1 sm:flex-none px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm sm:text-base"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 whitespace-pre-wrap break-words text-sm sm:text-base">{item.word}</p>
                          <p className="text-gray-600 mt-1 whitespace-pre-wrap break-words text-sm sm:text-base">{item.answer}</p>
                        </div>
                        <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} className="sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => deleteFromDatabase(item.id)}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mistakes Page */}
        {currentPage === 'Mistakes' && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Mistakes ({mistakes.length})</h2>
              <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                {mistakes.length > 0 && (
                  <>
                    <button
                      onClick={quickStudyMistakes}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base whitespace-nowrap"
                    >
                      Quick Study
                    </button>
                    <button
                      onClick={deleteAllMistakes}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base whitespace-nowrap"
                    >
                      Delete All
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {mistakes.length === 0 ? (
              <p className="text-center text-gray-500 py-8 sm:py-12 text-sm sm:text-base">No mistakes yet. Keep studying!</p>
            ) : (
              <div className="space-y-3">
                {mistakes.map(item => (
                  <div key={item.id} className="border border-red-200 bg-red-50 rounded-lg p-3 sm:p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 whitespace-pre-wrap break-words text-sm sm:text-base">{item.word}</p>
                        <p className="text-gray-600 mt-1 whitespace-pre-wrap break-words text-sm sm:text-base">{item.answer}</p>
                      </div>
                      <button
                        onClick={() => deleteFromMistakes(item.id)}
                        className="flex-shrink-0 p-1.5 sm:p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}