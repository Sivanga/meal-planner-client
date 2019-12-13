import React, { Component } from "react";
import ReactTags from "react-tag-autocomplete";
import PropTypes from "prop-types";

import "../../scss/DishTags.scss";

class DishTags extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tags: props.tags ? props.tags : [],
      suggestions: [
        { id: 1, name: "Lunch" },
        { id: 2, name: "Chicken" },
        { id: 3, name: "Breakfast" },
        { id: 4, name: "Dinner" },
        { id: 5, name: "Meat" },
        { id: 6, name: "Vegeterian" },
        { id: 7, name: "Vegan" },
        { id: 8, name: "Feezer" },
        { id: 9, name: "Favorite" },
        { id: 10, name: "New" },
        { id: 11, name: "Desert" }
      ]
    };
  }

  componentDidMount(props) {
    this.props.onChange(this.state.tags);
  }

  handleTagDelete(i) {
    const tags = this.state.tags.slice(0);
    tags.splice(i, 1);
    this.setState({ tags });
    this.props.onChange(tags);
  }

  handleTagAddition(tag) {
    // Set id
    tag.id = this.state.tags.length + 1;
    const tags = [].concat(this.state.tags, tag);
    this.setState({ tags });
    this.props.onChange(tags);
  }

  render() {
    return (
      <ReactTags
        tags={this.state.tags}
        suggestions={this.state.suggestions}
        handleDelete={this.handleTagDelete.bind(this)}
        handleAddition={this.handleTagAddition.bind(this)}
        allowNew={true}
        placeholder="Add new"
        delimiters={["Enter", "Tab", ",", ";"]}
      />
    );
  }
}

DishTags.propTypes = {
  onChange: PropTypes.func
};

export default DishTags;
