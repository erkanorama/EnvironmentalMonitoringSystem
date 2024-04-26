const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load proto files
const airProtoPath = path.resolve(__dirname, '..', 'protos', 'air.proto');
const sunProtoPath = path.resolve(__dirname, '..', 'protos', 'sun.proto');
const waterProtoPath = path.resolve(__dirname, '..', 'protos', 'water.proto');

const airPackageDefinition = protoLoader.loadSync(airProtoPath);
const sunPackageDefinition = protoLoader.loadSync(sunProtoPath);
const waterPackageDefinition = protoLoader.loadSync(waterProtoPath);

// Load proto packages
const airProto = grpc.loadPackageDefinition(airPackageDefinition).AirQuality;
const sunProto = grpc.loadPackageDefinition(sunPackageDefinition).Sunlight;
const waterProto = grpc.loadPackageDefinition(waterPackageDefinition).WaterQuality;

// Initialize gRPC clients
const airClient = new airProto('localhost:50051', grpc.credentials.createInsecure());
const sunClient = new sunProto('localhost:50051', grpc.credentials.createInsecure());
const waterClient = new waterProto('localhost:50051', grpc.credentials.createInsecure());

function fetchAirQualityData() {
    console.log('\nFetching Air Quality Data...');
    const call = airClient.StreamAirQuality({});
    call.on('data', (response) => {
        console.log('\nReceived air quality data:');
        console.log('- CO2 Level:', response.co2Level.toFixed(2));
        console.log('- NO2 Level:', response.no2Level.toFixed(2));
        console.log('- SO2 Level:', response.so2Level.toFixed(2));
        console.log('- Humidity:', response.humidity.toFixed(2));
    });
    call.on('error', (error) => {
        console.error('Error fetching air quality data:', error);
    });
    call.on('end', () => {
        console.log('Stream ended');
    });
}

function fetchSunRiskData() {
    console.log('\nFetching Sun Risk Data...');
    const call = sunClient.StreamSunlightInfo({});
    call.on('data', (response) => {
        console.log('\nReceived sun risk data:');
        console.log('- UV Index:', response.uvIndex.toFixed(2));
        console.log('- Temperature:', response.temperature.toFixed(2));
        console.log('- Risk Level:', response.riskLevel);
    });
    call.on('error', (error) => {
        console.error('Error fetching sun risk data:', error);
    });
    call.on('end', () => {
        console.log('Stream ended');
    });
}

function fetchWaterQualityData() {
    console.log('\nFetching Water Quality Data...');
    const call = waterClient.StreamWaterQuality({});
    call.on('data', (response) => {
        console.log('\nReceived water quality data:');
        console.log('- pH Level:', response.pH.toFixed(2));
        console.log('- Chlorine Level:', response.chlorineLevel.toFixed(2));
        console.log('- Fluoride Level:', response.fluorideLevel.toFixed(2));
        console.log('- Hardness Level:', response.hardnessLevel.toFixed(2));
    });
    call.on('error', (error) => {
        console.error('Error fetching water quality data:', error);
    });
    call.on('end', () => {
        console.log('Stream ended');
    });
}

// Call the functions directly upon starting the client
fetchAirQualityData();
fetchSunRiskData();
fetchWaterQualityData();
