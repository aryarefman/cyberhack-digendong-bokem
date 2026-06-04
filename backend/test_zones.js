import axios from 'axios';

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'admin@aromasys.id',
      password: 'demo123'
    });
    const token = loginRes.data.token;
    
    const dummyFloors = [
      {
        id: 'floor-1',
        name: 'Layout 1',
        customFloorPlan: {
          imageDataUrl: 'data:image/png;base64,iVBORw0KGgo=',
          fileName: 'test.png',
          uploadedAt: new Date().toISOString(),
          zones: []
        },
        interactiveZones: [
          {
            id: 'Z-1234',
            name: 'Test Zone',
            position: { x: 10, y: 10, width: 20, height: 20 },
            hasTempSensor: false,
            hasHumidSensor: false,
            materials: [],
            theme: 'blue',
            zone: 'A'
          }
        ]
      }
    ];

    const res = await axios.put('http://localhost:4000/api/zones', { floors: dummyFloors }, {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log(res.data);
  } catch (err) {
    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

test();
