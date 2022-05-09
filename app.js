const { log } = require('console');
const express = require('express')
const bodyParser = require("body-parser");

const app = express()
const { MongoClient } = require('mongodb');

const csv = require('csv-parser');
const fs = require('fs');
const results = [];

fs.createReadStream('envios_datos.csv')
    .pipe(csv({}))
    .on('data',(data) => results.push(data))
    .on('end', () => {
        console.log(results);
    })


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var url = "mongodb+srv://root:domk6df7lW30Jfrj@cluster0.jwndj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/', function (req, res) {
  res.send('El servidor esta corriendo..')
})

// 1. VER TODA LA INFORMACION EN LA BASE DE DATOS SUBIDA POR CSV
app.get('/data', async function (req, res) {    //Para poder visualizar los datos con el url localhost:3000/data
    const client = new MongoClient(url);
    await client.connect();
    const collection = client.db().collection('taller2');

    const findResult = await collection.find({}).toArray();
    res.send(findResult);
     
})

app.get('/envios/:cod_envio' , async function (req, res) {
    const client = new MongoClient(url);
    await client.connect();
    const collection = client.db().collection('taller2');

    console.log(req.params)


    try{
        let envio = results.filter(envio => {
            if (envio.cod_envio == req.params.cod_envio){
                return envio
            }    

        })

        if (!envio[0]){

            throw new Error(req.params.cod_envio + 'No se ecneuntra')
        }

        res.send(envio)
            
    }catch(err){
        console.log(err)
        res.status(400).send(err)
    }

})

// 2. ENVIAR UN PAQUETE
app.post('/enviar' , async function (req, res) {
    const client = new MongoClient(url);
    await client.connect();
    const collection = client.db().collection('taller2');

    var envio = {
        cod_envio: req.body.cod_envio,
        address_from_name: req.body.from_name,
        address_from_email: req.body.from_email,
        address_from_street1: req.body.from_street,
        address_from_city: req.body.from_city,
        address_from_province: req.body.from_province,
        address_from_postal_code: req.body.from_postal_code,
        address_from_country_code: req.body.from_country_code,
        address_to_name: req.body.to_name,
        address_to_email: req.body.to_email,
        address_to_street1: req.body.to_street,
        address_to_city: req.body.to_city,
        address_to_province: req.body.to_province,
        address_to_postal_code: req.body.to_postal_code,
        address_to_country_code: req.body.to_country_code,
        status: 'En proceso',

    }
    res.send({message: req.body.from_name + " le envia a " + 
                       req.body.to_name + " en al ciudad de " + req.body.to_city + "." +
                       "Su pedido esta " + envio.status})

    collection.insertOne(envio, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted successfully");
    });

})

//3. CONSULTAR EL ESTADO DE UN ENVIO DADO EL CODIGO DE ENVIO
app.post('/estado/:cod_envio' , async function (req, res) {
    const client = new MongoClient(url);
    await client.connect();
    const collection = client.db().collection('taller2');

    console.log(req.params)

    var codigo = {cod_envio: req.params.cod_envio};

    collection.find(codigo).toArray(function(err, estado){
        if (err){
            new Error(req.params.cod_envio + 'No se ecneuntra')
        }

        res.send(estado);
    })  

})

// 4. CAMBIAR ESTADO DE ENVIO
app.post('/cambiar_estado1/:cod_envio' , async function (req, res) {
    const client = new MongoClient(url);
    await client.connect();
    const collection = client.db().collection('taller2');

    console.log(req.params)

    var myquery = { cod_envio: req.params.cod_envio };
    var newvalues = { $set: { status: "En proceso"} };

    res.send({message:"El envio con codigo " + req.params.cod_envio + " ahora tiene estado: " +
                       "En proceso"})

    collection.updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
    });

})

app.post('/cambiar_estado2/:cod_envio' , async function (req, res) {
    const client = new MongoClient(url);
    await client.connect();
    const collection = client.db().collection('taller2');

    console.log(req.params)

    var myquery = { cod_envio: req.params.cod_envio };
    var newvalues = { $set: { status: "En camino"} };

    res.send({message:"El envio con codigo " + req.params.cod_envio + " ahora tiene estado: " +
                       "En camino"})

    collection.updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
    });

})

app.post('/cambiar_estado3/:cod_envio' , async function (req, res) {
    const client = new MongoClient(url);
    await client.connect();
    const collection = client.db().collection('taller2');

    console.log(req.params)

    var myquery = { cod_envio: req.params.cod_envio };
    var newvalues = { $set: { status: "Entregdo"} };

    res.send({message:"El envio con codigo " + req.params.cod_envio + " ahora tiene estado: " +
                       "Entregdo"})

    collection.updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("1 document updated");
    });

})
   

// 5. CONSULTAR TODOS LOS PEDIDOS DADO UN NOMBRE
app.post('/pedidos/:address_from_name' , async function (req, res) {
    const client = new MongoClient(url);
    await client.connect();
    const collection = client.db().collection('taller2');

    console.log(req.params)

    var nombre = {address_from_name: req.params.address_from_name};

    collection.find(nombre).toArray(function(err, pedidos){
        if (err){
            new Error(req.params.address_from_name + 'No se encuentra')
        }

        res.send(pedidos);
    })  

})
    

MongoClient.connect(url, function(err, db) {

    if (err){ 
        throw err;
    }
    else{

        app.listen(5000);

        console.log("Hay conexión!");

         db.db().collection('taller2').count(function (err, count) {
            if (!err && count === 0) {
                db.db()
                .collection('taller2')
                .insertMany(results, (err, res) => {
                    if (err) throw err;
                    console.log(`Se insertaron: ${res.insertedCount} filas`);

                });
            }
        });

        db.close();

    }
    
});



