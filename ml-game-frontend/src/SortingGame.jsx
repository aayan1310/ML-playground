import { useEffect, useMemo, useState } from 'react';
import './SortingGame.css';

const CAT_BOX = 'cat';
const DOG_BOX = 'dog';

function SortingGame() {
  const [images, setImages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [assignments, setAssignments] = useState({});
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/ml-playground/dataset.json', { cache: 'no-store' });
        const data = await res.json();
        const all = [...data.train, ...data.test].map((item) => ({ id: item.id, url: `/ml-playground/images/${item.id}.jpg`}));
        setImages(all); setAssignments({}); setSelectedId(null);
      } catch (err) { console.error(err); }
    }
    load();
  }, []);
  const assignedCount = useMemo(() => {
    let cat = 0, dog = 0;
    Object.values(assignments).forEach((box) => { if (box === CAT_BOX) cat++; if (box === DOG_BOX) dog++; });
    return { cat, dog, total: cat + dog };
  }, [assignments]);
  const assignImage = (id, box) => { setAssignments((prev) => (prev[id] ? prev : { ...prev, [id]: box })); setSelectedId(null); };
  const reset = () => { setAssignments({}); setSelectedId(null); };
  const handleDrop = (box, e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id && !assignments[id]) assignImage(id, box); };
  const allowDrop = (e) => e.preventDefault();
  return (
    <div className='sorting-game'>
      <header className='sorting-game-header'>
        <h1 className='sorting-game-title'>ML Playground: Sort the Animals</h1>
        <p className='sorting-game-subtitle'>Sort into Cat and Dog boxes (visual prototype - no real ML)</p>
        <div className='sorting-game-progress'><span>Sorted: {assignedCount.total}/{images.length}</span><span>Cat: {assignedCount.cat}</span><span>Dog: {assignedCount.dog}</span></div>
      </header>
      <main className='sorting-game-main'>
        <section className='sorting-game-panel'>
          <div className='sorting-game-panel-header'><h2 className='sorting-game-panel-title'>Image Collection</h2></div>
          <div className='sorting-game-assistant'><div className='sorting-game-robot'>🤖</div><div className='sorting-game-bubble'><strong>Hi!</strong> Click or drag to sort.</div></div>
          <div className='sorting-game-images-grid'>
            {images.map((img) => {
              const assigned = !!assignments[img.id]; const selected = selectedId === img.id;
              return (
                <div key={img.id} className="sorting-game-image-card" draggable={!assigned}
                  onDragStart={(e) => { if (assigned) return; e.dataTransfer.setData('text/plain', img.id); setSelectedId(img.id); }}
                  onClick={() => { if (assigned) return; setSelectedId(selectedId === img.id ? null : img.id); }}>
                  <img src={img.url} alt={img.id} className='sorting-game-image' />
                  <div className='sorting-game-image-meta'>{img.id}</div>
                </div>
              );
            })}
          </div>
          <div className='sorting-game-actions'>
            {selectedId && !assignments[selectedId] && (<><button className='sorting-game-button' onClick={() => assignImage(selectedId, CAT_BOX)}>Move to CAT</button><button className='sorting-game-button' onClick={() => assignImage(selectedId, DOG_BOX)}>Move to DOG</button></>)}
          </div>
        </section>
        <section className='sorting-game-panel'>
          <div className='sorting-game-panel-header'><h2 className='sorting-game-panel-title'>Sorting Boxes</h2></div>
          <div className='sorting-game-boxes'>
            <div className='sorting-game-box is-cat'>
              <div className='sorting-game-box-header'><h3 className='sorting-game-box-title'>CAT</h3><span className='sorting-game-box-count'>{assignedCount.cat}</span></div>
              <div className='sorting-game-box-body'>
                {Object.entries(assignments).filter(([, box]) => box === CAT_BOX).map(([id]) => {
                  const img = images.find((i) => i.id === id);
                  return (<div key={id} className='sorting-game-image-card'>{img && <img src={img.url} alt={id} className='sorting-game-image' />}<div className='sorting-game-image-meta'>{id}</div></div>);
                })}
                <div className='sorting-game-box-drop' onDrop={(e) => handleDrop(CAT_BOX, e)} onDragOver={allowDrop}>Drop CAT here</div>
              </div>
            </div>
            <div className='sorting-game-box is-dog'>
              <div className='sorting-game-box-header'><h3 className='sorting-game-box-title'>DOG</h3><span className='sorting-game-box-count'>{assignedCount.dog}</span></div>
              <div className='sorting-game-box-body'>
                {Object.entries(assignments).filter(([, box]) => box === DOG_BOX).map(([id]) => {
                  const img = images.find((i) => i.id === id);
                  return (<div key={id} className='sorting-game-image-card'>{img && <img src={img.url} alt={id} className='sorting-game-image' />}<div className='sorting-game-image-meta'>{id}</div></div>);
                })}
                <div className='sorting-game-box-drop' onDrop={(e) => handleDrop(DOG_BOX, e)} onDragOver={allowDrop}>Drop DOG here</div>
              </div>
            </div>
          </div>
          <div className='sorting-game-actions'><button className='sorting-game-button is-ghost' onClick={reset}>Reset</button></div>
          <div className='sorting-game-note'><strong>Note:</strong> Visual prototype only. No real ML training/prediction is running.</div>
        </section>
      </main>
    </div>
  );
}

export default SortingGame;
