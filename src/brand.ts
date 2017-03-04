import logo = require('file-loader!src/logo.svg');

export function createBrandElement() {
  const brandElement = document.createElement('img');

  brandElement.src = logo;
  brandElement.width = 120;
  brandElement.style.position = 'absolute';
  brandElement.style.right = '10px';
  brandElement.style.top = '10px';

  return brandElement;
}
