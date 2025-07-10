import React, { useState } from 'react';
import './App.css';

const NAV_ITEMS = [
  { label: 'Standard', id: 'standard' },
  { label: 'Scientific', id: 'scientific' },
  { label: 'History', id: 'history' },
  { label: 'Memory', id: 'memory' },
];

const SCI_FUNCS = [
  { label: 'sin', fn: (x) => Math.sin(x) },
  { label: 'cos', fn: (x) => Math.cos(x) },
  { label: 'tan', fn: (x) => Math.tan(x) },
  { label: 'ln', fn: (x) => Math.log(x) },
  { label: 'log', fn: (x) => Math.log10(x) },
  { label: '√', fn: (x) => Math.sqrt(x) },
  { label: '^', fn: '^' },
  { label: '(', fn: '(' },
  { label: ')', fn: ')' },
  { label: 'π', fn: () => Math.PI },
  { label: 'e', fn: () => Math.E },
  { label: 'EXP', fn: 'EXP' },
];

function safeEval(expr) {
  // Basic safe eval for calculator (no variables, only math)
  try {
    // Replace unicode operators
    expr = expr.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');
    // Replace ^ with **
    expr = expr.replace(/(\d+)\s*\^\s*(\d+)/g, 'Math.pow($1,$2)');
    // Replace π and e
    expr = expr.replace(/π/g, `(${Math.PI})`).replace(/e/g, `(${Math.E})`);
    // Replace sqrt
    expr = expr.replace(/√\s*([\d.]+)/g, 'Math.sqrt($1)');
    // Replace log/ln
    expr = expr.replace(/log\s*([\d.]+)/g, 'Math.log10($1)');
    expr = expr.replace(/ln\s*([\d.]+)/g, 'Math.log($1)');
    // Replace sin/cos/tan
    expr = expr.replace(/sin\s*([\d.]+)/g, 'Math.sin($1)');
    expr = expr.replace(/cos\s*([\d.]+)/g, 'Math.cos($1)');
    expr = expr.replace(/tan\s*([\d.]+)/g, 'Math.tan($1)');
    // eslint-disable-next-line no-eval
    return eval(expr);
  } catch {
    return 'Err';
  }
}

function App() {
  const [active, setActive] = useState('standard');
  const [display, setDisplay] = useState('0');
  const [sciDisplay, setSciDisplay] = useState('0');
  const [history, setHistory] = useState([]);
  const [memory, setMemory] = useState(0);
  const [sciExpr, setSciExpr] = useState('');
  const [pendingOp, setPendingOp] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Standard calculator logic
  const handleStdBtn = (val) => {
    if (val === '⌫') {
      setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : '0'));
      return;
    }
    if (val === 'C') {
      setDisplay('0');
      setPendingOp(null);
      setWaitingForOperand(false);
      return;
    }
    if (val === '±') {
      setDisplay((d) => (d[0] === '-' ? d.slice(1) : '-' + d));
      return;
    }
    if (val === '%') {
      setDisplay((d) => String(parseFloat(d) / 100));
      return;
    }
    if (val === '=') {
      try {
        const result = safeEval(display);
        setHistory((h) => [...h, { expr: display, result }]);
        setDisplay(String(result));
        setPendingOp(null);
        setWaitingForOperand(true);
      } catch {
        setDisplay('Err');
      }
      return;
    }
    if (['+', '−', '×', '÷'].includes(val)) {
      if (pendingOp && !waitingForOperand) {
        // Chain operations
        const result = safeEval(display);
        setDisplay(result + val);
      } else {
        setDisplay((d) => d + val);
      }
      setPendingOp(val);
      setWaitingForOperand(false);
      return;
    }
    if (val === '.') {
      // Only one decimal per number
      const parts = display.split(/\+|−|×|÷/);
      if (parts[parts.length - 1].includes('.')) return;
      setDisplay((d) => d + '.');
      return;
    }
    // Number
    if (display === '0' || waitingForOperand) {
      setDisplay(val);
      setWaitingForOperand(false);
    } else {
      setDisplay((d) => d + val);
    }
  };

  // Scientific calculator logic
  const handleSciBtn = (val) => {
    if (val === '⌫') {
      setSciDisplay((d) => (d.length > 1 ? d.slice(0, -1) : '0'));
      setSciExpr((e) => (e.length > 1 ? e.slice(0, -1) : ''));
      return;
    }
    if (val === 'C') {
      setSciDisplay('0');
      setSciExpr('');
      setPendingOp(null);
      setWaitingForOperand(false);
      return;
    }
    if (val === '±') {
      setSciDisplay((d) => (d[0] === '-' ? d.slice(1) : '-' + d));
      return;
    }
    if (val === '%') {
      setSciDisplay((d) => String(parseFloat(d) / 100));
      return;
    }
    if (val === '=') {
      try {
        const result = safeEval(sciExpr || sciDisplay);
        setHistory((h) => [...h, { expr: sciExpr || sciDisplay, result }]);
        setSciDisplay(String(result));
        setSciExpr('');
        setPendingOp(null);
        setWaitingForOperand(true);
      } catch {
        setSciDisplay('Err');
      }
      return;
    }
    if (['+', '−', '×', '÷', '^'].includes(val)) {
      setSciExpr((e) => (e || sciDisplay) + val);
      setWaitingForOperand(false);
      return;
    }
    if (val === '.') {
      const parts = (sciExpr || sciDisplay).split(/\+|−|×|÷|\^/);
      if (parts[parts.length - 1].includes('.')) return;
      setSciExpr((e) => (e || sciDisplay) + '.');
      return;
    }
    if (val === '(' || val === ')') {
      setSciExpr((e) => (e || sciDisplay) + val);
      return;
    }
    if (val === 'π' || val === 'e') {
      setSciExpr((e) => (e || sciDisplay) + val);
      return;
    }
    if (val === '√' || val === 'log' || val === 'ln' || val === 'sin' || val === 'cos' || val === 'tan') {
      setSciExpr((e) => (e || sciDisplay) + val);
      return;
    }
    // Number
    if (sciDisplay === '0' || waitingForOperand) {
      setSciDisplay(val);
      setSciExpr((e) => (e ? e + val : val));
      setWaitingForOperand(false);
    } else {
      setSciDisplay((d) => d + val);
      setSciExpr((e) => (e ? e + val : val));
    }
  };

  // Memory logic
  const handleMemory = (action) => {
    if (action === 'MC') setMemory(0);
    if (action === 'MR') {
      setDisplay(String(memory));
      setSciDisplay(String(memory));
    }
    if (action === 'M+') setMemory((m) => m + parseFloat(display));
    if (action === 'M-') setMemory((m) => m - parseFloat(display));
  };

  // History click
  const handleHistoryClick = (item) => {
    setDisplay(String(item.result));
    setSciDisplay(String(item.result));
    setActive('standard');
  };

  return (
    <div className="app-bg">
      <nav className="glass-navbar">
        <div className="navbar-title">3D Calculator</div>
        <ul className="navbar-list">
          {NAV_ITEMS.map((item) => (
            <li
              key={item.id}
              className={active === item.id ? 'active' : ''}
              onClick={() => setActive(item.id)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      </nav>
      <main className="glass-calc-shell">
        {active === 'standard' && (
          <div className="glass-calc-ui">
            <div className="calc-display" id="calc-display">{display}</div>
            <div className="calc-buttons">
              <button className="btn btn-func" onClick={() => handleStdBtn('C')}>C</button>
              <button className="btn btn-func" onClick={() => handleStdBtn('⌫')}>⌫</button>
              <button className="btn btn-func" onClick={() => handleStdBtn('±')}>±</button>
              <button className="btn btn-func" onClick={() => handleStdBtn('%')}>%</button>
              <button className="btn btn-op" onClick={() => handleStdBtn('÷')}>÷</button>

              <button className="btn" onClick={() => handleStdBtn('7')}>7</button>
              <button className="btn" onClick={() => handleStdBtn('8')}>8</button>
              <button className="btn" onClick={() => handleStdBtn('9')}>9</button>
              <button className="btn btn-op" onClick={() => handleStdBtn('×')}>×</button>

              <button className="btn" onClick={() => handleStdBtn('4')}>4</button>
              <button className="btn" onClick={() => handleStdBtn('5')}>5</button>
              <button className="btn" onClick={() => handleStdBtn('6')}>6</button>
              <button className="btn btn-op" onClick={() => handleStdBtn('−')}>−</button>

              <button className="btn" onClick={() => handleStdBtn('1')}>1</button>
              <button className="btn" onClick={() => handleStdBtn('2')}>2</button>
              <button className="btn" onClick={() => handleStdBtn('3')}>3</button>
              <button className="btn btn-op" onClick={() => handleStdBtn('+')}>+</button>

              <button className="btn btn-zero" onClick={() => handleStdBtn('0')}>0</button>
              <button className="btn" onClick={() => handleStdBtn('.')}>.</button>
              <button className="btn btn-eq" onClick={() => handleStdBtn('=')}>=</button>
            </div>
          </div>
        )}
        {active === 'scientific' && (
          <div className="glass-calc-ui">
            <div className="calc-display" id="sci-calc-display">{sciExpr || sciDisplay}</div>
            <div className="calc-buttons sci-calc-buttons">
              {SCI_FUNCS.map((f) => (
                <button className="btn btn-func" key={f.label} onClick={() => handleSciBtn(f.label)}>{f.label}</button>
              ))}
              <button className="btn btn-func" onClick={() => handleSciBtn('C')}>C</button>
              <button className="btn btn-func" onClick={() => handleSciBtn('⌫')}>⌫</button>
              <button className="btn btn-func" onClick={() => handleSciBtn('±')}>±</button>
              <button className="btn btn-func" onClick={() => handleSciBtn('%')}>%</button>
              <button className="btn btn-op" onClick={() => handleSciBtn('÷')}>÷</button>

              <button className="btn" onClick={() => handleSciBtn('7')}>7</button>
              <button className="btn" onClick={() => handleSciBtn('8')}>8</button>
              <button className="btn" onClick={() => handleSciBtn('9')}>9</button>
              <button className="btn btn-op" onClick={() => handleSciBtn('×')}>×</button>

              <button className="btn" onClick={() => handleSciBtn('4')}>4</button>
              <button className="btn" onClick={() => handleSciBtn('5')}>5</button>
              <button className="btn" onClick={() => handleSciBtn('6')}>6</button>
              <button className="btn btn-op" onClick={() => handleSciBtn('−')}>−</button>

              <button className="btn" onClick={() => handleSciBtn('1')}>1</button>
              <button className="btn" onClick={() => handleSciBtn('2')}>2</button>
              <button className="btn" onClick={() => handleSciBtn('3')}>3</button>
              <button className="btn btn-op" onClick={() => handleSciBtn('+')}>+</button>

              <button className="btn btn-zero" onClick={() => handleSciBtn('0')}>0</button>
              <button className="btn" onClick={() => handleSciBtn('.')}>.</button>
              <button className="btn btn-eq" onClick={() => handleSciBtn('=')}>=</button>
            </div>
          </div>
        )}
        {active === 'history' && (
          <div className="glass-calc-ui">
            <div className="calc-display" id="history-display">History</div>
            <button className="btn btn-func history-clear-btn" onClick={() => setHistory([])} style={{margin: '1rem 0', width: '80%'}}>Clear History</button>
            <div className="history-list">
              {history.length === 0 ? (
                <p className="history-empty">No calculations yet.</p>
              ) : (
                history.slice().reverse().map((item, idx) => (
                  <div key={idx} className="history-item" onClick={() => handleHistoryClick(item)} style={{cursor:'pointer'}}>
                    <span>{item.expr} = </span><span style={{color:'#00ffe7'}}>{item.result}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {active === 'memory' && (
          <div className="glass-calc-ui">
            <div className="calc-display" id="memory-display">Memory</div>
            <div className="memory-panel">
              <div className="memory-value">{memory}</div>
              <div className="memory-buttons">
                <button className="btn btn-func" onClick={() => handleMemory('MC')}>MC</button>
                <button className="btn btn-func" onClick={() => handleMemory('MR')}>MR</button>
                <button className="btn btn-func" onClick={() => handleMemory('M+')}>M+</button>
                <button className="btn btn-func" onClick={() => handleMemory('M-')}>M-</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
