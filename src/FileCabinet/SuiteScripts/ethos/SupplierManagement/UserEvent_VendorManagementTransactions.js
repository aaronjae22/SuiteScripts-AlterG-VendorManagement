/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/query', 'N/record', 'N/runtime','N/ui/serverWidget','./VendorManagementCommon'],
    /**
 * @param{query} query
 * @param{record} record
 * @param{runtime} runtime
 */
    (query, record, runtime, serverWidget , vendorMgm) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

            if (scriptContext.type === scriptContext.UserEventType.VIEW) {
                let form = scriptContext.form;

                let vendorId = scriptContext.newRecord.getValue('entity');

                let vendorRecord = record.load({
                        type: record.Type.VENDOR,
                        id: vendorId,
                        isDynamic: true
                });

                let statusId = vendorRecord.getValue('custentity_vendor_status');

                let color = 'black';

                switch (statusId) {
                    case '1':
                        color = 'green';
                        break;
                    case '6':
                        color = 'orange';
                        break;
                    default:
                        color = 'red';
                }

                if(statusId)
                {
                    let statusRec = record.load({
                        type: 'customrecord_approval_vendor_status' ,
                        id: statusId,
                        isDynamic: true
                    });

                    let htmlInstruct = form.addField({
                        id: 'custpage_p3',
                        type: serverWidget.FieldType.INLINEHTML,
                        label: 'Vendor Status'
                    })
                    htmlInstruct.defaultValue = '<p style=\'font-size:18px\; color:'+ color +' \'>Vendor Status: '+ statusRec.getValue('name') + '</p>';
                }


                let classificationId = vendorRecord.getValue('custentity_vendor_item_classification');
                if(classificationId)
                {

                    let htmlInstruct2 = form.addField({
                        id: 'custpage_p1',
                        type: serverWidget.FieldType.INLINEHTML,
                        label: 'Vendor Classification'
                    })
                    htmlInstruct2.defaultValue = '<p style=\'font-size:18px\;\'>Vendor Classificaton: '+ vendorRecord.getText('custentity_vendor_item_classification') +'</p>';
                }


                let htmlInstruct3 = form.addField({
                    id: 'custpage_p2',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Classification Status'
                })
                htmlInstruct3.defaultValue = '<p style=\'font-size:18px\; \'>Docs Expiration: '+ vendorRecord.getValue('custentity_vendor_doc_expiration_date') +'</p>';




            }


        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {



        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {

        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
