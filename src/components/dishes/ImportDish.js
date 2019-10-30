import React, { useState } from "react";
import { Modal, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { getDishFromUrl } from "../../firebase";
import NewDish from "./NewDish";
import classNames from "classnames";
import "../../scss/ImportDIsh.scss";

const ImportDish = ({ addDish }) => {
  /**
   *  2 Modals state
   */
  const [modalsShowState, setModalsShowState] = useState({
    import: false,
    new: false
  });

  /** Import urlState */
  const [urlState, setUrlState] = useState({
    content: "",
    error: "",
    loading: false
  });

  /** Dish from url */
  const [dishFromUrl, setDishFromUrl] = useState(null);

  const fetchDishFromUrl = () => {
    if (!urlState.content || urlState.content.length < 1) {
      setUrlState({ ...urlState, error: "Invalid Url" });
      return;
    }

    setUrlState({ ...urlState, loading: true });

    getDishFromUrl(urlState.content).then(result => {
      setUrlState({ ...urlState, loading: false });

      // Move to new dish dialog and send the data
      console.log("result: ", result);
      setDishFromUrl({ name: result.data.name, image: result.data.image });
      setModalsShowState({ import: false, new: true });
    });
  };

  const onDishAdd = dish => {
    addDish(dish);
    setModalsShowState({ new: false });
  };

  return (
    <>
      <Modal
        show={modalsShowState.import}
        onHide={() => setModalsShowState({ import: false })}
      >
        <Modal.Header className="text-center" closeButton>
          <Modal.Title className="w-100 m-auto">
            Import Dish From Url
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group as={Row} controlId="urlState">
              <Form.Label column sm="3">
                Enter URL:
              </Form.Label>
              <Col sm="7">
                <Form.Control
                  type="text"
                  onChange={event =>
                    setUrlState({ ...urlState, content: event.target.value })
                  }
                />
              </Col>
              <Col sm="1">
                <Button
                  variant="outline"
                  className={classNames("import-dish-button", {
                    disabled: urlState.loading
                  })}
                  onClick={() => fetchDishFromUrl()}
                >
                  {urlState.loading && (
                    <Spinner
                      as="span"
                      animation="border"
                      role="status"
                      aria-hidden="true"
                    />
                  )}
                  {urlState.loading ? "" : "GO!"}
                </Button>
                {urlState.error && <div>urlError</div>}
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="manual">
              <Col sm="7" className="create-your-own-button offset-sm-3">
                <span
                  onClick={() =>
                    setModalsShowState({ import: false, new: true })
                  }
                >
                  Or click here to create your own
                </span>
              </Col>
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal
        show={modalsShowState.new}
        onHide={() => setModalsShowState({ new: false })}
      >
        <Modal.Header className="text-center" closeButton>
          <Modal.Title className="w-100 m-auto">Add new dish</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <NewDish onDishAdded={dish => onDishAdd(dish)} dish={dishFromUrl} />
        </Modal.Body>
      </Modal>
      <i
        className="fas fa-plus-circle new-dish"
        onClick={() => setModalsShowState({ import: true, new: false })}
      />
    </>
  );
};

export default ImportDish;