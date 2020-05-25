import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as express from 'express';
import * as cors from 'cors';

const serviceAccount = require("./clave.json");


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://firestore-goty-5a976.firebaseio.com"
});
const db = admin.firestore();

export const helloWorld = functions.https.onRequest((request, response) => {
    response.json("Hello from Firebase!");
});

export const getGoty = functions.https.onRequest(async (request, response) => {
    const gotyRef = db.collection('goty');
    const docsRef = await gotyRef.get();
    const games = docsRef.docs.map(doc => doc.data());
    response.json(games)
});

const app = express();
app.use(cors());

app.get('/goty', async (req, res) => {
    const gotyRef = db.collection('goty');
    const docsRef = await gotyRef.get();
    const games = docsRef.docs.map(doc => doc.data());
    res.json(games)
});

app.post('/goty/:id', async (req, res) => { 
        const id = req.params.id;
        const gameRef = db.collection('goty').doc(id);
        const gameSnap = await gameRef.get();

        if (!gameSnap) res.status(404) 

        const before = gameSnap.data() || { votes: 0 };
        await gameRef.update({ votes: before.votes +1 });
        res.json({message: `Gracias por tu voto a ${before.name}`})
});

export const api  = functions.https.onRequest(app);