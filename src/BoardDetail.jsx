import React, { Component } from "react";
import { Table, Button } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import axios from "axios";
import $ from "jquery";
import { commonButtonStyle, commonCSS } from './Header';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';

axios.defaults.withCredentials = true;
const headers = { withCredentials: true };

class BoardDetail extends Component {
  state = {
    board: []
  };

  showMap = (coordinates) => {
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat(coordinates),
        zoom: 15
      })
    });

    const markerStyle = new Style({
      image: new Icon({
        src: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png',
        scale: 0.1,
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction'
      })
    });

    const marker = new Feature({
      geometry: new Point(fromLonLat(coordinates))
    });
    marker.setStyle(markerStyle);
    vectorSource.addFeature(marker);
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
              <div id="map" style={{ width: '100%', height: '400px', marginBottom: '10px' }}></div>
              {returnData.data.board[0].address && (
                <div style={{ marginBottom: '10px' }}>
                  위치: {returnData.data.board[0].address}
                </div>
              )}
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

          this.setState({ board: board }, () => {
            if (returnData.data.board[0].coordinates) {
              this.showMap(returnData.data.board[0].coordinates);
            }
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
