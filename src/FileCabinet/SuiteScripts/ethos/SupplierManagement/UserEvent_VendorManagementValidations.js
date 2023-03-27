/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search','N/record','N/runtime','N/ui/serverWidget','./VendorManagementCommon'],
    /**
 * @param{record} record
 */
    (search, record, runtime ,serverWidget, vendorMgm) => {
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
            let form = scriptContext.form;
            const currentUserId = runtime.getCurrentUser().id;
            if (scriptContext.type === scriptContext.UserEventType.VIEW) {


                let statusId = scriptContext.newRecord.getValue('custentity_vendor_status');
                if(statusId !== '1'){
                    form.removeButton({id: 'payment'});// hide the Make Payment button from vendor ui
                }

                if(!statusId) //no valid status
                    return;


                //log.debug({title:'Status: ' + statusId, details: scriptContext.newRecord })

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


            const isCreate =  scriptContext.type === scriptContext.UserEventType.CREATE;
            const isEdit =  scriptContext.type === scriptContext.UserEventType.EDIT;
            const isCreateOrEdit = isCreate || isEdit;



            if(!isCreateOrEdit) return;
            //if(currentUserId !== 12224) return;
            const vendorConfig = vendorMgm.getConfig(currentUserId);

            if(vendorConfig && (vendorConfig.canCurrentUserCreate || vendorConfig.canCurrentUserEdit)){
                let canCurrentUserCreate = vendorConfig.canCurrentUserCreate;
                let canCurrentUserEdit = vendorConfig.canCurrentUserEdit;
               if(isCreate && !canCurrentUserCreate){
                   disabledFields(form);
               }else if(isEdit && !canCurrentUserEdit){
                   disabledFields(form);
               }
               if(isCreate && canCurrentUserCreate){
                   scriptContext.newRecord.setValue({fieldId: 'custentity_vendor_status', value: 8});
                   disabledFields(form);
               }

            }else{
                disabledFields(form);
            }
        }
        const disabledFields = (form)=>{
            let fieldIds = ['custentity_vendor_doc_expiration_date', 'custentity_vendor_status', 'custentity_vendor_item_classification'];
            fieldIds.forEach(fieldId =>{
                let field = form.getField(fieldId);
                field.updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED});
            });

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
