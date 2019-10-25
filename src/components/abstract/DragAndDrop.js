import React, { Component } from "react";

class DragAndDrop extends Component {
  dropRef = React.createRef();

  constructor(props) {
    super(props);

    this.state = {
      dragging: false
    };

    this.handleDragIn = this.handleDragIn.bind(this);
    this.handleDragOut = this.handleDragOut.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
  }

  componentDidMount() {
    this.dragCounter = 0;

    let div = this.dropRef.current;
    div.addEventListener("dragenter", this.handleDragIn);
    div.addEventListener("dragleave", this.handleDragOut);
    div.addEventListener("dragover", this.handleDrag);
    div.addEventListener("drop", this.handleDrop);
  }

  componentWillUnmount() {
    let div = this.dropRef.current;
    div.removeEventListener("dragenter", this.handleDragIn);
    div.removeEventListener("dragleave", this.handleDragOut);
    div.removeEventListener("dragover", this.handleDrag);
    div.removeEventListener("drop", this.handleDrop);
  }

  handleDragIn = e => {
    e.preventDefault();
    e.stopPropagation();
    this.dragCounter++;

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({ dragging: true });
    }
  };

  handleDragOut = e => {
    e.preventDefault();
    e.stopPropagation();
    this.dragCounter--;
    if (this.dragCounter > 0) return;
    this.setState({ dragging: false });
  };

  handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();

    this.setState({ dragging: false });
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.props.handleDrop(e.dataTransfer.files);
      e.dataTransfer.clearData();
      this.dragCounter = 0;
    }
  };

  render() {
    return (
      <div
        style={{
          display: "flex",
          position: "relative",
          justifyContent: "center"
        }}
        ref={this.dropRef}
      >
        {this.state.dragging && (
          <div
            style={{
              border: "dashed lightgrey 2px",
              backgroundColor: "rgba(255,255,255,.8)",
              outlineOffset: "-10px",
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9999
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: 0,
                left: 0,
                textAlign: "center",
                color: "grey",
                fontSize: 36,
                transform: "translateY(-50%)"
              }}
            >
              <div>drop here :)</div>
            </div>
          </div>
        )}
        {this.props.children}
      </div>
    );
  }
}

export default DragAndDrop;
