const MIRRORED_PROPERTIES = [
'box-sizing',
'font-family',
'font-size',
'font-weight',
'font-style',
'letter-spacing',
'line-height',
'text-transform',
'word-spacing',
'padding-top',
'padding-right',
'padding-bottom',
'padding-left',
'border-top-width',
'border-right-width',
'border-bottom-width',
'border-left-width',
'text-indent',
'tab-size'];


let measuringCanvas: HTMLCanvasElement | null = null;

/** Width of a string rendered in the same font as the given element. */
export function measureTextWidth(text: string, element: HTMLElement): number {
  measuringCanvas = measuringCanvas ?? document.createElement('canvas');
  const context = measuringCanvas.getContext('2d');
  if (!context) return 0;
  const computed = window.getComputedStyle(element);
  context.font = `${computed.fontStyle} ${computed.fontWeight} ${computed.fontSize} ${computed.fontFamily}`;
  return context.measureText(text).width;
}

export interface CaretCoordinates {
  left: number;
  top: number;
  height: number;
}

/**
 * Measures where the caret sits inside a textarea by rendering the same text
 * into an offscreen mirror element. Coordinates are relative to the textarea.
 */
export function getCaretCoordinates(
element: HTMLTextAreaElement,
position: number)
: CaretCoordinates {
  const computed = window.getComputedStyle(element);
  const mirror = document.createElement('div');

  MIRRORED_PROPERTIES.forEach((property) => {
    mirror.style.setProperty(property, computed.getPropertyValue(property));
  });
  mirror.style.position = 'absolute';
  mirror.style.top = '0';
  mirror.style.left = '-9999px';
  mirror.style.visibility = 'hidden';
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.overflowWrap = 'break-word';
  mirror.style.width = `${element.clientWidth}px`;

  mirror.textContent = element.value.slice(0, position);

  const marker = document.createElement('span');
  marker.textContent = element.value.slice(position) || '.';
  mirror.appendChild(marker);

  document.body.appendChild(mirror);
  const lineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.6;
  const coordinates: CaretCoordinates = {
    left: marker.offsetLeft,
    top: marker.offsetTop,
    height: lineHeight
  };
  document.body.removeChild(mirror);

  return coordinates;
}