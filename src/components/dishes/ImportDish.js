import React, { useState } from "react";
import { Modal, Form, Button, Row, Col, Spinner, Card } from "react-bootstrap";
import { getDishFromUrl } from "../../firebase";
import NewDish from "./NewDish";
import classNames from "classnames";
import "../../scss/ImportDIsh.scss";
import "../../scss/PlusItem.scss";
import { useAuth } from "../auth/UseAuth";
import LoginAlert from "../auth/LoginAlert";

export const ImportDishType = {
  CARD: 1, // Default
  BUTTON: 2
};

const ImportDish = ({ addDish, allowRedirect, type = ImportDishType.CARD }) => {
  /**
   * Auth hook to get update for changes from auth provider
   */
  const auth = useAuth();

  /**
   *  2 Modals state
   */
  const [modalsShowState, setModalsShowState] = useState({
    import: false,
    new: false,
    login: false
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
      setUrlState({
        ...urlState,
        error: "Invalid Url"
      });
      return;
    }

    setUrlState({
      ...urlState,
      loading: true
    });

    getDishFromUrl(urlState.content).then(result => {
      setUrlState({
        ...urlState,
        loading: false
      });

      // Move to new dish dialog and send the data
      setDishFromUrl({
        name: result.data.name ? result.data.name : "",
        imageUrl: result.data.imageUrl ? result.data.imageUrl : "",
        localImageUrl: result.data.imageUrl ? result.data.imageUrl : "",
        link: urlState.content
      });

      setModalsShowState({
        ...modalsShowState,
        import: false,
        new: true
      });
    });
  };

  const handleCreateYourOwnDish = () => {
    setDishFromUrl(null);
    setModalsShowState({
      ...modalsShowState,
      import: false,
      new: true
    });
  };

  const onDishAdd = dish => {
    addDish(dish);
    setModalsShowState({
      ...modalsShowState,
      new: false
    });
  };

  const onAddClicked = () => {
    // Login if needed
    if (!auth.authState.user || !auth.authState.user.uid) {
      setModalsShowState({
        ...modalsShowState,
        login: true
      });
    } else {
      setModalsShowState({
        ...modalsShowState,
        import: true,
        new: false
      });
    }
  };

  return (
    <>
      <LoginAlert
        showLoginAlert={modalsShowState.login}
        onClose={() =>
          setModalsShowState({
            ...modalsShowState,
            login: false
          })
        }
      />
      <Modal
        show={modalsShowState.import}
        onHide={() =>
          setModalsShowState({
            ...modalsShowState,
            import: false
          })
        }
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
                    setUrlState({
                      ...urlState,
                      content: event.target.value
                    })
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
                <span onClick={() => handleCreateYourOwnDish()}>
                  Or click here to create your own
                </span>
              </Col>
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>
      <Modal
        show={modalsShowState.new}
        onHide={() =>
          setModalsShowState({
            ...modalsShowState,
            new: false
          })
        }
      >
        <Modal.Header className="text-center" closeButton>
          <Modal.Title className="w-100 m-auto">Add new dish</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <NewDish
            onDishAdded={dish => onDishAdd(dish)}
            dish={dishFromUrl}
            edit={true}
            allowRedirect={allowRedirect}
          />
        </Modal.Body>
      </Modal>
      {type && type === ImportDishType.BUTTON && (
        <Button className="meal-plan-btn" onClick={() => onAddClicked()}>
          <i className="far fa-plus-square"></i>
          {" New Dish"}
        </Button>
      )}
      {type === ImportDishType.CARD && (
        <Card className="dish-card">
          <Card.Body>
            <i
              className="fas fa-plus-circle plus-item"
              onClick={() => onAddClicked()}
            />
          </Card.Body>
          <Card.Footer className="create-dish-card-footer">
            Create Dish
          </Card.Footer>
        </Card>
      )}
    </>
  );
};

export default ImportDish;
