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

// Implement stream functions for each service
function streamAirQuality(call) {
    const interval = setInterval(() => {
        const airQualityData = {
            co2Level: Math.round(Math.random() * 2000), // CO2 level between 0 and 2000 ppm
            no2Level: Math.round(Math.random() * 100),  // NO2 level between 0 and 100 ppm
            so2Level: Math.round(Math.random() * 50),   // SO2 level between 0 and 50 ppm
            humidity: Math.round(Math.random() * 100)   // Humidity between 0 and 100 percent
        };
        call.write(airQualityData);
    }, 1000);

    call.on('cancelled', () => {
        clearInterval(interval);
        call.end();
    });
}

function getSunRiskLevel(uvIndex) {
    // Define thresholds for sun risk levels
    const thresholds = [
        { level: "safe", threshold: 2 },
        { level: "low", threshold: 5 },
        { level: "medium", threshold: 7 },
        { level: "high", threshold: 10 },
        { level: "critical", threshold: 12 },
        { level: "extreme", threshold: 15 }
    ];

    // Determine the sun risk level based on UV index
    for (const { level, threshold } of thresholds) {
        if (uvIndex <= threshold) {
            return level;
        }
    }
    return "extreme"; // Default to extreme if UV index is greater than 15
}

function streamSunlightInfo(call) {
    const interval = setInterval(() => {
        const uvIndex = Math.round(Math.random() * 15);  // UV index between 0 and 15
        const temperature = Math.round(Math.random() * 50); // Temperature between 0 and 50°C
        const riskLevel = getSunRiskLevel(uvIndex);
        
        const sunlightData = {
            uvIndex,
            temperature,
            riskLevel
        };
        call.write(sunlightData);
    }, 1000);

    call.on('cancelled', () => {
        clearInterval(interval);
        call.end();
    });
}

function streamWaterQuality(call) {
    const interval = setInterval(() => {
        const waterQualityData = {
            pH: Math.round(Math.random() * 14),             // pH level between 0 and 14
            chlorineLevel: Math.round(Math.random() * 5),   // Chlorine level between 0 and 5 ppm
            fluorideLevel: Math.round(Math.random() * 2),   // Fluoride level between 0 and 2 ppm
            hardnessLevel: Math.round(Math.random() * 200)  // Hardness level between 0 and 200 ppm
        };
        call.write(waterQualityData);
    }, 1000);

    call.on('cancelled', () => {
        clearInterval(interval);
        call.end();
    });
}

// Main function to start the server
function main() {
    const server = new grpc.Server();

    // Add services to the server
    server.addService(airProto.service, { StreamAirQuality: streamAirQuality });
    server.addService(sunProto.service, { StreamSunlightInfo: streamSunlightInfo });
    server.addService(waterProto.service, { StreamWaterQuality: streamWaterQuality });

    // Start the server
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
        if (err) {
            console.error('Error starting server:', err);
        } else {
            console.log('Server started on port:', port);
            console.log('Main server is now connected to client server'); 
        }
    });
}

main();