/**
 * VendorManagementCommon.js
 * @NApiVersion 2.x
 * @NModuleScope Public
 */


// This is Script contains Vendor Management Validations.
define (['N/record','N/ui/message','N/runtime', 'N/search'] ,

    function (record, message, runtime, search) {

        const SETUP_RECORD_TYPE = 'customrecord_vendor_management_setup';


        const DOC_STATUS_ACTIVE = 1;
        const DOC_STATUS_EXPIRED = 2;

        const DOC_TYPE_NDA = 1;
        const DOC_TYPE_ISO_CERT = 2;
        const DOC_TYPE_SURVEY = 3;
        const DOC_TYPE_STATEMENT_WORK=4;
        const DOC_TYPE_CONTRACT_AGREEMENT = 5;
        const DOC_TYPE_OTHER = 6;

        function getVendorDocumentRequirementsByClass()
        {

            let classification = [
                {
                    classification: 'A',
                    docsRequired: [[DOC_TYPE_NDA,DOC_TYPE_ISO_CERT],[DOC_TYPE_SURVEY]]
                },

                {
                    classification: 'B',
                    docsRequired: [[DOC_TYPE_ISO_CERT],[DOC_TYPE_SURVEY]]
                },
                {
                    classification: 'C',
                    docsRequired: []
                },
                {
                    classification: 'D',
                    docsRequired: [[DOC_TYPE_NDA,DOC_TYPE_STATEMENT_WORK],[DOC_TYPE_CONTRACT_AGREEMENT]]
                },
                {
                    classification: 'E',
                    docsRequired: [[DOC_TYPE_CONTRACT_AGREEMENT],[DOC_TYPE_STATEMENT_WORK]]
                },
                {
                    classification: 'F',
                    docsRequired: []
                }
            ];

            return classification;

        }




        // The next line marks the beginning of the entry point
        // function.

        function isVendorValidCommon(scriptContext, displayMessage)
        {

            let newRecord = scriptContext.currentRecord || scriptContext.newRecord;
            let vendorId = newRecord.getValue('entity');
            let vendor = record.load({
                type: record.Type.VENDOR,
                id: vendorId
            });

            let customFieldValue = vendor.getValue({
                fieldId: 'custentity_vendor_status'
            });

            /*
            log.debug({
                    title: "Validating Vendor:", details:{
                    fieldId: scriptContext.fieldId,
                    custentity_vendor_status:customFieldValue,
                    currentRecord: newRecord
                    }                    } );
            */

            //Approved, Restricted
            //if (customFieldValue != '1' && customFieldValue != '6') {
            if (customFieldValue != '1') {
                let messageStr = "Sorry, Vendor status MUST be approved in order to create a Transaction!";
                if(displayMessage)
                {
                    let myMsg3 = message.create({
                        title: 'Supplier Management Validation',
                        message: messageStr,
                        type: message.Type.WARNING,
                        duration: 10000
                    });
                    myMsg3.show(); // will disappear after 20s
                }
                else
                    throw Error(messageStr);

                return false;
            }
            return true;
        }

        const validateAdminUser = (scriptContext, fieldId, valueId) =>
        {

            log.debug({title: 'Current User', details: runtime.getCurrentUser() });

            if (fieldId == 'custentity_vendor_status')
            {
                log.debug({title: 'Status ID:'+ valueId + ", IsNew: " + scriptContext.currentRecord.isNew, details: scriptContext.currentRecord})

                log.debug({title: 'FIELD ID', details: fieldId});

                if( (valueId == null || valueId == "") &&  scriptContext.currentRecord.isNew)
                    return true;

                if( !isVendorAdminUser(scriptContext) )
                {
                    let myMsg = message.create({
                        title: 'Supplier Management Validation',
                        message: "You are not allow modify Supplier Status!",
                        type: message.Type.WARNING,
                        duration: 5000
                    });
                    myMsg.show(); // will disappear after 20s
                    return  false;
                }
                return  true;
            }

            else if (fieldId == 'custentity_vendor_item_classification')
            {
                // log.debug({title: 'Classification ID:'+ valueId + ", IsNew: " + scriptContext.currentRecord.isNew, details: scriptContext.currentRecord})

                log.debug({title: 'FIELD ID', details: fieldId});
                
                if( (valueId == null || valueId == "") &&  scriptContext.currentRecord.isNew)
                    return true;

                if (!isVendorClassificationAdminUser(scriptContext) )
                {
                    let myMsg = message.create({
                        title: 'Supplier Management Validation',
                        message: "You are not allow to modify Classification Field!",
                        type: message.Type.WARNING,
                        duration: 5000
                    });
                    myMsg.show(); // will disappear after 20s
                    return  false;
                }
                return  true;
            }

        }


        const isVendorAdminUser = (scriptContext) =>
        {
            let setupRecord = getVendorManagementSetup();
            let currentUser = runtime.getCurrentUser();
            let employeeAdminIds = setupRecord.getValue('custrecord_employee_vendor_manager_setup');

            log.debug({title:`Admin: ${ employeeAdminIds }  !== Current User: ${ currentUser.id }`, details: { Employees: employeeAdminIds}});
            //validate if the current user can execute the change

            log.debug({title:'Employee Admin ', details: employeeAdminIds});

            if(employeeAdminIds==null)
                return false;

            return employeeAdminIds.includes(currentUser.id +"");
        }

        const isVendorClassificationAdminUser = (scriptContext) =>
        {
            let setupRecord = getVendorManagementSetup();
            let currentUser = runtime.getCurrentUser();
            let employeeAdminIds = setupRecord.getValue('custrecord_vendor_classification_admin');

            log.debug({title:'Classification Admins ', details: employeeAdminIds});

            // Validate if the current user can execute the change
            return employeeAdminIds.includes(currentUser.id+"");
        }


        const validateDatesStatus = (scriptContext, displayMessage) =>
        {

            if(scriptContext.currentRecord.isNew)
                return true;

            let oldRecord = record.load({
                type : 'vendor',
                id : scriptContext.currentRecord.id,
                isDynamic : true,
            });

            let oldExpirationDate = oldRecord.getValue('custentity_vendor_doc_expiration_date');
            let newExpirationDate = scriptContext.currentRecord.getValue('custentity_vendor_doc_expiration_date');

             log.debug({title: '1-OLD RECORD', details: oldRecord});
            log.debug({title: '1-OLD EXPIRATION DATE', details: oldExpirationDate});
            log.debug({title: '1-NEW EXPIRATION DATE', details: newExpirationDate});

            if( oldExpirationDate == null && newExpirationDate == null )
                return true;

            /*if( ! ((oldExpirationDate == null && newExpirationDate != null ) || (oldExpirationDate != null && newExpirationDate == null )  )  )
                return true;*/

            //codigo null en cualquiera de las variables
            let time1 = oldExpirationDate ? oldExpirationDate.getTime() : 1;
            let time2 = newExpirationDate ? newExpirationDate.getTime() : 1;

            if (time1 === time2)
            {
                log.debug({title: 'Date is not changing, allow to save!', details: {time1:time1, time2:time2}});
                return true;
            }
            else
            {
                log.debug({title: 'Date  changing, validate!', details: {time1:time1, time2:time2}});
            }


            // let adminEmployeeId = isVendorClassificationAdminUser();
            // let adminEmployeeIds = setupRecord.getValue({fieldId: 'custrecord_vendor_classification_admin'});
            let isAdminEmployee = isVendorClassificationAdminUser(scriptContext);

            if (!isAdminEmployee)
            {
                let messageStr = "You are not allow to change the expiration date.";

                if (displayMessage)
                {
                    let myMsg = message.create({
                        title: 'Documentation Expiration Date Management Validation',
                        message: messageStr,
                        type: message.Type.WARNING,
                        duration: 20000,
                    });
                    myMsg.show();

                    return false;
                }
                else
                    throw Error(messageStr);
            }

            log.debug({title: 'COMPLETED', details: 'CURRENT USER DOES HAVE PERMISSION TO CHANGE EXPIRATION DATE'});
            return true;

        }


        const showWarningMessage = (messageStr) => {
            let myMsg3 = message.create({
                title: 'Supplier Management Validation',
                message: messageStr,
                type: message.Type.WARNING,
                duration: 10000
            });
            myMsg3.show();
        }


        const validateVendorStatus = (scriptContext, showMessage) =>{

            //validate if custentity_vendor_status changes
            let oldStauts = scriptContext.oldRecord.getValue('custentity_vendor_status');
            let newStauts = scriptContext.newRecord.getValue('custentity_vendor_status');

            if( oldStauts != newStauts )
            {
                let setupRecord = getVendorManagementSetup();
                let currentUser = runtime.getCurrentUser();
                let employeeAdminIds = setupRecord.getValue('custrecord_employee_vendor_manager_setup');

                //log.debug({ title: "Admin ID: ", details: employeeAdminId});
                //log.debug({ title: "CURRENT USER -->" + currentUser.id, details : currentUser });
                //log.debug({ title: "Setup Record", details : setupRecord });
                //log.debug({title:`Admin: ${ typeof employeeAdminId}  !== ${ typeof  currentUser.id}`, details:""});

                //validate if the current user can execute the change
                if(  !employeeAdminIds.includes(currentUser.id+"") )
                {
                    let messageStr = "You are not allowed to modify Supplier's Status";
                    if(showMessage)
                    {
                        let myMsg = message.create({
                            title: 'Supplier Management Validation',
                            message: messageStr,
                            type: message.Type.WARNING,
                            duration: 20000
                        });
                        myMsg.show(); // will disappear after 20s
                        return false;
                    }
                    else
                        throw Error(messageStr);
                }
            }

            return true;
        }


        const getVendorManagementSetup =  () =>
        {
            let supplierAdminUser = record.load({
                type: SETUP_RECORD_TYPE ,
                id: 1,
                isDynamic: true
            });
            return supplierAdminUser;
        }
        const getConfig = (currentUserId)=>{
            const filters = [['isinactive', 'is', 'F']];
            const columns = ['custrecord_employee_vendor_manager_setup','custrecord_vendor_classification_admin'];
            const searchSet = search.create({type: 'customrecord_vendor_management_setup', filters: filters, columns: columns});
            let results = [];
            searchSet.run().each(res =>{
                let vendorCreators = res.getValue({name:'custrecord_employee_vendor_manager_setup'});
                vendorCreators = vendorCreators.split(',');
                vendorCreators = vendorCreators.map(vId => parseInt(vId));

                let statusAndDateEditors = res.getValue({name: 'custrecord_vendor_classification_admin'});
                statusAndDateEditors = statusAndDateEditors.split(',');
                statusAndDateEditors = statusAndDateEditors.map(eId => parseInt(eId));

                results.push({
                    creators: vendorCreators,
                    editors: statusAndDateEditors
                });
            });
            if(results && results.length > 0){
                const vendorConfig = results[0];
                let canCurrentUserCreate = vendorConfig.creators.includes(currentUserId);
                let canCurrentUserEdit = vendorConfig.editors.includes(currentUserId);
                return {'canCurrentUserCreate' : canCurrentUserCreate, 'canCurrentUserEdit' : canCurrentUserEdit};
            }
            return results;
        }

        // Add the return statement that identifies the entry point funtion.
        return {
            isVendorValidCommon,
            validateVendorStatus,
            getVendorManagementSetup,
            validateAdminUser,
            isVendorAdminUser,
            isVendorClassificationAdminUser,
            getVendorDocumentRequirementsByClass,
            validateDatesStatus,
            getConfig,
            showWarningMessage,
            SETUP_RECORD_TYPE,

             DOC_STATUS_ACTIVE,
             DOC_STATUS_EXPIRED,

            DOC_TYPE_NDA,
            DOC_TYPE_ISO_CERT,
            DOC_TYPE_SURVEY,
            DOC_TYPE_STATEMENT_WORK,
            DOC_TYPE_CONTRACT_AGREEMENT,
            DOC_TYPE_OTHER

        }
    });
