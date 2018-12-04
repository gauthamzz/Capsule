/**
 *
 * Nucleus
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import './index.css';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectNucleus from './selectors';
import reducer from './reducer';
import saga from './saga';
import { jsPlumb } from "jsplumb";
import dagre from "dagre";
import { Button, Header, Icon, Image, Menu, Segment, Sidebar, Popup, Grid } from 'semantic-ui-react'
import layer from "./keras";
import { Add, Close, FormClose, StatusGood, Trash } from "grommet-icons";

import { compileRequest,getRequest } from './actions';

// import FormLayer from "./sideform"
import {
  Box,
  Button as GButton,
  FormField,
  Grommet,
  Heading,
  Layer,
  Select,
  Text,
  TextInput
} from "grommet";
var layers=[];
var nodesToBeAdded=[];
const JSPLUMB_ID = 'jsplumb_box';
const color = "gray";
const arrowCommon = {
  foldback: 0.5,
  fill: color,
  fillStyle: color,
  width: 14
};
const overlays = [
  ["Arrow", {
    location: 1
  }, arrowCommon]
];

let edges = [
  {
    sourceId: "1",
    targetId: "2",
  },
  {
    sourceId: "2",
    targetId: "3",
  },
  {
    sourceId: "3",
    targetId: "4",
  },
  {
    sourceId: "4",
    targetId: "5",
  },
]

let nodes = [
  {
    id: "1",
    name: 'Node 1',
    style: {
      left:10,
      top:20,
    },
    settings:{
      a:'123'
    }
  },
  {
    id: "2",
    name: 'Node 2',
    style: {
      left:40,
      top:20,
    },
    settings:{
      a:'12321'
    }
  },
  {
    id: "3",
    name: 'Node 3',
    style: {
      left:10,
      top:50,
    },
    settings:{
      a:'1231111'
    }
  },
  {
    id: "4",
    name: 'Node 4',
    style: {
      left:15,
      top:10,
    },
    settings:{
      a:'123456',
      d:'saa'
    }
  },
  {
    id: "5",
    name: 'Node 5',
    style: {
    },
    settings:{
      a:'12356',
      b:'asw'
    }
  },
]
// nodes.map(x => nodeToBeAdded.push(x.id));


const getLayout = (nodes, edges, separation = 30) => {
  const graph = new dagre.graphlib.Graph();
  graph.setGraph({
    marginx: ((document.documentElement.clientWidth || document.body.clientWidth) - 224 - 50 - 240) / 2,
    marginy: 0,
    nodesep: 30,
    rankdir: "TB",
    ranker: "longest-path",
    ranksep: separation,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  nodes.forEach(node => {
    const id = node.id;
    graph.setNode(id, { width: 240, height: 80 });
  });

  edges.forEach(connection => {
    graph.setEdge(connection.sourceId, connection.targetId);
  });

  dagre.layout(graph);
  return graph;
};
const graphNodes = getLayout(nodes, edges);
nodes = nodes.map(node => {
  const location = graphNodes._nodes[node.id];
  let top = node.style ? node.style.top : ''
  let left = node.style ? node.style.left : ''
  return {
    ...node,
    style: {
      left: left ? left : `${location.x}px`,
      top: top ? top : `${location.y}px`,
    },
  };
});

const jsPlumbSettings = {
  Connector: [
    "Flowchart",
    {
      alwaysRespectStubs: true,
      cornerRadius: 20,
      midpoint: 0.5,
      stub: [30, 30],
    },
  ],
  DragOptions: {
    cursor: "pointer",
    zIndex: 2000
  },
  PaintStyle: {
    stroke: color,
    strokeStyle: color,
    lineWidth: 2
  },
  EndpointStyle: {
    radius: 9,
    fill: color,
    fillStyle: color
  },
  HoverPaintStyle: {
    stroke: "#ec9f2e",
    strokeStyle: "#ec9f2e"
  },
  EndpointHoverStyle: {
    fill: "#ec9f2e",
    fillStyle: "#ec9f2e"
  },
  ConnectionOverlays: overlays,
  Container: "canvas"
}



export class Nucleus extends React.Component { // eslint-disable-line react/prefer-stateless-function

  

  state = {
    formOpen:false,
    currentNode:"-1",
    currentNodeObject:{},
    open: false,
    inputval: " ",
    sideform: false,
    visible: false,
    edges,
    nodes,
    jsPlumbInstance: null,
    isJsPlumbInstanceCreated: false,
    dragging: false, // 是否触发画布拖动
    nodeDragging: false, // 是否触发node拖动
    _ratio: 0.25, // 滚轮的比率
    _scale: 1, // 画布缩放比例
    _left: 0, // 画布Left位置
    _top: 0, // 画布Top位置
    _initX: 0, // 拖动按下鼠标时的X位置
    _initY: 0, // 拖动按下鼠标时的Y位置
    data:""
  }

  compile = () =>{
    var nodes = this.state.nodes;
    var edges= this.state.edges;
    this.props.dispatch(compileRequest({ nodes,edges, history }));
  }

  
  getmodel = () =>{
    var id=1;
    this.props.dispatch(getRequest({ id, history }));
  }

  onOpen = (id) => {
    console.log("open");
    this.setState({ open: true });
    this.setState({currentNode:id});
  }
    

  onClose = () => this.setState({ open: false });
  
  addNodeFormOpen = () => {

    for (var key in layer) {
      if (layer.hasOwnProperty(key)) {
          console.log(key + " -> " + layer[key]);
          if(!layers.includes(key)){
            layers.push(key);
          }
      }
    }
    console.log("open");
    this.setState({ formOpen : true });;
  }
    

  addNodeFormClose = () => this.setState({ formOpen: false });

  handleHideClick = () => this.setState({ visible: false })
  handleShowClick = () => this.setState({ visible: true })
  handleSidebarHide = () => this.setState({ visible: false })
  
  changeSettings(event){
    nodes=this.state.nodes;
    // console.log(event.target.value);
    nodes.map(x=>{
      if(x.id===this.state.currentNode){
        x.settings.args=event.target.value;
        // console.log(x.settings[key]);
      }
    })
    this.setState({nodes});
  }
  handleChange(event,id,key) {
    nodes=this.state.nodes;
    // console.log(event.target.value);
    nodes.map(x=>{
      if(x.id===id){
        x.settings[key]=event.target.value;
        // console.log(x.settings[key]);
      }
    })
    this.setState({nodes});
  }


  // 连线事件
  onConnection = (connObj, originalEvent) => {
    if (!originalEvent) {
      return;
    }
    connObj.connection.setPaintStyle({
      stroke: "#8b91a0",
      strokeStyle: "#8b91a0"
    });
    let sourceId = connObj.sourceId;
    let targetId = connObj.targetId;
    this.setState({
      edges: [...this.state.edges, {
        sourceId: sourceId,
        targetId: targetId
      }],
    });
    return false;
  }

  // 删线事件
  onDelConnection = (connObj, originalEvent) => {
    if (!originalEvent) {
      return;
    }
    this.removeConnection(connObj)
    return false;
  }

  // 删除连接线
  removeConnection = (connection) => {
    this.setState({
      edges: this.state.edges.filter(
        (conn) =>
          !(
            conn.sourceId === connection.sourceId &&
            conn.targetId === connection.targetId
          )
      ),
    });
    this.updateParent();
  };

  
  //aswinzzzzz

  RepaintFunction = (id) => {
    console.log("1");
    const jsPlumbInstance = this.state.jsPlumbInstance;
      
    let sourceEndpointStyle = {
      fill: "#dad8d8",
      fillStyle: "#dad8d8"
    };
    let targetEndpointStyle = {
      fill: "#dad8d8",
      fillStyle: "#dad8d8"
    };
    let endpoint = ["Dot", {
      cssClass: "endpointClass",
      radius: 5,
      hoverClass: "endpointHoverClass"
    }];
    let connector = ["Bezier", {
      cssClass: "connectorClass",
      curviness: 50,
      hoverClass: "connectorHoverClass"
    }];
    let connectorStyle = {
      lineWidth: 10,
      stroke: "#15a4fa",
      strokeStyle: "#15a4fa"
    };
    let hoverStyle = {
      stroke: "#1e8151",
      strokeStyle: "#1e8151",
      lineWidth: 2
    };
    let anSourceEndpoint = {
      endpoint: endpoint,
      paintStyle: sourceEndpointStyle,
      hoverPaintStyle: {
        fill: "#449999",
        fillStyle: "#449999"
      },
      isSource: true,
      reattach: true,
      maxConnections: -1,
      Anchor: ["TopCenter"],
      connector: connector,
      connectorStyle: connectorStyle,
      connectorHoverStyle: hoverStyle
    };
    let anTargetEndpoint = {
      endpoint: endpoint,
      paintStyle: targetEndpointStyle,
      hoverPaintStyle: {
        fill: "#449999",
        fillStyle: "#449999"
      },
      isTarget: true,
      reattach: true,
      maxConnections: -1,
      Anchor: ["BottomCenter"],
      connector: connector,
      connectorStyle: connectorStyle,
      connectorHoverStyle: hoverStyle
    };
      //画点
      // let nodes = this.state.nodes
      // for (let i = 0; i < nodes.length; i++) {
        // let nUUID = id;
        // console.log("id is ",typeof(id))
        console.log("2 ",id," ",typeof(id));
        jsPlumbInstance.addEndpoint(id, anSourceEndpoint, {
          uuid: id + "-bottom",
          anchor: "Right",
          maxConnections: -1
        });
        console.log("3");
        jsPlumbInstance.addEndpoint(id, anTargetEndpoint, {
          uuid: id + "-top",
          anchor: "Left",
          maxConnections: -1
        });
        console.log("4");
        jsPlumbInstance.draggable(id);
        console.log("5");
  }

  savePlumb = () => {
    console.log(JSON.stringify(this.state.nodes));
    localStorage.setItem("nodes",JSON.stringify(this.state.nodes));
    localStorage.setItem("edges",JSON.stringify(this.state.edges));
  }
  reloadF = (nodes,edges) => {
    var jsPlumbInstance = this.state.jsPlumbInstance;
    // console.log(jsPlumbInstance.getConnections());
    
    
    this.state.nodes.map(x=>{
      jsPlumbInstance.reset(x.id);
    })
    console.log("1111");
    // nodes=JSON.parse(localStorage.getItem("nodes"));
    // // console.log(localStorage.getItem("nodes"));
    // edges=JSON.parse(localStorage.getItem("edges"));
    this.setState({jsPlumbInstance,nodes,edges},()=>{
    jsPlumbInstance.repaintEverything();
    console.log("22");
    // jsPlumbInstance.getConnections().map(x=>{console.log(x.sourceId," ",x.targetId)});
    this.state.nodes.map(item=>{
      this.RepaintFunction(item.id);
    })
    console.log("3");
    this.state.edges.map(y=>{
      let connection = jsPlumbInstance.connect({
        uuids: [y.sourceId + "-bottom", y.targetId + "-top"],
      });
      connection.setPaintStyle({
        stroke: "#8b91a0",
        strokeStyle: "#8b91a0"
      });
    })
    console.log("4");
    console.log();
    });
  }

  addNode = (type) => {
    var x=_.clone(layer[type]);
    console.log("model ",x);
    var n=_.clone(this.state.nodes);
    var id=this.state.nodes.length+1;
    x.id=id.toString(10);
    name=x.name+"-"+(+new Date).toString(36);
    x.name=name;
    x.style={
      left:x.style.left+50,
      top:20,
    }
    x.settings={args:""};
    n.push(x);
    this.setState({nodes:n});
    nodesToBeAdded.push(x.id);
    this.setState({currentNodeObject:x})
    this.onOpen(x.id);
    this.addNodeFormClose();
  };

  


  componentDidUpdate(oldprops,oldstate){
    // if(this.state.nodes!==oldstate.nodes){
      if(nodesToBeAdded.length!==0){
        var id=nodesToBeAdded.pop();
        // this.state.nodes.map(x=>console.log(x));
        // id=id.toString();
        this.RepaintFunction(id);
      }
      // console.log(this.props.data);
      if(this.props.data!=oldprops.data){
        console.log("done");
        console.log(this.props.data);
        nodes=JSON.parse(this.props.data.nodes);
        console.log(nodes);
        edges=JSON.parse(this.props.data.edges);
        console.log(edges);
        this.reloadF(nodes,edges);
      }
      
      
      
    // }
  }
  // 更新父组件状态
  updateParent = () => {
    if (this.props.onChange) {
      this.props.onChange({
        edges: this.state.edges,
        nodes: this.state.nodes,
      });
    }
  };

  // 绑定父组件传入的事件
  setEventListeners = (jsPlumbInstance) => {
    const eventListeners = this.props.eventListeners
    if (eventListeners && typeof eventListeners === "object" && typeof eventListeners.length === "number") {
      Object.keys(eventListeners).forEach(event => {
        if (typeof eventListeners[event] !== "undefined") {
          jsPlumbInstance.bind(event, eventListeners[event]);
        }
      });
    }
  }

  // 缩放画布
  onCanvasMousewheel = (e) => {
    let self = this.state
    //放大
    if (e.deltaY < 0) {
      this.setState({
        _scale: self._scale + self._scale * self._ratio
      })
    }
    //缩小
    if (e.deltaY > 0) {
      this.setState({
        _scale: self._scale - self._scale * self._ratio
      })
    }
  }

  // node move
  onMouseMove = (e) => {
    if (!this.state.nodeDragging) {
      this.setState({
        nodeDragging: true
      })
    }
  }

  // 拖动画布
  onCanvasMousedown = (e) => {
    this.setState({
      _initX: e.pageX,
      _initY: e.pageY,
      dragging: true
    })
  }

  upDateNode = (options) => {
    let nodesDom = this.refs[JSPLUMB_ID].querySelectorAll('.gui-canvas-node')
    if (options) {
      this.refs[JSPLUMB_ID].style.left = '0px'
      this.refs[JSPLUMB_ID].style.top = '0px'
    }
    options = options || {}
    this.setState({
      ...options,
      nodeDragging: false,
      nodes: this.state.nodes.map((el) => {
        for(let i = 0, l = nodesDom.length; i < l; i++){
          let nodeDom = nodesDom[i]
          if (nodeDom.id == el.id) {
            el.style = {
              top: nodeDom.style.top,
              left: nodeDom.style.left
            }
            break;
          }
        }
        return el
      })
    })
  }

  // 释放画布
  onCanvasMouseUpLeave = (e) => {
    let self = this.state
    
    if (self.dragging) {
      let _left = self._left + e.pageX - self._initX
      let _top = self._top + e.pageY - self._initY

      this.refs[JSPLUMB_ID].style.left = _left + 'px'
      this.refs[JSPLUMB_ID].style.top = _top + 'px'
      this.setState({
        _left,
        _top,
        nodeDragging: false,
        dragging: false
      })
    } else if (self.nodeDragging) {
      // node 的onMouseDown事件被阻止
      this.upDateNode()
    }
  }

  // 移动画布
  onCanvasMousemove = (e) => {
    let self = this.state
    if (!self.dragging) {
      return;
    }
    this.refs[JSPLUMB_ID].style.left = self._left + e.pageX - self._initX + 'px'
    this.refs[JSPLUMB_ID].style.top = self._top + e.pageY - self._initY + 'px'
  }
  
  componentDidMount() {

    jsPlumb.ready(() => {
      const jsPlumbInstance = jsPlumb.getInstance(jsPlumbSettings || {})
      jsPlumbInstance.setContainer(document.getElementById(JSPLUMB_ID));
      jsPlumbInstance.bind("connection", this.onConnection);
      jsPlumbInstance.bind("contextmenu", this.onDelConnection);
      jsPlumbInstance.bind("connectionDetached", this.onDelConnection);
      this.setEventListeners(jsPlumbInstance);

      let sourceEndpointStyle = {
        fill: "#dad8d8",
        fillStyle: "#dad8d8"
      };
      let targetEndpointStyle = {
        fill: "#dad8d8",
        fillStyle: "#dad8d8"
      };
      let endpoint = ["Dot", {
        cssClass: "endpointClass",
        radius: 5,
        hoverClass: "endpointHoverClass"
      }];
      let connector = ["Bezier", {
        cssClass: "connectorClass",
        curviness: 50,
        hoverClass: "connectorHoverClass"
      }];
      let connectorStyle = {
        lineWidth: 10,
        stroke: "#15a4fa",
        strokeStyle: "#15a4fa"
      };
      let hoverStyle = {
        stroke: "#1e8151",
        strokeStyle: "#1e8151",
        lineWidth: 2
      };
      let anSourceEndpoint = {
        endpoint: endpoint,
        paintStyle: sourceEndpointStyle,
        hoverPaintStyle: {
          fill: "#449999",
          fillStyle: "#449999"
        },
        isSource: true,
        reattach: true,
        maxConnections: -1,
        Anchor: ["TopCenter"],
        connector: connector,
        connectorStyle: connectorStyle,
        connectorHoverStyle: hoverStyle
      };
      let anTargetEndpoint = {
        endpoint: endpoint,
        paintStyle: targetEndpointStyle,
        hoverPaintStyle: {
          fill: "#449999",
          fillStyle: "#449999"
        },
        isTarget: true,
        reattach: true,
        maxConnections: -1,
        Anchor: ["BottomCenter"],
        connector: connector,
        connectorStyle: connectorStyle,
        connectorHoverStyle: hoverStyle
      };

      //画点
      let nodes = this.state.nodes
      for (let i = 0; i < nodes.length; i++) {
        let nUUID = nodes[i].id;
        jsPlumbInstance.addEndpoint(nUUID, anSourceEndpoint, {
          uuid: nUUID + "-bottom",
          anchor: "Right",
          maxConnections: -1
        });
        jsPlumbInstance.addEndpoint(nUUID, anTargetEndpoint, {
          uuid: nUUID + "-top",
          anchor: "Left",
          maxConnections: -1
        });
        jsPlumbInstance.draggable(nUUID);
      }


      let edges = this.state.edges
      for (let j = 0; j < edges.length; j++) {
        let connection = jsPlumbInstance.connect({
          uuids: [edges[j].sourceId + "-bottom", edges[j].targetId + "-top"],
        });
        connection.setPaintStyle({
          stroke: "#8b91a0",
          strokeStyle: "#8b91a0"
        });
      }

      this.setState({
        isJsPlumbInstanceCreated: true,
        jsPlumbInstance,
      });
    });

  }

  
  render() {

    let leftArray = [];
    let topArray = [];

    const nodesDom = this.state.nodes.map((node) => {
      const style = node.style || {};

      leftArray.push(parseFloat(style.left || 0));
      topArray.push(parseFloat(style.top || 0));
      // console.log(node.settings.a);
      return <div className="gui-canvas-node"
        onMouseMove={this.onMouseMove}
        key={node.id} style={style} id={node.id}>
        <div className="node-cnt">
          <h3 className="node-title">{node.name}</h3>
          <div className="node-settings">
          <Text>{node.settings.args}</Text>
             <GButton label="Edit" onClick={()=>this.onOpen(node.id)} />
          </div>
       
        </div>
      </div>
    })

    const nodesMap = this.state.nodes.map((node) => {
      return <div className="gui-canvas-node" key={node.id + '_map'} id={node.id + '_map'} style={node.style}>
        <div className="node-cnt">
          <h3 className="node-title">{node.name}</h3>
        </div>
      </div>
    })


    leftArray.sort((a, b) => { return a > b })
    topArray.sort((a, b) => { return a > b })

    let difLeft = leftArray[leftArray.length - 1] - leftArray[0] + 240
    let difTop = topArray[topArray.length - 1] - topArray[0] + 80

    let scale = Math.min(144 / (difLeft), 144 / (difTop))
    let left = 0
    let top = 0

    if (difLeft > difTop) {
      left = -leftArray[0] * scale
      top = -topArray[0] * scale + (144 - difTop * scale) / 2
    } else {
      left = -leftArray[0] * scale + (144 - difLeft * scale) / 2
      top = -topArray[0] * scale
    }

    let translateWidth = (document.documentElement.clientWidth * (1 - this.state._scale)) / 2;
    let translateHeight = ((document.documentElement.clientHeight - 60) * (1 - this.state._scale)) / 2;

    
    return (
      <div className="App">
        <Box justify="center" height="xsmall" align="end">
        <GButton onClick={()=>this.compile()} icon={<Add />} label="Compile" hoverIndicator />
        <GButton onClick={()=>this.savePlumb()} icon={<Add />} label="Save" hoverIndicator />
        <GButton onClick={()=>this.getmodel()} icon={<Add />} label="Load" hoverIndicator />
         <GButton onClick={()=>this.addNodeFormOpen()} icon={<Add />} label="Create" hoverIndicator />
         </Box>
         <Box align="start">
          
          {this.state.formOpen && (
            <Layer
              position="right"
              full="vertical"
              modal
              onClickOutside={()=>this.addNodeFormClose()}
              onEsc={()=>this.addNodeFormClose()}
            >
              <Box
                tag="form"
                fill="vertical"
                overflow="auto"
                width="medium"
                pad="medium"
                onSubmit={()=>this.addNodeFormClose()}
              >
              
              {
                Object.keys(layer).map((key, index) => ( 
                  <Box key={key} align="center" flex={false} direction="row" height="xsmall" justify="center">
                    <Text>{key}</Text>
                    <GButton key={key} label="Create" onClick={()=>this.addNode(key)}/>
                  </Box>
                ))
              }
                
                
                
              </Box>
            </Layer>
          )}
        </Box>

        <Box align="start">
          
          {this.state.open && (
            <Layer
              position="right"
              full="vertical"
              modal
              onClickOutside={()=>this.onClose()}
              onEsc={()=>this.onClose()}
            >
              <Box
                tag="form"
                fill="vertical"
                overflow="auto"
                width="medium"
                pad="medium"
                onSubmit={()=>this.onClose()}
              >
                <Box flex={false} direction="row" justify="between">
                  <Heading level={2} margin="none">
                    {this.state.currentNodeObject.name}
                  </Heading>
                  <Button icon={<Close/>} onClick={()=>this.onClose()} />
                </Box>
                <Box flex="grow" overflow="auto" pad={{ vertical: "medium" }}>
                  <FormField label="args">
                    <TextInput onChange={(event)=>this.changeSettings(event)} value={this.state.currentNodeObject.settings.args}/>
                  </FormField>
                </Box>
                <Box flex={false} tag="footer" align="start">
                  <GButton
                    type="submit"
                    label="Submit"
                    onClick={()=>this.onClose()}
                    primary
                  />
                </Box>
              </Box>
            </Layer>
          )}
        </Box>
        
          <div key={JSPLUMB_ID} className="jsplumb-box"
          onWheel={this.onCanvasMousewheel}
          onMouseMove={this.onCanvasMousemove}
          onMouseDown={this.onCanvasMousedown}
          onMouseUp={this.onCanvasMouseUpLeave}
          onMouseLeave={this.onCanvasMouseUpLeave}
          onContextMenu={(event) => { event.stopPropagation(); event.preventDefault(); }}
        >
          <div className="jsplumb-canvas"
            ref={JSPLUMB_ID}
            id={JSPLUMB_ID}
            style={{
              transformOrigin: '0px 0px 0px',
              transform: `translate(${translateWidth}px, ${translateHeight}px) scale(${this.state._scale})`
            }}
          >
            {
              nodesDom
            }
  
          </div>
        </div>
   
         
        
      </div>
    )
  }
}

Nucleus.propTypes = {
  dispatch: PropTypes.func.isRequired,
};


function mapStateToProps(state) {
  /*eslint-enable */
  return {
    nucleus: makeSelectNucleus(),
    data: state.getIn(['nucleus', 'data']),
  };
}


function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'nucleus', reducer });
const withSaga = injectSaga({ key: 'nucleus', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(Nucleus);
