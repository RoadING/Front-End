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
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {Icon, Style} from 'ol/style';
import {fromLonLat, toLonLat} from 'ol/proj';

axios.defaults.withCredentials = true;
const headers = { withCredentials: true };

class BoardWriteForm extends Component {
  state = {
    data: "",
    map: null,
    markerLayer: null,
    selectedLocation: null,
    address: ""
  };

  componentDidMount() {
    if (this.props.location.query !== undefined) {
      this.boardTitle.value = this.props.location.query.title;
    }
    
    // 벡터 레이어 생성
    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource
    });

    // 지도 초기화
    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([126.9779, 37.5665]), // 서울
        zoom: 11
      })
    });

    // 클릭 이벤트 처리
    map.on('click', async (evt) => {
      const coordinate = evt.coordinate;
      const lonLat = toLonLat(coordinate);
      
      // 기존 마커 제거
      vectorSource.clear();
      
      // 새 마커 추가
      const marker = new Feature({
        geometry: new Point(coordinate)
      });
      
      const markerStyle = new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'https://cdn4.iconfinder.com/data/icons/small-n-flat/24/map-marker-512.png',
          scale: 0.1
        })
      });
      
      marker.setStyle(markerStyle);
      vectorSource.addFeature(marker);

      // 역지오코딩 수행
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lon=${lonLat[0]}&lat=${lonLat[1]}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'ko' } }
        );
        
        const address = response.data.display_name;
        this.setState({
          selectedLocation: {
            longitude: lonLat[0],
            latitude: lonLat[1]
          },
          address: address
        });

        // 주소 표시
        document.getElementById('selected-address').innerHTML = `선택된 위치: ${address}`;
      } catch (error) {
        console.error('역지오코딩 에러:', error);
      }
    });

    this.setState({ map, markerLayer: vectorLayer });
  }

  componentWillUnmount() {
    if (this.state.map) {
      this.state.map.setTarget(null);
    }
  }

  componentWillMount() {
    if (this.props.location.query !== undefined) {
      this.setState({
        data: this.props.location.query.content
      });
    }
  }

  writeBoard = () => {
    let url;
    let send_param;
    const boardTitle = this.boardTitle.value;
    const boardContent = this.state.data;
    const { selectedLocation, address } = this.state;
    
    if (boardTitle === undefined || boardTitle === "") {
      alert("글 제목을 입력 해주세요.");
      boardTitle.focus();
      return;
    } else if (boardContent === undefined || boardContent === "") {
      alert("글 내용을 입력 해주세요.");
      boardContent.focus();
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
        "location": selectedLocation,
        "address": address
      };
    } else {
      url = "http://localhost:8080/board/write";
      send_param = {
        headers,
        "_id": $.cookie("login_id"),
        "title": boardTitle,
        "content": boardContent,
        "location": selectedLocation,
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
      marginBottom: '20px'
    };

    const addressStyle = {
      marginTop: '10px',
      marginBottom: '10px',
      padding: '10px',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px'
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
        <div id="selected-address" style={addressStyle}>
        제보하고자 하는 위치를 선택해주세요
        </div>
        <div id="map" style={mapStyle}></div>
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