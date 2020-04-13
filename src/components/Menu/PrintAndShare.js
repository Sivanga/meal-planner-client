import React from "react";
import ReactToPrint from "react-to-print";
import { Button } from "mdbreact";

const PrintAndShare = ({
  triggerPrintRef,
  componentRef,
  menuId,
  onShareClick,
  triggerShareRef,
  isEditMode
}) => {
  return (
    <>
      <ReactToPrint
        trigger={() => (
          <Button className="meal-plan-btn">
            <i
              className="fa fa-print"
              aria-hidden="true"
              ref={triggerPrintRef}
            ></i>
            {" PRINT"}
          </Button>
        )}
        content={() => componentRef.current}
      />

      {/* Share menu only after it was saved to backend and it has it's unique id*/}
      {menuId && (
        <Button className="meal-plan-btn" onClick={onShareClick}>
          <i className="fas fa-share-alt" ref={triggerShareRef}></i>
          {" SHARE"}
        </Button>
      )}
    </>
  );
};

export default PrintAndShare;
