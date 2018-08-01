/**
 * Background Cloud Function to be triggered by PubSub.
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
exports.subscribe = function (event, callback) {
  const BigQuery = require('@google-cloud/bigquery');
  const projectId = "PROJECT_ID"; //Enter your project ID here
  const datasetId = "eventsDataset"; //Enter your BigQuery dataset name here
  const tableId = "eventsTable"; //Enter your BigQuery table name here -- make sure it is setup correctly
  const PubSubMessage = event.data;
  // Incoming data is in JSON format
  const incomingData = PubSubMessage.data ? Buffer.from(PubSubMessage.data, 'base64').toString() : "{'sensorID':'na','timecollected':'1/1/1970 00:00:00','zipcode':'00000','latitude':'0.0','longitude':'0.0','temperature':'-273','humidity':'-1','dewpoint':'-273','pressure':'0'}";
  const jsonData = JSON.parse(incomingData);
  var pubsubInfo = jsonData;
  pubsubInfo.messageid = event.context.eventId
  pubsubInfo.publishTime = event.context.timestamp
  pubsubInfo.deviceid = event.data.attributes.deviceId
  //pubSubInfo.deviceNumber = event.data.attributes.deviceNumId
  //pubSubInfo.deviceRegistryId = event.data.attributes.deviceRegistryId
  //pubSubInfo.deviceRegistryLocation = event.data.attributes.deviceRegistryLocation
  var rows = [pubsubInfo];

  console.log(`Incoming data: ${JSON.stringify(rows)}`);

  // Instantiates a client
  const bigquery = BigQuery({
    projectId: projectId
  });

  // Inserts data into a table
  bigquery
    .dataset(datasetId)
    .table(tableId)
    .insert(rows)
    .then((insertErrors) => {
      console.log('Inserted:');
      rows.forEach((row) => console.log(row));

      if (insertErrors && insertErrors.length > 0) {
        console.log('Insert errors:');
        insertErrors.forEach((err) => console.error(err));
      }
    })
    .catch((err) => {
      console.error('ERROR:', err);
    });
  // [END bigquery_insert_stream]

  callback();
};
