import React, { Component } from "react";
import { Table } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import axios from "axios";
axios.defaults.withCredentials = true;
const headers = { withCredentials: true };

const maskWriter = (writer) => {
  if (writer.length <= 1) return writer;
  
  const firstChar = writer[0];
  const lastChar = writer[writer.length - 1];
  const maskedMiddle = '*'.repeat(writer.length - 2);
  
  return firstChar + maskedMiddle + lastChar;
};

class BoardRow extends Component {
  render() {
    return (
      <tr>
        <td>
          <NavLink
            to={{ pathname: "/board/detail", query: { _id: this.props._id } }}
          >
            {this.props.createdAt.substring(0, 10)}
          </NavLink>
        </td>
        <td>
          <NavLink
            to={{ pathname: "/board/detail", query: { _id: this.props._id } }}
          >
            {this.props.title}
          </NavLink>
        </td>
        <td>{maskWriter(this.props.writerName)}</td>
      </tr>
    );
  }
}

class AllPostsForm extends Component {
  state = {
    boardList: []
  };

  componentDidMount() {
    this.getAllPosts();
  }

  getAllPosts = () => {
    axios
      .get("http://localhost:8080/board/getAllPosts", { headers })
      .then(returnData => {
        let boardList;
        if (returnData.data.list.length > 0) {
          const boards = returnData.data.list;
          boardList = boards.map(item => (
            <BoardRow
              key={item._id}
              _id={item._id}
              createdAt={item.createdAt}
              title={item.title}
              writerName={item.writer.name}
            />
          ));
          this.setState({
            boardList: boardList
          });
        } else {
          boardList = (
            <tr>
              <td colSpan="3">게시글이 존재하지 않습니다.</td>
            </tr>
          );
          this.setState({
            boardList: boardList
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    const divStyle = {
      margin: 50
    };

    return (
      <div>
        <div style={divStyle}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>날짜</th>
                <th>글 제목</th>
                <th>작성자</th>
              </tr>
            </thead>
            <tbody>{this.state.boardList}</tbody>
          </Table>
        </div>
      </div>
    );
  }
}

export default AllPostsForm; 