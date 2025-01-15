import React, { Component } from "react";
import { Table, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import axios from "axios";
import $ from "jquery";
import { commonButtonStyle, commonCSS } from './Header';
axios.defaults.withCredentials = true;
const headers = { withCredentials: true };

class BoardDetail extends Component {
  state = {
    board: [],
    isWriter: false
  };

  componentDidMount() {
    if (this.props.location.query !== undefined) {
      this.getDetail();
    } else {
      window.location.href = "/";
    }
  }

  deleteBoard = _id => {
    const send_param = {
      _id,
      writer_id: $.cookie("login_id")
    };

    if (window.confirm("정말 삭제하시겠습니까?")) {
      axios
        .post("http://localhost:8080/board/delete", send_param)
        .then(returnData => {
          if (returnData.data.success) {
            alert(returnData.data.message);
            window.location.href = "/";
          } else {
            alert(returnData.data.message);
          }
        })
        .catch(err => {
          console.log(err);
          alert("글 삭제 실패");
        });
    }
  };

  getDetail = () => {
    const send_param = {
      headers,
      _id: this.props.location.query._id
    };

    const marginBottom = {
      marginBottom: 5
    };

    axios
      .post("http://localhost:8080/board/detail", send_param)
      .then(returnData => {
        if (returnData.data.board[0]) {
          const isWriter = returnData.data.board[0].writer === $.cookie("login_id");
          
          const board = (
            <div>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>{returnData.data.board[0].title}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      dangerouslySetInnerHTML={{
                        __html: returnData.data.board[0].content
                      }}
                    ></td>
                  </tr>
                </tbody>
              </Table>
              {isWriter && (
                <div>
                  <style>{commonCSS}</style>
                  <NavLink
                    to={{
                      pathname: "/boardWrite",
                      query: {
                        title: returnData.data.board[0].title,
                        content: returnData.data.board[0].content,
                        _id: this.props.location.query._id
                      }
                    }}
                  >
                    <Button style={commonButtonStyle} block>
                      글 수정
                    </Button>
                  </NavLink>
                  <Button
                    style={commonButtonStyle}
                    block
                    onClick={this.deleteBoard.bind(
                      null,
                      this.props.location.query._id
                    )}
                  >
                    글 삭제
                  </Button>
                </div>
              )}
            </div>
          );
          this.setState({
            board: board,
            isWriter: isWriter
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  //onClick={this.getBoard.bind(null,this.props._id)}
  render() {
    const divStyle = {
      margin: 50
    };
    return <div style={divStyle}>{this.state.board}</div>;
  }
}

export default BoardDetail;
