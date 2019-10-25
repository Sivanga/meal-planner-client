import React, { Component } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import DragAndDrop from "../abstract/DragAndDrop";
import DishPlaceholder from "../../images/DishPlaceholder.png";
import DishTags from "./DishTags";
import PropTypes from "prop-types";

import "../../scss/NewDish.scss";

class NewDish extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dish: {
        name: null,
        localImageUrl: null,
        imageFile: null,
        recipe: null,
        tags: [],
        sharePublic: true
      },
      errors: {
        name: ""
      }
    };

    this.handleSharePublicClick.bind(this);
  }

  handleNameChange(event) {
    this.setState({
      dish: {
        ...this.state.dish,
        name: event.target.value
      }
    });
  }

  handleRecipeChange(event) {
    this.setState({
      dish: {
        ...this.state.dish,
        recipe: event.target.value
      }
    });
  }

  handleTagChange(tags) {
    this.setState({
      dish: {
        ...this.state.dish,
        tags: tags
      }
    });
  }

  handleDrop(files) {
    var localImageUrl = URL.createObjectURL(files[0]);
    var imageFile = files[0];

    this.setState({
      dish: {
        ...this.state.dish,
        localImageUrl: localImageUrl,
        imageFile: imageFile
      }
    });
  }

  handleSharePublicClick(share) {
    this.setState({
      dish: {
        ...this.state.dish,
        sharePublic: share
      }
    });
  }

  onSubmit(e) {
    e.preventDefault();

    // Check form is valid
    let errors = this.state.errors;

    errors.name =
      this.state.dish.name.length < 3
        ? "Name must be at least 3 characters"
        : "";
    this.setState({ errors: errors });

    if (errors.name.length === 0) {
      this.props.onDishAdded(this.state.dish);
    }

    this.inputOpenFileRef = React.createRef();
  }

  showOpenFileDlg() {
    this.inputOpenFileRef.current.click();
  }

  onFileBrowserClick() {
    this.refs.fileUploader.click();
  }

  render() {
    var imageSrc = DishPlaceholder;
    if (this.state.dish.localImageUrl) {
      imageSrc = this.state.dish.localImageUrl;
    }

    return (
      <Form onSubmit={this.onSubmit.bind(this)} id="newDishForm">
        <Form.Group controlId="dishImage">
          <div className="newDishImageTitle">
            <Form.Label>Drag image or</Form.Label>

            {/** File Uploader without input **/}
            <Form.Label
              className="file-browser"
              onClick={this.onFileBrowserClick.bind(this)}
            >
              &nbsp;click here:
              <input
                style={{ display: "none" }}
                ref="fileUploader"
                type="file"
                accept="image/*"
                onChange={e => {
                  this.handleDrop([...e.target.files]);
                }}
              />
            </Form.Label>
          </div>
          <DragAndDrop handleDrop={this.handleDrop.bind(this)}>
            <div className="dishImage">
              <img src={imageSrc} alt="" />
            </div>
          </DragAndDrop>
        </Form.Group>
        <Form.Group as={Row} controlId="dishName">
          <Form.Label column sm="2">
            Name
          </Form.Label>
          <Col sm="8">
            <Form.Control
              type="text"
              placeholder=""
              onChange={this.handleNameChange.bind(this)}
              required
            />
            {this.state.errors.name.length > 0 && (
              <span className="error">{this.state.errors.name}</span>
            )}
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="dishTags">
          <Form.Label column sm="2">
            Tags
          </Form.Label>
          <Col sm="8">
            <DishTags onChange={this.handleTagChange.bind(this)} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="dishTextArea">
          <Form.Label column sm="2">
            Recipe
          </Form.Label>
          <Col sm="8">
            <Form.Control
              as="textarea"
              onChange={this.handleRecipeChange.bind(this)}
            />
          </Col>
        </Form.Group>
        <Form.Group as={Row} controlId="sharePublic">
          <Form.Label column sm="2">
            Share public
          </Form.Label>
          <Col sm="8">
            <div className="custom-control custom-radio custom-control-inline">
              <input
                type="radio"
                className="custom-control-input"
                id="shareYes"
                name="share"
                defaultChecked
              />
              <label
                className="custom-control-label"
                htmlFor="shareYes"
                onClick={() => this.handleSharePublicClick(true)}
              >
                Yes
              </label>
            </div>

            <div className="custom-control custom-radio custom-control-inline">
              <input
                type="radio"
                className="custom-control-input"
                id="shareNo"
                name="share"
              />
              <label
                className="custom-control-label"
                htmlFor="shareNo"
                onClick={() => this.handleSharePublicClick(false)}
              >
                No
              </label>
              <OverlayTrigger
                placement={"top"}
                overlay={
                  <Tooltip>
                    Share your dish anonymously with our community and get
                    others inspired!
                  </Tooltip>
                }
              >
                <i className="fas fa-question-circle fa-sm"></i>
              </OverlayTrigger>
            </div>
          </Col>
        </Form.Group>
        <Button variant="outline" type="submit" className="btn-new-dish">
          Add
        </Button>
      </Form>
    );
  }
}

NewDish.propTypes = {
  onDishAdded: PropTypes.func
};

export default NewDish;
