import React, { useMemo } from 'react';
import { ALLIANCES, lighterShade } from '../config/alliances';
import './ResultsLegend.css';

function ResultsLegend({ currentIndex, timeline }) {
  const snap = timeline[currentIndex];
  const data = useMemo(() => {
    const map = {}; snap.alliances.forEach(a => { map[a.id] = a; });
    return ALLIANCES.map(a => {
      const d = map[a.id] || { leads: 0, wins: 0 };
      return { id: a.id, color: a.color, lead: lighterShade(a.color, 0.5), wins: d.wins, leads: d.leads };
    });
  }, [snap]);
  return (
    <div className="results-legend">
      <div className="legend-head legend-grid">
        <div className="col-label" />
        <div className="col-center">Wins <i className='winsIcon'></i></div>
        <div className="col-center">Leads</div>
      </div>
      {data.map(d => (
        <div key={d.id} className="legend-row legend-grid">
          <div className="col-label" style={{display:'flex',alignItems:'center',gap:6}}>
            <div className="swatch" style={{ background: d.color }} />
            <span className="label-text">{d.id}</span>
          </div>
          <div className="col-center wins">{d.wins}</div>
          <div className="col-center leads" style={{ color: d.lead }}>{d.leads}</div>
        </div>
      ))}
    </div>
  );
}

export default ResultsLegend;