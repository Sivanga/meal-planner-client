import React, { useState } from "react";
import { sendEmailFromForm } from "../firebase";
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBIcon } from "mdbreact";
import { Alert, Form } from "react-bootstrap";
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

  /**
   *Validate form
   */
  const [validated, setValidated] = useState(false);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleSubmit = event => {
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);
  };

  const sendForm = event => {
    event.preventDefault();

    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
    }

    setValidated(true);
    if (form.checkValidity() === true) {
      sendEmailFromForm({ values }).then(res => {
        console.log("sent res: ", res);
        if (res.data && res.data.isEmailSend) {
          setShowAlert(true);
        }
      });
    }
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
      <p className="email">
        <i className="fas fa-envelope pr-2"></i>
        <a href="mailto:pure.meal.plan@gmail.com">pure.meal.plan@gmail.com</a>
      </p>
      <MDBRow>
        <MDBCol md="4" className="mx-auto">
          <br />
          <Form noValidate validated={validated} onSubmit={sendForm}>
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
            <label htmlFor="defaultFormContactEmailEx" className="grey-text">
              Your email
            </label>

            <input
              required
              name="email"
              type="email"
              id="defaultFormContactEmailEx"
              className="form-control"
              onChange={handleInputChange}
              value={values.email}
            />
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
              required
            />
            <div className="text-center mt-4">
              <MDBBtn className="contactUsButton" outline type="submit">
                Send
                <MDBIcon far icon="paper-plane" className="ml-2" />
              </MDBBtn>
            </div>
          </Form>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default Contact;
