// ui/ui.capture.js
// Simple helper UI module (also exported used by MapUI if needed)
export const UI_Capture = {
  render(target, wild, { onResult } = {}){
    target.innerHTML = '';
    const c = document.createElement('div'); c.className='card';
    c.innerHTML = `<div><strong>${wild.name}</strong> (LV ${wild.level})</div><div><button id="try">Usar bola</button></div>`;
    target.appendChild(c);
    c.querySelector('#try').onclick = () => {
      onResult && onResult(true);
    };
  }
};