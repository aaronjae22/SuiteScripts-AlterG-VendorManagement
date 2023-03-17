/**
 * DocManagementCommon.js
 * @NApiVersion 2.1
 * @NModuleScope Public
 */

// This Script contains Document Management Validations
define (['N/record','N/ui/message','N/runtime'] ,

    function (record, message, runtime)
    {


        // The next line marks the beginning of the entry point function
        const isAdminValidCommon = (scriptContext, displayMessage) =>
        {

        }


        const SETUP_RECORD_TYPE = 'customrecord_vendor_management_setup';
        const validateDocumentStatus = (scriptContext, displayMessage) =>
        {

            if(scriptContext.currentRecord.isNew)
                return true;

            let oldRecord = record.load({
                type : 'customrecord_corporate_documents',
                id : scriptContext.currentRecord.id,
                isDynamic : true,
            });

            // Validate if File Expiration Date field is changing
            let oldExpirationDate = oldRecord.getValue('custrecordexpiration_date_corp_doc');
            let newExpirationDate = scriptContext.currentRecord.getValue('custrecordexpiration_date_corp_doc');

            if( oldExpirationDate == null && newExpirationDate == null )
                return true;


            let time1 = oldExpirationDate ? oldExpirationDate.getTime() : 1;
            let time2 = newExpirationDate ? newExpirationDate.getTime() : 1;

            if (time1 === time2)
                return true;


            let currentUser = runtime.getCurrentUser();

            let setupRecord = getDocumentManagementSetup();
            let adminEmployeeIds = setupRecord.getValue({fieldId: 'custrecord_employee_vendor_manager_setup'});

            // Validate if the current user can execute the change

            log.debug({ title : 'CURRENT USER', details : currentUser });
            log.debug({ title : 'SETUP RECORD', details : setupRecord });
            log.debug({ title : 'ADMIN ID', details : adminEmployeeIds });

            if ( !adminEmployeeIds.includes(currentUser.id+""))
            {

                let messageStr = "You are not allowed to change the expiration date";

                if (displayMessage)
                {
                    let myMsg = message.create({
                        title: 'Document Expiration Date Management Validation.',
                        message: messageStr,
                        type: message.Type.WARNING,
                        duration: 20000
                    });
                    myMsg.show(); // will disappear after 20s

                    return false;
                }
                else
                {
                    throw Error(messageStr);
                }
            }

            return true;
        }


        const getDocumentManagementSetup = () =>
        {
            let adminUser = record.load({
                type : SETUP_RECORD_TYPE,
                id : 1,
                isDynamic : true,
            });

            return adminUser;
        }



        // Add the return statement that identifies the entry point function
        return {
            SETUP_RECORD_TYPE,
            getDocumentManagementSetup,
            isAdminValidCommon,
            validateDocumentStatus,
        }

    });
