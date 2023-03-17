/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/runtime', 'N/query', './CorporateDocs_ManagementCommon'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{query} query
 */
    (record, runtime, query, documentMgm) => {
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

            /*
            log.debug({ title: "Corporate Docs Validations (" + scriptContext.UserEventType.EDIT + " SCRIPT CONTEXT "+ scriptContext.type + "' )", details: scriptContext});

            if (scriptContext.type != scriptContext.UserEventType.EDIT)
                return;
            */
            //documentMgm.validateDocumentStatus(scriptContext);

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

            // log.debug({title: 'Corporate documents', details: 'Changing Dates'});

            const oldRecord = scriptContext.oldRecord;
            const newRecord = scriptContext.newRecord;

            log.debug({title: 'Old Record', details: oldRecord});
            log.debug({title: 'New Record', details: newRecord});

            //get vendor id
            let vendorId = newRecord.getValue("custrecord_vendor_corp_doc");
            calculateExpirationDate(vendorId);
        }

        const calculateExpirationDate =  (vendorId) =>
        {
            if(vendorId ==null)
                return;

            let  minDocExpiration = getCorpDoc(vendorId);
            let newVendorDate = null;

            log.debug( {title:'Date: ', details: minDocExpiration});

            if(minDocExpiration && minDocExpiration.length >0 && minDocExpiration[0].min_expiration_date != null)
            {
                newVendorDate= new Date(minDocExpiration[0].min_expiration_date);
            }



            if(newVendorDate == null)
                return;

            let vendor = record.load({
                type: record.Type.VENDOR,
                id: vendorId
            });



            vendor.setValue("custentity_vendor_doc_expiration_date", newVendorDate);
            vendor.save();

        }

        const getCorpDoc = (vendorId) => {

            let corpDocs = `SELECT min(custrecordexpiration_date_corp_doc)   as min_expiration_date       
                            FROM customrecord_corporate_documents doc 
                            where doc.custrecord_vendor_corp_doc = ? and   doc.custrecordexpiration_date_corp_doc >= CURRENT_DATE and doc.custrecord_status_corp_doc=1 /*Active*/`;

            return query.runSuiteQL({query: corpDocs, params: [vendorId]}).asMappedResults();
        }


        return {beforeLoad, beforeSubmit, afterSubmit}

    });
