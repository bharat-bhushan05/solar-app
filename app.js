const path = require('path');
const express = require('express');
const OS = require('os');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
// Configure Mongoose `strictQuery` behavior. Defaults to `false` to prepare
// for Mongoose v7. You can override via the environment variable
// `MONGOOSE_STRICT_QUERY` (set to "true" or "1" to enable).
if (typeof process.env.MONGOOSE_STRICT_QUERY !== 'undefined') {
    const val = process.env.MONGOOSE_STRICT_QUERY === 'true' || process.env.MONGOOSE_STRICT_QUERY === '1';
    mongoose.set('strictQuery', val);
} else {
    mongoose.set('strictQuery', false);
}
const app = express();
const cors = require('cors')


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));
app.use(cors())

// If a local `.env` file exists, load it into process.env (simple loader, no extra dependency)
const fs = require('fs');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    try {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split(/\r?\n/).forEach(line => {
            const match = line.match(/^\s*([\w\.\-]+)\s*=\s*(.*)?\s*$/);
            if (!match) return;
            let key = match[1];
            let val = match[2] || '';
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            if (process.env[key] === undefined) process.env[key] = val;
        });
    } catch (e) {
        console.error('Failed to read .env file:', e.message);
    }
}


//Connecting to mongodb cloud database
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(process.env.MONGO_URI, {
        user: process.env.MONGO_USERNAME,
        pass: process.env.MONGO_PASSWORD,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, function(err) {
        if (err) {
            console.log("error!! " + err)
        } else {
          //  console.log("MongoDB Connection Successful")
        }
    })
} else {
    console.log('Running in test mode: skipping mongoose.connect()');
}

var Schema = mongoose.Schema;

var dataSchema = new Schema({
    name: String,
    id: Number,
    description: String,
    image: String,
    velocity: String,
    distance: String
});
// In test mode we use an in-memory seed and a minimal findOne implementation
let planetModel;
if (process.env.NODE_ENV === 'test') {
    const planetsSeed = [
        {
            id: 1,
            name: 'Mercury',
            description: 'The smallest planet and closest to the Sun, Mercury has a rocky surface and extreme temperature variations.',
            image: '/images/mercury.png',
            velocity: '47.87 km/s',
            distance: '57.9 million km'
        },
        {
            id: 2,
            name: 'Venus',
            description: 'Venus has a thick, toxic atmosphere and is the hottest planet in the Solar System due to a strong greenhouse effect.',
            image: '/images/venus.png',
            velocity: '35.02 km/s',
            distance: '108.2 million km'
        },
        {
            id: 3,
            name: 'Earth',
            description: 'Our home planet, Earth is the only known world to support life and has a surface mostly covered by water.',
            image: '/images/earth.png',
            velocity: '29.78 km/s',
            distance: '149.6 million km'
        },
        {
            id: 4,
            name: 'Mars',
            description: 'Mars is a cold, desert world with the largest volcano in the Solar System and evidence of past water flows.',
            image: '/images/mars.png',
            velocity: '24.07 km/s',
            distance: '227.9 million km'
        },
        {
            id: 5,
            name: 'Jupiter',
            description: 'The largest planet, Jupiter is a gas giant with a strong magnetic field and dozens of moons.',
            image: '/images/jupiter.png',
            velocity: '13.07 km/s',
            distance: '778.3 million km'
        },
        {
            id: 6,
            name: 'Saturn',
            description: 'Saturn is famous for its extensive ring system made of ice and rock; it is a gas giant like Jupiter.',
            image: '/images/saturn.png',
            velocity: '9.69 km/s',
            distance: '1.43 billion km'
        },
        {
            id: 7,
            name: 'Uranus',
            description: 'An ice giant with a tilted rotation axis, Uranus appears blue-green due to methane in its atmosphere.',
            image: '/images/uranus.png',
            velocity: '6.81 km/s',
            distance: '2.87 billion km'
        },
        {
            id: 8,
            name: 'Neptune',
            description: 'Neptune is a distant ice giant known for strong winds and a deep blue color caused by methane.',
            image: '/images/neptune.png',
            velocity: '5.43 km/s',
            distance: '4.5 billion km'
        }
    ];
    planetModel = {
        findOne: function(query, cb) {
            const p = planetsSeed.find(item => item.id === query.id);
            // simulate async callback
            return process.nextTick(() => cb(null, p));
        }
    };
} else {
    planetModel = mongoose.model('planets', dataSchema);
}



app.post('/planet',   function(req, res) {
   // console.log("Received Planet ID " + req.body.id)
    planetModel.findOne({
        id: req.body.id
    }, function(err, planetData) {
        if (err) {
            console.error("Error fetching planet:", err);
            return res.status(500).json({ error: "Error fetching planet data" });
        }
        if (!planetData) {
            return res.status(404).json({ error: "Planet not found" });
        }
        return res.json(planetData);
    })
})

app.get('/',   async (req, res) => {
    res.sendFile(path.join(__dirname, '/', 'index.html'));
});


app.get('/os',   function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "os": OS.hostname(),
        "env": process.env.NODE_ENV
    });
})

app.get('/live',   function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "live"
    });
})

app.get('/ready',   function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send({
        "status": "ready"
    });
})

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log("Server successfully running on port - " + port);
    })
}

module.exports = app;