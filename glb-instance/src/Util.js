
const link = document.createElement('a');

function save(blob, filename) {
  if (link.href) {
    URL.revokeObjectURL(link.href);
  }

  link.href = URL.createObjectURL(blob);
  link.download = filename || 'data.json';
  link.dispatchEvent(new MouseEvent('click'));
}

export function saveArrayBuffer(buffer, filename) {
  save(new Blob([buffer], { type: 'application/octet-stream' }), filename);
}

export function saveString(text, filename) {
  save(new Blob([text], { type: 'text/plain' }), filename);
}

export function formatNumber(number) {
  return new Intl.NumberFormat('en-us', { useGrouping: true }).format(number);
}
