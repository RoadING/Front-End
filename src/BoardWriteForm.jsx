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
    }
    this.initMap();
  }

  componentWillMount() {
    if (this.props.location.query !== undefined) {
      this.setState({
        data: this.props.location.query.content
      });
    }
  }

  initMap = () => {
    // 벡터 레이어 초기화
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource
    });

    // 지도 초기화 (대한민국 중심)
    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        this.vectorLayer
      ],
      view: new View({
        center: fromLonLat([127.7669, 35.9078]),
        zoom: 7
      })
    });

    // 클릭 이벤트 처리
    this.map.on('click', async (evt) => {
      const coordinates = transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
      
      // 마커 추가
      this.vectorSource.clear();
      const feature = new Feature({
        geometry: new Point(evt.coordinate)
      });
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
  }

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
