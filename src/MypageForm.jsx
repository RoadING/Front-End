import React from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import $ from "jquery";
import {} from "jquery.cookie";
import { commonButtonStyle, commonCSS } from './Header';
axios.defaults.withCredentials = true;
const headers = { withCredentials: true };

const MypageForm = () => {
  const divStyle = {
    margin: 50
  };
  const marginBottom = {
    marginBottom : 5
  };
  return (
    <div>
      <style>{commonCSS}</style>
      <Form style={divStyle}>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>email</Form.Label>
          <Form.Control type="email" disabled value={$.cookie("login_email")}/>
          <Form.Label>name</Form.Label>
          <Form.Control type="text" placeholder="Enter email" />
          <Form.Label>password</Form.Label>
          <Form.Control type="password" placeholder="Enter password" />
          <Form.Label>new password</Form.Label>
          <Form.Control type="password" placeholder="Enter New Password" />
          <Form.Label>new password check</Form.Label>
          <Form.Control type="password" placeholder="Enter New Password Check" />
        </Form.Group>
        <Button 
          style={commonButtonStyle}
          onClick={handleSubmit}
          block
        >
          정보 수정
        </Button>
        <Button variant="primary" block>
          회원 탈퇴
        </Button>
      </Form>
    </div>
  );
};

export default MypageForm;
