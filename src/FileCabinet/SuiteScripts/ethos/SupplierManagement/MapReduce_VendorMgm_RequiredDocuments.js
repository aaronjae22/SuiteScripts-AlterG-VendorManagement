/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/query', 'N/record', 'N/runtime', 'N/search','./VendorManagementCommon'],
    /**
 * @param{query} query
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (query, record, runtime, search, vendorMngm) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {

            let records = getVendorWithExpiredDate();//queryVendorWithExpiredDocs();

            log.debug({title:'GetInputdata Processing '+ records.length+' vendors...', details:records});

            return records;

        }

        const getVendorWithExpiredDate = () =>{

            let sql = `select v.id, v.companyname, v.custentity_vendor_item_classification, 
                        v.custentity_vendor_status, V.custentity_vendor_doc_expiration_date 
                        from vendor v 
                    WHERE
                      v.custentity_vendor_doc_expiration_date < CURRENT_DATE  and v.custentity_vendor_status = 1 /*Approved*/`;

            let vendors = query.runSuiteQL({query: sql, params:[]}).asMappedResults();
            return vendors;
        }

        const queryVendorWithExpiredDocs = ()=>{


            /*let vend = query.runSuiteQL({query: ` select count(1) as Num
                                                from vendor v where v.custentity_vendor_item_classification in (1,2,4,5)
                                                and v.custentity_vendor_status = 1`, params:[]}).asMappedResults();
            */

            let sqlQuerys = [];

            let requirements = vendorMngm.getVendorDocumentRequirementsByClass();

            requirements.forEach( req =>{
                if(req.docsRequired.length == 0)
                    return;

                let sql = getQueryByClass(req.classification,req.docsRequired)

                //if(req.classification == "E")
                sqlQuerys.push(sql);
            });

            let sql =  sqlQuerys.join(" UNION ")  ;
            let vendors = query.runSuiteQL({query: sql, params:[]}).asMappedResults();

            return vendors;

        };

        let getMainFilters = ()=> " /* v.id = 1595710 and */  v.custentity_vendor_status = 1   " ;

        let getQueryByClass = (classLetter, requirements) =>{

            let classNumber = classLetter.charCodeAt(0) - 64; //conver A(ASCII 65) to 1

            let sql = ` select v.id, v.companyname, v.custentity_vendor_item_classification, 
                        v.custentity_vendor_status, V.custentity_vendor_doc_expiration_date, '${classLetter}' as Vendor_Classification 
                        from vendor v where ${ getMainFilters() } and  v.custentity_vendor_item_classification = ${classNumber}                        
                        AND  NOT (
                        /* DOCUMENTS VALIDATIONS for Classification: ${ classLetter } */
                        `;
            let conditions = [];

            requirements.forEach( req =>{
                conditions.push( getDocsCondition(req));
            });

            sql += conditions.join(" or ") + ")";

            return sql;

        }

        let getDocsCondition = (docReq) => {
            let date = '02/20/2023';

            let conditions = [];

            //iterate over every document required
            docReq.forEach( req => {

                let condSql = `  (case when ( select count(*) 
                                from customrecord_corporate_documents doc 
                                where doc.custrecord_vendor_corp_doc = v.id 
                                and doc.custrecord_doc_type = ${ req }
                                and ( doc.custrecordexpiration_date_corp_doc > TO_DATE('${date}','MM/DD/YYYY') or  doc.custrecordexpiration_date_corp_doc is null )   
                                  ) > 0 then 1 else 0 end )`;

                conditions.push(condSql);
            } );

            return "(" + conditions.join(" + ") + ` ) = ${docReq.length} `; // DETECT IF THE VENDOR HAVE REQUIRED DOCUMENTS
        };

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {

            let mapRecord= JSON.parse( mapContext.value);


            let vendorRecord = record.load({
                type: record.Type.VENDOR,
                id: mapRecord.id,
                isDynamic: true
            });

            log.debug({ title:" Updating vendor: " + mapRecord.id , details: mapRecord});

            /*
            vendorRecord.setValue({
                fieldId: 'custentity_vendor_doc_processing_result',
                value: 'DISQUALIFIED - NOT VALID OR EXPIRED DOCS! ' + (new Date())
            });
            */

            vendorRecord.setValue({
                fieldId: 'custentity_vendor_status',
                value: 5
            });


            vendorRecord.save();


        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {

        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {

        }

        return {getInputData, map, reduce, summarize}

    });
