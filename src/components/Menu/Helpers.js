/** Create a grid with dynamic template columns width depending if the day is disbaled on not 
For disabled days the width will be 70px and for enabled days from 100px to 1fr*/
export const getContainerStyle = days => {
  const disabledColumnWidth = window.innerWidth > 425 ? "120px" : "70px";

  var gridColumns = `70px `;
  days.map((day, index) => {
    var width = day.enabled ? `minmax(100px, 1fr)` : `${disabledColumnWidth}`;
    return (gridColumns += ` ${width}`);
  });

  // This is a dummy column = when dragging an item to this row this will
  // make space to the placeholder to be added without overflowing to the next row
  gridColumns += ` 1px`;
  console.log("gridColumns: ", gridColumns);

  var containerStyle = {
    gridTemplateColumns: gridColumns
  };

  return containerStyle;
};
