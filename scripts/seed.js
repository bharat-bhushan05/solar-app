// scripts/seed.js
// Simple seed script to populate the `planets` collection in MongoDB.
// Usage: set MONGO_URI (and optionally MONGO_USERNAME, MONGO_PASSWORD), then run:
//    node scripts/seed.js

const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Load .env if present (same simple loader used in app.js)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
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
}

const uri = process.env.MONGO_URI;
if (!uri) {
    console.error('MONGO_URI is required in environment or .env');
    process.exit(1);
}

const planetDocs = [
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

async function run() {
    try {
        await mongoose.connect(uri, {
            user: process.env.MONGO_USERNAME,
            pass: process.env.MONGO_PASSWORD,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        const Schema = mongoose.Schema;
        const dataSchema = new Schema({ name: String, id: Number, description: String, image: String, velocity: String, distance: String });
        const Planet = mongoose.model('planets', dataSchema);

        for (const doc of planetDocs) {
            await Planet.updateOne({ id: doc.id }, { $set: doc }, { upsert: true });
            console.log(`Upserted planet id=${doc.id} name=${doc.name}`);
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (e) {
        console.error('Seeding failed:', e);
        process.exit(1);
    }
}

run();
