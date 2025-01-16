import React, { Component } from "react";
import CKEditor from "ckeditor4-react";
import { Button, Form } from "react-bootstrap";
import axios from "axios";
import $ from "jquery";
import {} from "jquery.cookie";
import { commonButtonStyle, commonCSS } from './Header';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, transform } from 'ol/proj';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Icon } from 'ol/style';

axios.defaults.withCredentials = true;
const headers = { withCredentials: true };

// 상단에 마커 스타일을 공통으로 정의
const markerStyle = new Style({
  image: new Icon({
    src: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png',
    scale: 0.1,
    anchor: [0.5, 1],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction'
  })
});

class BoardWriteForm extends Component {
  state = {
    data: "",
    address: "",
    coordinates: null
  };

  map = null;
  vectorSource = null;
  vectorLayer = null;

  componentDidMount() {
    if (this.props.location.query !== undefined) {
      this.boardTitle.value = this.props.location.query.title;
      
      // 수정 시 기존 좌표와 주소 정보 설정
      axios
        .post("http://localhost:8080/board/detail", {
          headers,
          _id: this.props.location.query._id
        })
        .then(returnData => {
          if (returnData.data.board[0]) {
            this.setState({
              coordinates: returnData.data.board[0].coordinates,
              address: returnData.data.board[0].address
            }, () => {
              this.initMap();
            });
          }
        })
        .catch(err => {
          console.log(err);
          this.initMap();
        });
    } else {
      this.initMap();
    }
  }

  componentWillMount() {
    if (this.props.location.query !== undefined) {
      this.setState({
        data: this.props.location.query.content
      });
    }
  }

  initMap = () => {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource
    });

    // 초기 중심 좌표 설정 (기존 좌표가 있으면 그 위치, 없으면 대한민국 중심)
    const initialCoordinates = this.state.coordinates ? 
      fromLonLat(this.state.coordinates) : 
      fromLonLat([127.7669, 35.9078]);

    const initialZoom = this.state.coordinates ? 15 : 7;

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        this.vectorLayer
      ],
      view: new View({
        center: initialCoordinates,
        zoom: initialZoom
      })
    });

    // 기존 좌표가 있다면 마커 표시
    if (this.state.coordinates) {
      const feature = new Feature({
        geometry: new Point(fromLonLat(this.state.coordinates))
      });
      feature.setStyle(markerStyle);
      this.vectorSource.addFeature(feature);
    }

    // 클릭 이벤트 처리
    this.map.on('click', async (evt) => {
      const coordinates = transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
      
      // 마커 업데이트
      this.vectorSource.clear();
      const feature = new Feature({
        geometry: new Point(evt.coordinate)
      });
      feature.setStyle(markerStyle);
      this.vectorSource.addFeature(feature);

      // 주소 가져오기
      try {
        const response = await axios.get(
          `http://localhost:8080/api/geocode/reverse`, {
            params: {
              lat: coordinates[1],
              lon: coordinates[0]
            }
          }
        );
        
        this.setState({
          address: response.data.display_name,
          coordinates: coordinates
        });
      } catch (error) {
        console.error('주소 변환 실패:', error);
        alert('주소 변환에 실패했습니다. 다시 시도해주세요.');
      }
    });
  };

  writeBoard = () => {
    let url;
    let send_param;

    const boardTitle = this.boardTitle.value;
    const boardContent = this.state.data;
    const { address, coordinates } = this.state;

    if (boardTitle === undefined || boardTitle === "") {
      alert("글 제목을 입력해주세요.");
      this.boardTitle.focus();
      return;
    } else if (boardContent === undefined || boardContent === "") {
      alert("글 내용을 입력해주세요.");
      return;
    } else if (!coordinates) {
      alert("지도에서 위치를 선택해주세요.");
      return;
    }
    
    if (this.props.location.query !== undefined) {
      url = "http://localhost:8080/board/update";
      send_param = {
        headers,
        "_id": this.props.location.query._id,
        "writer_id": $.cookie("login_id"),
        "title": boardTitle,
        "content": boardContent,
        "coordinates": coordinates,
        "address": address
      };
    } else {
      url = "http://localhost:8080/board/write";
      send_param = {
        headers,
        "_id": $.cookie("login_id"),
        "title": boardTitle,
        "content": boardContent,
        "coordinates": coordinates,
        "address": address
      };
    }

    axios
      .post(url, send_param)
      .then(returnData => {
        if (returnData.data.message) {
          alert(returnData.data.message);
          window.location.href = "/";
        } else {
          alert("글쓰기 실패");
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  onEditorChange = evt => {
    this.setState({
      data: evt.editor.getData()
    });
  };

  render() {
    const divStyle = {
      margin: 50
    };
    const titleStyle = {
      marginBottom: 5
    };
    const mapStyle = {
      width: '100%',
      height: '400px',
      marginTop: '20px',
      marginBottom: '10px'
    };

    return (
      <div style={divStyle} className="App">
        <style>{commonCSS}</style>
        <h2>글쓰기</h2>
        <Form.Control
          type="text"
          style={titleStyle}
          placeholder="글 제목"
          ref={ref => (this.boardTitle = ref)}
        />
        <CKEditor
          data={this.state.data}
          onChange={this.onEditorChange}
        />
        <div id="map" style={mapStyle}></div>
        {this.state.address && (
          <div style={{ marginBottom: '10px' }}>
            선택한 위치: {this.state.address}
          </div>
        )}
        <Button 
          style={commonButtonStyle}
          onClick={this.writeBoard}
          block
        >
          저장하기
        </Button>
      </div>
    );
  }
}

export default BoardWriteForm;
