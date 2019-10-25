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
              for my family. Choosing different dishes and building a nutritious
              menu became a chore that took me too much precious time. I needed
              a simple way to build weekly menus using my favorite dishes and
              get inspired to try some new recipes as well.
            </p>
            <p>
              That's when I've decided to build <strong>Pure Meal Plan</strong>.
              This is a platform where you can add your favorite dishes and
              generate weekly menus in a split second! You can also choose to
              try our community favorites dishes and menus.
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
          <img
            src={SpicesImage}
            alt="SpicesImage"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      </div>

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
  );
};

export default About;
