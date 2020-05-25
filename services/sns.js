var AWS = require('aws-sdk');
require("dotenv")
AWS.config.update({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: process.env.region
})

var SNS = new AWS.SNS();

function sendTextMessage(Message, PhoneNumber) {
    var params1 = {
        Message,
        PhoneNumber
    };

    var publishTextPromise = SNS.publish(params1).promise();
    publishTextPromise
        .then(data => { console.log("Message ID is :", data.MessageId); })
        .catch(err => { console.log("err is : ", err); })

}

function sendTextMessageToAll(Message, PhoneNumber) {
    PhoneNumber.filter((v, i) => {
        var params = {
            Message,
            PhoneNumber: PhoneNumber[i]
        };

        var publishTextPromise = SNS.publish(params).promise();
        publishTextPromise
            .then(data => { console.log("Message ID is :", data.MessageId); })
            .catch(err => { console.log("err is : ", err); })
    })
}

exports.modules = {
    sendTextMessage, sendTextMessageToAll
}