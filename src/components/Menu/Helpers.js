/** Create a grid with dynamic template columns width depending if the day is disbaled on not 
For disabled days the width will be 80px and for enabled days from 100px to 1fr*/
export const getContainerStyle = days => {
  var disabledColumnWidth = "80px";
  if (window.innerWidth > 425) {
    disabledColumnWidth = "100px";
  }
  if (window.innerWidth > 1024) {
    disabledColumnWidth = "150px";
  }

  var gridColumns = `80px `;
  days.map((day, index) => {
    var width = day.enabled ? `minmax(100px, 1fr)` : `${disabledColumnWidth}`;
    return (gridColumns += ` ${width}`);
  });

  // This is a dummy column = when dragging an item to this row this will
  // make space to the placeholder to be added without overflowing to the next row
  gridColumns += ` 1px`;

  var containerStyle = {
    gridTemplateColumns: gridColumns
  };

  return containerStyle;
};
