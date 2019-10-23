import React, { useState } from "react";
import { sendEmailFromForm } from "../firebase";
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBIcon } from "mdbreact";
import { Alert } from "react-bootstrap";
import "../scss/Contact.scss";

const Contact = () => {
  /**
   * Set form values in state
   */
  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  /** Set show succes Alert */
  const [showAlert, setShowAlert] = useState(false);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const sendForm = e => {
    e.preventDefault();
    sendEmailFromForm({ values }).then(res => {
      console.log("sent res: ", res);
      if (res.data && res.data.isEmailSend) {
        setShowAlert(true);
        setValues({ ...values, name: "", email: "", subject: "", message: "" });
      }
    });
  };

  const successAlert = (
    <Alert
      show={showAlert}
      variant="success"
      onClose={() => setShowAlert(false)}
    >
      <p>Thanks for your message!</p>
    </Alert>
  );

  return (
    <MDBContainer>
      {successAlert}
      <MDBRow>
        <MDBCol md="4" className="mx-auto">
          <form>
            <div className="h4 text-center mb-4">Write to us</div>
            <label htmlFor="defaultFormContactNameEx" className="grey-text">
              Your name
            </label>
            <input
              name="name"
              type="text"
              id="defaultFormContactNameEx"
              className="form-control"
              onChange={handleInputChange}
              value={values.name}
            />
            <br />
            <label htmlFor="defaultFormContactEmailEx" className="grey-text">
              Your email
            </label>
            <input
              name="email"
              type="email"
              id="defaultFormContactEmailEx"
              className="form-control"
              onChange={handleInputChange}
              value={values.email}
            />
            <br />
            <label htmlFor="defaultFormContactSubjectEx" className="grey-text">
              Subject
            </label>
            <input
              name="subject"
              type="text"
              id="defaultFormContactSubjectEx"
              className="form-control"
              onChange={handleInputChange}
              value={values.subject}
            />
            <br />
            <label htmlFor="defaultFormContactMessageEx" className="grey-text">
              Your message
            </label>
            <textarea
              name="message"
              type="text"
              id="defaultFormContactMessageEx"
              className="form-control"
              rows="3"
              onChange={handleInputChange}
              value={values.message}
            />
            <div className="text-center mt-4">
              <MDBBtn
                className="contactUsButton"
                outline
                type="submit"
                onClick={sendForm}
              >
                Send
                <MDBIcon far icon="paper-plane" className="ml-2" />
              </MDBBtn>
            </div>
          </form>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default Contact;
