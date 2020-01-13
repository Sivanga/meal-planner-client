import React from "react";
import "../scss/About.scss";
import kaleImage from "../images/kale.jpg";
import SpicesImage from "../images/spices.jpg";
import SivanGalamidiImage from "../images/SivanGalamidi.jpg";

const About = () => {
  return (
    <div id="about" className="container">
      <h4>About Pure Meal Plan</h4>
      <br />

      <div className="row">
        <div className="col-12 col-md-7 main-text">
          <div className="col-12">
            <h5>Eating healthy requires planning</h5>
            <p>
              <strong>Pure Meal Plan</strong> was born from a need to plan ahead
              for my family. Choosing dishes from endless posibilities and
              building a nutritious menu became a chore that took too much of my
              precious time.
            </p>
            <p>
              Lucky me - I'm a software developer and I can build my own tools
              :) So I created <strong>Pure Meal Plan</strong> - a platform to
              add your favorite dishes and generate weekly menus in a split
              second. You can also choose to browse our community favorites
              dishes and menus and get inspired to try new healthy and yummy
              recipes.
            </p>
          </div>
          <div className="col-12">
            <img
              src={kaleImage}
              alt="kaleImage"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>
        <div className="col-12 col-md-5">
          <div className="card card-cascade wider">
            <div className="view view-cascade overlay">
              <img
                className="card-img-top"
                src={SivanGalamidiImage}
                alt="SivanGalamidiImage"
              />
              <a href="#!">
                <div className="mask rgba-white-slight"></div>
              </a>
            </div>

            <div className="card-body card-body-cascade text-center pb-0">
              <h4 className="card-title">
                <strong>Created by:</strong>
              </h4>
              <h5 className="blue-text pb-2">
                <strong>Sivan Galamidi Saitowitz</strong>
              </h5>
              <p className="card-text">
                Software Developer and a Mom of hungry twins!
              </p>
              <div className="social">
                <a
                  className="px-2 fa-lg li-ic fa-sm"
                  href="https://www.linkedin.com/in/sivan-galamidi-00006258/"
                  target="_blank"
                >
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a
                  className="px-2 fa-lg tw-ic fa-sm"
                  href="https://github.com/Sivanga"
                  target="_blank"
                >
                  <i className="fab fa-github"></i>
                </a>
                <a
                  className="px-2 fa-lg fb-ic fa-sm"
                  href="https://www.facebook.com/sivan.galamidi"
                  target="_blank"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="version-code">
        {"Version code: " + process.env.REACT_APP_WEBSITE_VERSION_CODE}
      </div>
    </div>
  );
};

export default About;
