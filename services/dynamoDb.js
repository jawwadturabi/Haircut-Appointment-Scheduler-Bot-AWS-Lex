var AWS = require('aws-sdk');
require("dotenv")
AWS.config.update({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: process.env.region
})

var dynamodb = new AWS.DynamoDB();

function create_update(params) {
    let [phone_number, firstName, lastName, appointmentType, typeOfHaircut, date, time] = [params[0], params[1], params[2], params[3], params[4], params[5], params[6]]
    var params1 = {
        TableName: 'Scheduled-appointments',
        Item: {
            phone_number: {
                S: phone_number
            },
            first_name: {
                S: firstName
            },
            last_name: {
                S: lastName
            },
            appointment_type: {
                S: appointmentType
            },
            type_of_haircut: {
                S: typeOfHaircut
            },
            date: {
                S: date
            },
            time: {
                S: time
            }
        },
    }
    var putItem = dynamodb.putItem(params1).promise();
    putItem
        .then(data => { console.log("Created data is :", data); })
        .catch(err => { console.log("err is : ", err); })
}

function read(params, TableName) {
    let info;
    var params1 = {
        TableName,
        Key: {
            phone_number: {
                S: params
            }
        }
    }
    dynamodb.getItem(params1, function (err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            process.exit()
        }
        else {
            if (Object.keys(data).length != 0) {
                info = data
                console.log("data is :", data.Item);
            }
            else {
                info = data // when data is {}
                console.log("no data");           // successful response
            }
        }
    });
    while (info == undefined) {
        require('deasync').runLoopOnce();
    }
    console.log("info is :", info)
    return info
}

function delete_resources(params) {
    let info;
    var params1 = {
        TableName: 'Scheduled-appointments',
        Key: {
            phone_number: {
                S: params
            },
        },
        ReturnValues: "ALL_OLD"
    }
    dynamodb.deleteItem((params1), (err, data) => {
        if (err) console.log(err)
        else {
            info = data
            console.log("deleted data is :", data);
        }
    })

    while (info == undefined) {
        require('deasync').runLoopOnce();
    }
    return info
}

function scanDateTime(date, time) {
    let detail;
    let params = {
        ExpressionAttributeNames: {
            "#D": "date",
            "#T": "time"
        },
        TableName: 'Scheduled-appointments',
        ProjectionExpression: '#T,#D'
    }
    dynamodb.scan(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            if (data.Items) {
                detail = []
                data.Items.filter(T => {
                    if (T.time.S == time && T.date.S == date) {
                        detail.push('time already reserved')
                    }
                    else {
                        detail.push('time available')

                    }
                })
            }
            else {
                detail = []
                console.log("data is empty")
            }
        }
    });
    while (detail == undefined) {
        require('deasync').runLoopOnce();
    }
    return detail
}

function scanPhoneNumber() {
    let detail;
    let params = {
        ExpressionAttributeNames: {
            "#P": "phone_number"
        },
        TableName: 'Appointment-Schedular-Contacts',
        ProjectionExpression: '#P'
    }
    dynamodb.scan(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
            if (data.Items) {
                detail = []
                data.Items.filter(T => {
                    detail.push(T.phone_number.S)
                })
            }
            else {
                detail = []
                console.log("data is empty")
            }
        }
    });
    while (detail == undefined) {
        require('deasync').runLoopOnce();
    }
    return detail
}

function create(params) {
    let [phone_number, firstName, lastName, appointmentType, typeOfHaircut, date, time] = [params[0], params[1], params[2], params[3], params[4], params[5], params[6]]
    var params1 = {
        RequestItems: {
            "Scheduled-appointments": [
                {
                    PutRequest: {
                        Item: {
                            phone_number: {
                                S: phone_number
                            },
                            first_name: {
                                S: firstName
                            },
                            last_name: {
                                S: lastName
                            },
                            appointment_type: {
                                S: appointmentType
                            },
                            type_of_haircut: {
                                S: typeOfHaircut
                            },
                            date: {
                                S: date
                            },
                            time: {
                                S: time
                            }
                        }
                    }
                }
            ],
            "Appointment-Schedular-Contacts": [
                {
                    PutRequest: {
                        Item: {
                            phone_number: {
                                S: phone_number
                            },
                            first_name: {
                                S: firstName
                            },
                            last_name: {
                                S: lastName
                            }
                        }
                    }
                }
            ]

        }
    };
    dynamodb.batchWriteItem(params1, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data)
    })
}


exports.modules = {
    create_update, read, delete_resources, scanDateTime, scanPhoneNumber, create
}