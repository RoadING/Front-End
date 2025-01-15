import React, { Component } from "react";
import { Navbar, Button, Image } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import axios from "axios";
import $ from "jquery";
import {} from "jquery.cookie";
axios.defaults.withCredentials = true;
const headers = { withCredentials: true };

// 버튼 스타일을 export
export const commonButtonStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  color: "#F7E3AF",
  borderColor: "#F7E3AF",
  marginTop: "5px"
};

export const commonCSS = `
  .btn:focus {
    box-shadow: 0 0 0 0.2rem rgba(255, 215, 0, 0.25) !important;
  }
  .btn.active {
    background-color: rgba(0, 0, 0, 0.8) !important;
    border-color: #F7E3AF !important;
  }
  .btn:active {
    background-color: rgba(0, 0, 0, 0.8) !important;
    border-color: #F7E3AF !important;
  }
`;

class Header extends Component {
  state = {
    buttonDisplay: "none",
    userName: ""
  };

  componentDidMount() {
    if ($.cookie("login_id")) {
      const userName = $.cookie("login_name");
      this.setState({
        buttonDisplay: "block",
        userName: userName || ""
      });
    } else {
      this.setState({
        buttonDisplay: "none",
        userName: ""
      });
    }
  }

  logout = () => {
    axios
      .get("http://localhost:8080/member/logout", {
        headers
      })
      .then(returnData => {
        if (returnData.data.message) {
          $.removeCookie("login_id");
          alert("로그아웃 되었습니다!");
          window.location.href = "/";
        }
      });
  };
  render() {
    const buttonStyle = {
      margin: "0px 5px 0px 10px",
      display: this.state.buttonDisplay,
      backgroundColor: "#000000",
      color: "#F7E3AF",
      borderColor: "#F7E3AF",
      '&:hover': {
        backgroundColor: "#1a1a1a",
        borderColor: "#FFD700"
      },
      '&:focus': {
        boxShadow: '0 0 0 0.2rem rgba(255, 215, 0, 0.25)'
      }
    };

    const customCSS = `
      .btn:focus {
        box-shadow: 0 0 0 0.2rem rgba(255, 215, 0, 0.25) !important;
      }
      .btn.active {
        background-color: #000000 !important;
        border-color: #FFD700 !important;
      }
      .btn:active {
        background-color: #000000 !important;
        border-color: #FFD700 !important;
      }
      .fixed-nav-container {
        padding-top: 56px;  /* navbar의 높이만큼 패딩 추가 */
      }
    `;

    const userNameStyle = {
      ...buttonStyle,
      backgroundColor: "#FFD700",
      color: "#000000",
      border: "1px solid #000000",
      padding: "6px 12px",
      borderRadius: "4px",
      display: this.state.buttonDisplay
    };

    const navbarStyle = {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      paddingLeft: "20px",
      paddingRight: "20px",
      position: "fixed",
      top: 0,
      width: "100%",
      zIndex: 1000
    };

    const brandStyle = {
      color: "#FFD700"
    };

    const navLinkStyle = {
      textDecoration: "none"
    };

    const contentStyle = {
      marginTop: "56px"
    };

    return (
      <div>
        <style>{customCSS}</style>
        <Navbar style={navbarStyle} variant="dark">
          <Navbar.Brand href="/" style={brandStyle}>
            <b>Road_ING</b> : 도로민원게시판
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <NavLink to="/" style={navLinkStyle}>
              <Button style={buttonStyle} variant="custom">
                전체글보기
              </Button>
            </NavLink>
            <NavLink to="/myposts" style={navLinkStyle}>
              <Button style={buttonStyle} variant="custom">
                내글목록
              </Button>
            </NavLink>
            <NavLink to="/boardWrite" style={navLinkStyle}>
              <Button style={buttonStyle} variant="custom">
                글쓰기
              </Button>
            </NavLink>
            <Button style={buttonStyle} onClick={this.logout} variant="custom">
              로그아웃
            </Button>
            <span style={userNameStyle}>
              {this.state.userName}님
            </span>
          </Navbar.Collapse>
        </Navbar>
        <div style={contentStyle}>
          <Image src="./img/roading main.png" fluid />
        </div>
      </div>
    );
  }
}

export default Header;
