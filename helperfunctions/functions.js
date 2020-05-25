require("datejs");
function close(sessionAttributes, fulfillmentState) {
    return {
        sessionAttributes,
        dialogAction: {
            type: "Close",
            fulfillmentState
        }
    };
}

function close_message(sessionAttributes, fulfillmentState, content) {
    return {
        sessionAttributes,
        dialogAction: {
            type: "Close",
            fulfillmentState,
            message: {
                contentType: "PlainText",
                content
            }
        }
    };
}

function confirmIntent(sessionAttributes, content, intentName, slots, title, buttons) {
    return {
        sessionAttributes,
        dialogAction: {
            type: "ConfirmIntent",
            message: {
                contentType: "PlainText",
                content
            },
            intentName,
            slots: {
                phone_number: slots.phone_number,
                firstName: slots.firstName,
                lastName: slots.lastName,
                AppointmentType: slots.AppointmentType,
                type_of_haircut: slots.type_of_haircut,
                Date: slots.Date,
                Time: slots.Time
            },
            responseCard: {
                version: 1,
                contentType: "application/vnd.amazonaws.card.generic",
                genericAttachments: [
                    {
                        title,
                        buttons
                    }
                ]
            },
        }
    }
}

function elicitSlotSimple(sessionAttributes, content, intentName, slots, slotToElicit) {
    return {
        sessionAttributes,
        dialogAction: {
            type: "ElicitSlot",
            message: {
                contentType: "PlainText",
                content
            },
            intentName,
            slots: {
                phone_number: slots.phone_number,
                firstName: slots.firstName,
                lastName: slots.lastName,
                AppointmentType: slots.AppointmentType,
                type_of_haircut: slots.type_of_haircut,
                Date: slots.Date,
                Time: slots.Time
            },
            slotToElicit
        },
    };
}

function elicitSlotCardParam(sessionAttributes, content, intentName, slots, params, slotToElicit, title, buttons) {
    return {
        sessionAttributes,
        dialogAction: {
            type: "ElicitSlot",
            message: {
                contentType: "PlainText",
                content
            },
            intentName,
            slots: {
                phone_number: params.phoneNumber,
                firstName: params.firstName,
                lastName: params.lastName,
                AppointmentType: slots.AppointmentType,
                type_of_haircut: slots.type_of_haircut,
                Date: slots.Date,
                Time: slots.Time
            },
            slotToElicit,
            responseCard: {
                version: 1,
                contentType: "application/vnd.amazonaws.card.generic",
                genericAttachments: [
                    {
                        title,
                        buttons
                    }
                ]
            },
        },
    };
}

function elicitSlotCard(sessionAttributes, content, intentName, slots, slotToElicit, title, buttons) {
    return {
        sessionAttributes,
        dialogAction: {
            type: "ElicitSlot",
            message: {
                contentType: "PlainText",
                content
            },
            intentName,
            slots: {
                phone_number: slots.phone_number,
                firstName: slots.firstName,
                lastName: slots.lastName,
                AppointmentType: slots.AppointmentType,
                type_of_haircut: slots.type_of_haircut,
                Date: slots.Date,
                Time: slots.Time
            },
            slotToElicit,
            responseCard: {
                version: 1,
                contentType: "application/vnd.amazonaws.card.generic",
                genericAttachments: [
                    {
                        title,
                        buttons
                    }
                ]
            },
        },
    };
}

function Delegate(params, slots) {
    return {
        dialogAction: {
            type: "Delegate",
            slots: {
                phone_number: slots.phone_number,
                firstName: params.firstName,
                lastName: params.lastName,
                AppointmentType: params.appointmentType,
                type_of_haircut: params.typeOfHaircut,
                Date: params.date,
                Time: params.time
            }
        }
    }
}

function getDate(date) {
    date = new Date(date).toString('dddd, MMMM dd, yyyy');
    return date
}

function titleCase(str) {
    var rt = str.toLowerCase().split(" ")
    for (i = 0; i < rt.length; i++) {

        rt[i] = rt[i].charAt(0).toUpperCase() + rt[i].slice(1)
    }
    var str1 = rt.join(' ')
    return str1
}

exports.modules = {
    close, elicitSlotSimple, elicitSlotCard, Delegate, titleCase, confirmIntent, close_message, getDate, elicitSlotCardParam
}