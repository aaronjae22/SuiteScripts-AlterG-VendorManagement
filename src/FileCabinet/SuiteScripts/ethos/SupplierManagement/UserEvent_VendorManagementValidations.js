/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record','N/runtime','N/ui/serverWidget','./VendorManagementCommon'],
    /**
 * @param{record} record
 */
    (record, runtime ,serverWidget, vendorMgm) => {
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

                let statusId = scriptContext.newRecord.getValue('custentity_vendor_status');

                if(!statusId) //no valid status
                    return;


                log.debug({title:'Status: ' + statusId, details: scriptContext.newRecord })

                let color = 'green';

                if(statusId != 1)
                {
                    color = 'red';
                }

                let field = scriptContext.form.getField('custentity_vendor_status');
                field.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN});

                let statusRec = record.load({
                    type: 'customrecord_approval_vendor_status' ,
                    id: statusId,
                    isDynamic: true
                });

                var htmlInstruct = form.addField({
                    id: 'custpage_p1',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'Vendor Classification'
                })

                htmlInstruct.defaultValue = '<p style=\'font-size:18px\; color:'+ color +' \'>Vendor Status: '+ statusRec.getValue('name') +'</p>';

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

            log.debug({ title: "Vendor Validations (" + scriptContext.UserEventType.EDIT + "--> '"+scriptContext.type+"' )", details: scriptContext});

            if( scriptContext.type !== scriptContext.UserEventType.EDIT )
                return;

            if (runtime.executionContext === runtime.ContextType.MAP_REDUCE)
                return ;

            vendorMgm.validateVendorStatus(scriptContext);
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
