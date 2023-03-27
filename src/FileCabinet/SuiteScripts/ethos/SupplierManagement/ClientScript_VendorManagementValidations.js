/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/ui/message', './VendorManagementCommon'],
    /**
     * @param{record} record
     * @param{runtime} runtime
     */
    function (record, runtime, message, vendorMgm) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        let vendorConfig;
        let modeType;
        let canCurrentUserCreate = false;
        let canCurrentUserEdit = false;

        function pageInit(scriptContext) {
            /*let thisUserId = runtime.getCurrentUser().id;
            if(thisUserId === 12224 && isCreate){
                scriptContext.currentRecord.setValue({fieldId: 'custentity_vendor_status', value: 1, ignoreFieldChange: true});
            }*/
            let currentUserId = runtime.getCurrentUser().id;
            //if (currentUserId !== 12224) return;
            vendorConfig = vendorMgm.getConfig(currentUserId);
            if (vendorConfig && (vendorConfig.canCurrentUserCreate || vendorConfig.canCurrentUserEdit)) {
                canCurrentUserCreate = vendorConfig.canCurrentUserCreate;
                canCurrentUserEdit = vendorConfig.canCurrentUserEdit;
            }

            modeType = scriptContext.mode;
            if (modeType === 'create' && !canCurrentUserCreate) {
                vendorMgm.showWarningMessage('You are not allow to create vendors, please contact accounting or quality control');
            }


        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            //let thisUserId = runtime.getCurrentUser().id;
            //if (thisUserId !== 12224) return;
            //TODO: if MIke or Nicole and entering a date, then change the vendor status base in that date.
            let fieldId = scriptContext.fieldId;
            let currentDate = new Date();

            if (fieldId === 'custentity_vendor_doc_expiration_date') {

                let fieldValue = scriptContext.currentRecord.getValue({fieldId: 'custentity_vendor_doc_expiration_date'});
                console.log(modeType);
                let expDate = new Date(fieldValue);
                let vendorStatusId = currentDate.getTime() > expDate.getTime() ? 5 : 1;
                //console.log(JSON.stringify(myObj));
                if (vendorStatusId) {
                    scriptContext.currentRecord.setValue({fieldId: 'custentity_vendor_status', value: vendorStatusId, ignoreFieldChange: true});
                }
            }


        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {

        }

        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {

        }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {

        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {

            // if(scriptContext.fieldId !== 'custentity_vendor_status')
            /* if (scriptContext.fieldId !== 'custentity_vendor_status' && scriptContext.fieldId !== 'custentity_vendor_item_classification')
                 return true;

             let statusId = scriptContext.currentRecord.getValue('custentity_vendor_status');
             // log.debug({title: 'VALIDATE FIELD: Status ID:' + statusId, details: scriptContext.currentRecord})

             let classificationId = scriptContext.currentRecord.getValue('custentity_vendor_item_classification');
             // log.debug({title: 'VALIDATE FIELD: Classification ID : ' + classificationId, details: scriptContext.currentRecord});


             if (scriptContext.fieldId == 'custentity_vendor_status')
                 return vendorMgm.validateAdminUser(scriptContext, 'custentity_vendor_status', statusId);
             else if (scriptContext.fieldId == 'custentity_vendor_item_classification')
                 return vendorMgm.validateAdminUser(scriptContext, 'custentity_vendor_item_classification', classificationId);*/

            return true;

        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {
            return true;
        }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {
            return true;
        }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {
            return true;
        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {

            // return true; //vendorMgm.validateVendorStatus(scriptContext,true);
            return vendorMgm.validateDatesStatus(scriptContext, true);

        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            postSourcing: postSourcing,
            sublistChanged: sublistChanged,
            lineInit: lineInit,
            validateField: validateField,
            validateLine: validateLine,
            validateInsert: validateInsert,
            validateDelete: validateDelete,
            saveRecord: saveRecord
        };

    });
