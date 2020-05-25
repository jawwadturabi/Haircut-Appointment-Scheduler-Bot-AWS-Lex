'use strict'
const functions = require('./helperfunctions/functions.js').modules
const sns = require('./services/sns.js').modules;
const dynamodb = require('./services/dynamoDb.js').modules;
//https://lex-web-ui-codebuilddeploy-dt3corkni-webappbucket-gknbb9ds8f5g.s3.us-east-1.amazonaws.com/index.html

function dispatch(intentRequest, callback) {
    console.log(`request received for userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);
    let sessionAttributes = intentRequest.sessionAttributes;
    const slots = intentRequest.currentIntent.slots;
    const dialogState = intentRequest.recentIntentSummaryView ? intentRequest.recentIntentSummaryView[0].dialogActionType : undefined;
    const confirmationStatus = intentRequest.currentIntent.confirmationStatus;
    console.log(`intent request is : ", ${dialogState} , invocation source = ${confirmationStatus}`)
    switch (intentRequest.currentIntent.name) {

        case 'MakeAppointment':
            {
                let [intentName, phoneNumber, firstName, lastName, appointmentType, typeOfHaircut, date, time] = ['MakeAppointment', slots.phone_number, slots.firstName, slots.lastName, slots.AppointmentType, slots.type_of_haircut, slots.Date, slots.Time];
                sessionAttributes = {
                    contact: phoneNumber,
                    appointment: appointmentType,
                    haircut_type: typeOfHaircut,
                    name1: firstName,
                    name2: lastName,
                    date_time: date,
                    timing: time
                }
                if (!phoneNumber) {
                    let content = "Please tell me your phone number"
                    callback(functions.elicitSlotSimple(sessionAttributes, content, intentName, slots, "phone_number"))
                }
                else if (!firstName) {
                    let params = '+1' + phoneNumber
                    let data = dynamodb.read(params, 'Scheduled-appointments')
                    let data1 = dynamodb.read(params, 'Appointment-Schedular-Contacts')
                    if (data.Item) {
                        let params1 = {
                            firstName: data.Item.first_name.S,
                            lastName: data.Item.last_name.S,
                            appointmentType: data.Item.appointment_type.S,
                            typeOfHaircut: data.Item.type_of_haircut.S,
                            date: data.Item.date.S,
                            time: data.Item.time.S
                        }
                        callback(functions.Delegate(params1, slots))
                    }
                    else if (data1.Item) {
                        phoneNumber = (data1.Item.phone_number.S).slice(2)
                        firstName = data1.Item.first_name.S
                        lastName = (data1.Item.last_name.S !== 'Empty') ? " " + data1.Item.last_name.S : ""
                        let params = { phoneNumber, firstName, lastName }
                        let content = `Welcome back ${firstName}${lastName}. Please tell me the type of appointment you would like to schedule`
                        let title = `Specify Appointment type`;
                        let buttons = [
                            {
                                text: "Men's Haircut",
                                value: "Men Haircut"
                            },
                            {
                                text: "Women's Haircut",
                                value: "Women Haircut"
                            },
                            {
                                text: "Teen's Haircut",
                                value: "Teens Haircut"
                            },
                            {
                                text: "Kid's Haircut",
                                value: "Kids Haircut"
                            }
                        ];
                        callback(functions.elicitSlotCardParam(sessionAttributes, content, intentName, slots, params, "AppointmentType", title, buttons))
                    }
                    else {
                        let content = "What is your good name? (e.g. John Alex)"
                        callback(functions.elicitSlotSimple(sessionAttributes, content, intentName, slots, "firstName"))
                    }
                }

                else if (!appointmentType) {
                    // let params = '+1' + phoneNumber;
                    // let data = dynamodb.read(params, 'Appointment-Schedular-Contacts');
                    let content = `What type of appointment would you like to schedule?`;
                    let title = `Specify Appointment type`;
                    let buttons = [
                        {
                            text: "Men's Haircut",
                            value: "Men Haircut"
                        },
                        {
                            text: "Women's Haircut",
                            value: "Women Haircut"
                        },
                        {
                            text: "Teen's Haircut",
                            value: "Teens Haircut"
                        },
                        {
                            text: "Kid's Haircut",
                            value: "Kids Haircut"
                        }
                    ];
                    callback(functions.elicitSlotCard(sessionAttributes, content, intentName, slots, "AppointmentType", title, buttons))
                }

                else if (!typeOfHaircut) {

                    let content = `What type of ${appointmentType} would you like?`;
                    let title = `Please specify the type of ${appointmentType}`;
                    let buttons = [
                        {
                            text: "Regular Haircut ($15)",
                            value: "Regular Haircut"
                        },
                        {
                            text: "Edge up ($7)",
                            value: "Edge up"
                        },
                        {
                            text: "Special Cuts ($20)",
                            value: "Special Cuts"
                        }
                    ]
                    callback(functions.elicitSlotCard(sessionAttributes, content, intentName, slots, "type_of_haircut", title, buttons))
                }

                else if (!date) {
                    let content = `An appointment of ${appointmentType} will take about 30 minutes. What day works best for you? We are available from Mon-Sat.`
                    callback(functions.elicitSlotSimple(sessionAttributes, content, intentName, slots, "Date"))

                }

                else if (!time) {
                    let content = `At what time on ${date} you want this appointment? You can select time between 7 pm to 02:30 am`
                    callback(functions.elicitSlotSimple(sessionAttributes, content, intentName, slots, "Time"))
                }

                else {
                    phoneNumber = '+1' + phoneNumber
                    let data = dynamodb.read(phoneNumber, 'Scheduled-appointments')
                    if (!data.Item) {
                        if (confirmationStatus == 'Confirmed') {
                            console.log("data not exist")
                            firstName = functions.titleCase(firstName);
                            lastName = lastName ? functions.titleCase(lastName) : "Empty";
                            sessionAttributes = {
                                contact: phoneNumber,
                                appointment: appointmentType,
                                haircut_type: typeOfHaircut,
                                name1: firstName,
                                name2: lastName,
                                date_time: date,
                                timing: time
                            }
                            callback(functions.close(sessionAttributes, 'Fulfilled'))

                            let message = `Hey ${firstName}, Your ${appointmentType} Appointment on ${functions.getDate(date)} at ${time} has been successfully booked. We are very excited to see you.`;
                            sns.sendTextMessage(message, phoneNumber);

                            let params = [phoneNumber, firstName, lastName, appointmentType, typeOfHaircut, date, time]
                            dynamodb.create(params)
                        }
                        else if (confirmationStatus == 'Denied') {
                            let content = "Okay, No issue come again anytime when you want to book."
                            callback(functions.close_message(sessionAttributes, 'Failed', content))
                        }
                        else {
                            let data = dynamodb.scanDateTime(date, time)
                            if (data.includes('time already reserved')) {
                                let content = `Sorry, Appointment for ${date} at ${time} is not available. Please try selecting other time`
                                callback(functions.elicitSlotSimple(sessionAttributes, content, intentName, slots, "Time"))
                            }
                            else {
                                let content = `Appointment for ${date} at ${time}. is available.`
                                let title = `Should I go ahead and book it?`
                                let buttons = [
                                    {
                                        text: "Yes",
                                        value: "yes"
                                    },
                                    {
                                        text: "No",
                                        value: "no"
                                    },
                                ]
                                callback(functions.confirmIntent(sessionAttributes, content, intentName, slots, title, buttons))
                            }
                        }
                    }
                    else {
                        console.log("data exist")
                        let content = `Welcome back ${firstName}, You have already booked your appointment for ${appointmentType} on ${functions.getDate(date)} at ${time}. Do you want to cancel or update your appointment. \n\nFor cancellation or updation speak or type "cancel" or "update." `
                        callback(functions.close_message(sessionAttributes, 'Fulfilled', content))
                    }
                }
            }
            break;

        case 'Cancellations':

            {
                let [intentName, phoneNumber, firstName, lastName, appointmentType, typeOfHaircut, date, time] = ['Cancellations', sessionAttributes.contact, sessionAttributes.name1, sessionAttributes.name2, sessionAttributes.appointment, sessionAttributes.haircut_type, sessionAttributes.date_time, sessionAttributes.timing]

                if (!phoneNumber && !slots.phone_number) {
                    let content = "Please tell me your phone number"
                    callback(functions.elicitSlotSimple(sessionAttributes, content, intentName, slots, "phone_number"))
                }

                else if (firstName) {
                    if (confirmationStatus == 'Confirmed') {

                        let message = `Dear ${firstName}, Your Appointment for ${appointmentType} on ${functions.getDate(date)} at ${time} has been cancelled . Come again when you want to reserve your appointment.`;
                        sns.sendTextMessage(message, phoneNumber);

                        let params = phoneNumber;
                        let openSlot = dynamodb.delete_resources(params);

                        let contactList = dynamodb.scanPhoneNumber()
                        //
                        message = `Hi, There is an opening slot on ${functions.getDate(openSlot.Attributes.date.S)} at ${openSlot.Attributes.time.S} is available for booking your Appointment, You have 30sec to book the appointment for this week.`;
                        sns.sendTextMessageToAll(message, contactList);
                        callback(functions.close(sessionAttributes, 'Fulfilled'))
                    }
                    else if (confirmationStatus == 'Denied') {
                        let content = "Okay, Your Appointment has not cancelled and it is still available"
                        callback(functions.close_message(sessionAttributes, 'Failed', content))
                    }
                    else {
                        console.log("else else")
                        let content = `We are about to cancel your Appointment.`
                        let title = `Are sure you want to cancel this Appointment.`
                        let buttons = [
                            {
                                text: "Yes",
                                value: "yes"
                            },
                            {
                                text: "No",
                                value: "no"
                            }
                        ];
                        callback(functions.confirmIntent(sessionAttributes, content, intentName, slots, title, buttons));
                    }
                }

                else {
                    let phoneNumber = '+1' + slots.phone_number
                    let data = dynamodb.read(phoneNumber, 'Scheduled-appointments')
                    let data1 = dynamodb.read(phoneNumber, 'Appointment-Schedular-Contacts')
                    if (data.Item) {
                        console.log("else without data")
                        firstName = data.Item.first_name.S
                        lastName = data.Item.last_name.S
                        appointmentType = data.Item.appointment_type.S
                        typeOfHaircut = data.Item.type_of_haircut.S
                        date = data.Item.date.S
                        time = data.Item.time.S;
                        if (confirmationStatus == 'Confirmed') {
                            let message = `Dear ${firstName}, Your Appointment for ${appointmentType} on ${date} at ${time} has been cancelled . Come again when you want to reserve your appointment.`;
                            sns.sendTextMessage(message, phoneNumber);

                            let openSlot = dynamodb.delete_resources(phoneNumber)

                            let contacts = dynamodb.scanPhoneNumber()
                            message = `Hi, There is an opening slot of ${functions.getDate(openSlot.Attributes.date.S)} at ${openSlot.Attributes.time.S} is available for booking your Appointment, You have 30sec to book the appointment for this week.`;
                            console.log("message : ", message)
                            sns.sendTextMessageToAll(message1, contacts);

                            callback(functions.close(sessionAttributes, 'Fulfilled'))
                        }
                        else if (confirmationStatus == 'Denied') {
                            let content = "Okay, Your Appointment has not cancelled and it is still available"
                            callback(functions.close_message(sessionAttributes, 'Failed', content))
                        }
                        else {
                            console.log("else else")
                            let content = `Hey ${firstName}, We are about to cancel your Appointment.`
                            let title = `Are sure you want to cancel this Appointment.`
                            let buttons = [
                                {
                                    text: "Yes",
                                    value: "yes"
                                },
                                {
                                    text: "No",
                                    value: "no"
                                }
                            ];
                            callback(functions.confirmIntent(sessionAttributes, content, intentName, slots, title, buttons));
                        }
                    }
                    else if (data1.Item && !data.Item) {
                        firstName = data1.Item.first_name.S
                        let content = `Hey ${firstName} you do not have any Appointments. Please type or say "book it" to reserve your appointment`
                        callback(functions.close_message(sessionAttributes, 'Fulfilled', content))
                    }
                    else {
                        let content = `You have not book any Appointment. Please type or say "book it" to reserve your appointment`
                        callback(functions.close_message(sessionAttributes, 'Fulfilled', content))
                    }
                }

                break;
            }


        case 'Updation':

            {
                let [intentName, phoneNumber, appointmentType, typeOfHaircut, date, time, firstName, lastName] = ['Updation', sessionAttributes.contact, slots.AppointmentType, slots.type_of_haircut, slots.Date, slots.Time, sessionAttributes.name1, sessionAttributes.name2]
                sessionAttributes = {
                    contact: phoneNumber,
                    appointment: appointmentType,
                    haircut_type: typeOfHaircut,
                    name1: firstName,
                    name2: lastName,
                    date_time: date,
                    timing: time
                }
                if (!phoneNumber && !slots.phone_number) {
                    let content = "Please tell me your phone number"
                    callback(functions.elicitSlotSimple(sessionAttributes, content, intentName, slots, "phone_number"))
                }

                else if (firstName) {
                    let params1 = {
                        phoneNumber,
                        firstName,
                        lastName,
                        appointmentType,
                        typeOfHaircut,
                        date,
                        time
                    }
                    callback(functions.Delegate(params1, slots))
                }

                else if (!appointmentType) {
                    let params = '+1' + phoneNumber;
                    let data = dynamodb.read(params, 'Scheduled-appointments');
                    let data1 = dynamodb.read(params, 'Appointment-Schedular-Contacts')
                    let content;
                    if (data.Item && !firstName) {
                        content = `Welcome back ${data.Item.first_name.S}. Please tell me the type of appointment you like to schedule`
                    }
                    else if (data1.Item && !data.Item) {
                        firstName = data1.Item.first_name.S
                        let content = `Hey ${firstName} you do not have any Appointments. Please type or say "book it" to reserve your appointment`
                        callback(functions.close_message(sessionAttributes, 'Fulfilled', content));
                    }
                    else {
                        content = `What type of appointment would you like to schedule?`
                    }
                    let title = `Specify Appointment type`;
                    let buttons = [
                        {
                            text: "Men's Haircut",
                            value: "Men Haircut"
                        },
                        {
                            text: "Women's Haircut",
                            value: "Women Haircut"
                        },
                        {
                            text: "Teen's Haircut",
                            value: "Teens Haircut"
                        },
                        {
                            text: "Kid's Haircut",
                            value: "Kids Haircut"
                        }
                    ];
                    callback(functions.elicitSlotCard(sessionAttributes, content, intentName, slots, "AppointmentType", title, buttons))
                }

                else if (!typeOfHaircut) {

                    let content = `What type of ${appointmentType} would you like?`;
                    let title = `Please specify the type of ${appointmentType}`;
                    let buttons = [
                        {
                            text: "Regular Haircut ($15)",
                            value: "Regular Haircut"
                        },
                        {
                            text: "Edge up ($7)",
                            value: "Edge up"
                        },
                        {
                            text: "Special Cuts ($20)",
                            value: "Special Cuts"
                        }
                    ]
                    callback(functions.elicitSlotCard(sessionAttributes, content, intentName, slots, "type_of_haircut", title, buttons))
                }

                else if (!date) {
                    let content = `An appointment of ${appointmentType} will take about 30 minutes. What day works best for you? We are available from Mon-Sat.`
                    callback(functions.elicitSlotSimple(sessionAttributes, content, intentName, slots, "Date"))

                }

                else if (!time) {
                    let content = `At what time on ${date} you want this appointment? You can select time between 7 pm to 02:30 am`
                    callback(functions.elicitSlotSimple(sessionAttributes, content, intentName, slots, "Time"))
                }

                else {
                    let data = dynamodb.scanDateTime(date, time)
                    if (data.includes('time already reserved')) {
                        let content = `Sorry, Appointment for ${date} at ${time} is not available. Please try selecting other time`
                        callback(functions.elicitSlotSimple(sessionAttributes, content, intentName, slots, "Time"))
                    }
                    else {
                        let message = `Hey ${firstName}, Your Appointment has been successfully Updated with ${appointmentType} on ${date} at ${time} . We are very excited to see you.`;
                        sns.sendTextMessage(message, phoneNumber);

                        let params = {
                            phoneNumber, firstName, lastName, appointmentType, typeOfHaircut, date, time
                        }
                        dynamodb.create_update(params)
                        callback(functions.close(sessionAttributes, 'Fulfilled'))

                    }
                }
            }
            break;
    }
}
// --------------- Main handler -----------------------

// Route the incoming request based on intent.
// The JSON body of the request is provided in the event slot.
exports.handler = (event, context, callback) => {
    try {
        dispatch(event,
            (response) => {
                callback(null, response);
            });
    } catch (err) {
        callback(err);
    }
};

