/**
 * Disbale enter from adding new lines
 * @param {onKeyPressed} event
 */
export const disableNewlines = event => {
  const keyCode = event.keyCode || event.which;

  if (keyCode === 13) {
    event.returnValue = false;
    if (event.preventDefault) event.preventDefault();
  }
};
