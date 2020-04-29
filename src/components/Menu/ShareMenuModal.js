import React, { useState } from "react";
import ReactToPrint from "react-to-print";

import { Modal, Button } from "react-bootstrap";
import "../../scss/ShareModal.scss";
import { useHistory } from "react-router-dom";
import { CopyToClipboard } from "react-copy-to-clipboard";

const ShareMenuModal = ({
  isPrivateMenu,
  show,
  handleHide,
  handleMakePublic,
  triggerPrintRef,
  componentRef
}) => {
  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  let history = useHistory();

  const currentUrl =
    process.env.REACT_APP_WEBSITE_URL + history.location.pathname;

  if (isPrivateMenu) {
    return (
      <Modal show={show} onHide={handleHide}>
        <Modal.Header closeButton>Share Menu</Modal.Header>
        <Modal.Body>
          Anyone with a link to this menu will be able to open it.
        </Modal.Body>
        <Modal.Footer>
          <Button className="meal-plan-btn" onClick={handleHide}>
            Cancel
          </Button>
          <Button className="meal-plan-btn" onClick={handleMakePublic}>
            Ok
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return (
    <Modal show={show} onHide={handleHide} size="lg">
      <Modal.Header closeButton>Menu Link:</Modal.Header>
      <Modal.Body>
        <CopyToClipboard text={currentUrl} onCopy={() => setIsCopiedUrl(true)}>
          <Button className="meal-plan-btn">
            Copy this menu link to clipboard
          </Button>
        </CopyToClipboard>
        {isCopiedUrl ? <span style={{ color: "red" }}>Copied!</span> : null}
        <div style={{ paddingLeft: "0.5rem" }}>
          Or click here to download as PDF:
        </div>
        <ReactToPrint
          trigger={() => (
            <Button className="meal-plan-btn">
              <i
                className="fa fa-print"
                aria-hidden="true"
                ref={triggerPrintRef}
              ></i>
              {" PDF"}
            </Button>
          )}
          content={() => componentRef.current}
        />
      </Modal.Body>
    </Modal>
  );
};

export default ShareMenuModal;
