import React, { useEffect, useRef, useState } from "react";
import {
  FacebookShareButton,
  WhatsappShareButton,
  PinterestShareButton,
  EmailShareButton,
  FacebookIcon,
  WhatsappIcon,
  PinterestIcon,
  EmailIcon
} from "react-share";
import DishCard, { DishListEnum } from "../dishes/DishCard";
import { Modal } from "react-bootstrap";
import "../../scss/ShareModal.scss";
import classNames from "classnames";
import { storageRef } from "../../firebase.js";
import htmlToImage from "html-to-image";
import { Spinner } from "react-bootstrap";
import { useHistory } from "react-router-dom";

const ShareModal = ({ show, handleHide, days, meals, randomDishes, uid }) => {
  // Used to take a screenshot of the menu
  const componentRef = useRef();

  // USed to save the screenshot of the menu
  const [screenshot, setScreenshot] = useState();

  let history = useHistory();
  const currentUrl =
    process.env.REACT_APP_WEBSITE_URL + history.location.pathname;

  // Get the screenshot of the table and save it to an image for Pinterest
  useEffect(() => {
    if (!componentRef.current || screenshot) return;
    takeScreenshot();
  });

  const takeScreenshot = () => {
    htmlToImage
      .toBlob(componentRef.current, {
        useCORS: true
      })
      .then(function(blob) {
        // Save to backend
        const storageRefChild = storageRef(uid).child(
          "images/menu/" + new Date().getTime()
        );
        storageRefChild.put(blob).then(function(snapshot) {
          storageRefChild.getDownloadURL().then(url => {
            setScreenshot(url);
          });
        });
      });
  };

  const getGridStyle = () => {
    return {
      gridTemplateColumns: "75px 85px 85px 85px 85px 85px 85px 85px"
    };
  };

  return (
    <Modal show={show} onHide={handleHide} size="lg">
      <Modal.Header>Share With:</Modal.Header>
      <Modal.Body className="social-buttons">
        {!screenshot && (
          <div>
            <Spinner animation="grow" role="status" />
            <br />
            Loading...
          </div>
        )}
        {screenshot && (
          <div>
            <PinterestShareButton
              url={currentUrl}
              media={screenshot}
              description="Weekly menu generated by Pure Meal Plan"
            >
              <PinterestIcon size={32} round />
            </PinterestShareButton>
            <FacebookShareButton
              url={currentUrl}
              quote="Check out this weekly menu at Pure Meal Plan"
            >
              <FacebookIcon size={32} round />
            </FacebookShareButton>
            <WhatsappShareButton
              url={currentUrl}
              title="Check out this weekly menu at Pure Meal Plan"
            >
              <WhatsappIcon size={32} round />
            </WhatsappShareButton>
            <EmailShareButton
              subject="Weekly menu by Pure Meal Plan"
              url={currentUrl}
            >
              <EmailIcon size={32} round />
            </EmailShareButton>
          </div>
        )}
      </Modal.Body>
      <div ref={componentRef} style={{ height: "100%" }}>
        <ol className="generateMenuTable shareMenuTable">
          <li className="item-container" style={getGridStyle()}>
            <div key="day/meal" className="attribute">
              Day/Meal
            </div>
            {/* Days headers */}
            {days.map((day, index) => (
              <div
                id="generated-day"
                key={index}
                className={classNames("day-column", "attribute", {
                  dayDisabled: !day.enabled
                })}
              >
                {day.day}
              </div>
            ))}
          </li>

          {/* Meals */}
          {meals.map((meal, mealIndex) => (
            <li
              key={mealIndex}
              className={"item item-container"}
              style={getGridStyle()}
            >
              <div key={mealIndex} className="attribute meal-name">
                {meal.name}
              </div>

              {days.map((day, dayIndex) =>
                day.enabled &&
                randomDishes[mealIndex] &&
                randomDishes[mealIndex][dayIndex] ? (
                  <DishCard
                    key={dayIndex}
                    className={classNames("attribute", {
                      mealDisabled: !day.enabled
                    })}
                    dish={
                      randomDishes[mealIndex]
                        ? randomDishes[mealIndex][dayIndex]
                        : null
                    }
                    dishListEnum={DishListEnum.NO_LIST}
                    isEditMode={false}
                  />
                ) : (
                  <div className={"mealDisabled"} key={dayIndex} />
                )
              )}
            </li>
          ))}
        </ol>
      </div>
    </Modal>
  );
};

export default ShareModal;
