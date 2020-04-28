import React, { useState } from "react";
import PropTypes from "prop-types";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { TextField, InputLabel, Chip } from "@material-ui/core";

import "../../scss/DishTags.scss";

const DishTags = ({ tags, onChange }) => {
  const [tagsState, setTagsState] = useState(tags ? tags : []);
  const [suggestions] = useState([
    { name: "Kids" },
    { name: "Chicken" },
    { name: "GlutenFree" },
    { name: "Eggs" },
    { name: "Meat" },
    { name: "Vegeterian" },
    { name: "Vegan" },
    { name: "Feezer" },
    { name: "Favorite" },
    { name: "New" },
    { name: "Hosting" }
  ]);

  const handleOnChange = (event, values) => {
    event.preventDefault();

    // Set up name for each tag
    var tags = [];
    values.map(value => {
      var tag = {};
      tag.name = value;
      tags.push(tag);
    });
    setTagsState(tags);
    onChange(tags);
  };

  return (
    <>
      <InputLabel>Tags:</InputLabel>
      <Autocomplete
        multiple
        disableClearable
        options={suggestions.map(item => item.name)}
        defaultValue={tagsState.map(item => item.name)}
        freeSolo
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={params => (
          <TextField {...params} variant="filled" label="Add new" fullWidth />
        )}
        onChange={(event, newValue) => {
          handleOnChange(event, newValue);
        }}
      />
    </>
  );
};

DishTags.propTypes = {
  onChange: PropTypes.func
};

export default DishTags;
