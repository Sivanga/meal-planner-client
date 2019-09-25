import React, { Component } from "react";
import { Form, Button } from "react-bootstrap";
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
        sharePublic: false
      },
      errors: {
        name: ""
      }
    };
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

  handleSharePublicToggle() {
    this.setState({
      dish: {
        ...this.state.dish,
        sharePublic: !this.state.sharePublic
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
      <Form onSubmit={this.onSubmit.bind(this)}>
        <Form.Group controlId="dishName">
          <Form.Label>Name:</Form.Label>
          <Form.Control
            type="text"
            placeholder=""
            onChange={this.handleNameChange.bind(this)}
            required
          />
          {this.state.errors.name.length > 0 && (
            <span className="error">{this.state.errors.name}</span>
          )}
        </Form.Group>
        <Form.Group controlId="dishImage">
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
          <DragAndDrop handleDrop={this.handleDrop.bind(this)}>
            <div className="dishImage">
              <img src={imageSrc} alt="" />
            </div>
          </DragAndDrop>
        </Form.Group>
        <Form.Group controlId="dishTags">
          <DishTags onChange={this.handleTagChange.bind(this)} />
        </Form.Group>
        <Form.Group controlId="dishTextArea">
          <Form.Label>Recipe?</Form.Label>
          <Form.Control
            as="textarea"
            onChange={this.handleRecipeChange.bind(this)}
          />
        </Form.Group>
        <Form.Group controlId="sharePublic">
          <Form.Check
            type="checkbox"
            label="Share public?"
            onClick={this.handleSharePublicToggle.bind(this)}
          />
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
