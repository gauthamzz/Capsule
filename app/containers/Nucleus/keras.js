var layer = 
    {
        "input":{
            id: "1",
            name: 'Input',
            style: {
              left:10,
              top:20,
            },
            settings:{
              args:"",
              file_name:'temp',
              dimension: ""
              }
        },   
        "model":{
            id: "1",
            name: 'Model',
            style: {
              left:10,
              top:20,
            },
            settings:{
                args:"file_name:asd",
                type:"conv"
            }
        },
        "conv2d":{
            id: "1",
            name: 'Conv2D',
            style: {
              left:10,
              top:20,
            },
            settings:{
                args:"",
            }
        },
        "dropout":{
            id: "1",
            name: 'Dropout',
            style: {
              left:10,
              top:20,
            },
            settings:{
                args:"",
            }
        },
        "flatten":{
            id: "1",
            name: 'Flatten',
            style: {
              left:10,
              top:20,
            },
            settings:{
                args:"",
            }
        },
        "dense":{
            id: "1",
            name: 'Dense',
            style: {
              left:10,
              top:20,
            },
            settings:{
                args:"",
            }
        },
        "maxpooling2d":{
            id: "1",
            name: 'MaxPooling2D',
            style: {
              left:10,
              top:20,
            },
            settings:{
                args:"",
            }
        },
    }


export default layer;