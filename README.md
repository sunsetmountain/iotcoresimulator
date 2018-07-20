# iotcoresimulator

This project contains the code necessary to use a Google Cloud Compute Engine VM with a data simulation script in order test out data flow from IoT Core through BigQuery.

## Data Simulation Quickstart

NOTE: Replace PROJECT_ID with your project in the following commands

1. Login to Google Cloud. If desired, create a new project and select it once it is ready. Open a Cloud shell

2. Create a BigQuery dataset and table:

        bq mk --table PROJECT_ID:eventsDataset.eventsTable deviceid:STRING,Temp:FLOAT,Batt:FLOAT,Lux:FLOAT,messageid:STRING,publishTime:TIMESTAMP

In the case the table needs to be deleted (i.e. in order to be recreated)...

        bq rm -t -f PROJECT_ID:eventsDataset.eventsTable

3. Create a PubSub topic:

        gcloud beta pubsub topics create projects/PROJECT_ID/topics/events

4. Create a Dataflow process:

        Calling Google-provided Dataflow templates from the command line is not yet supported.

5. Create a registry:

        gcloud beta iot registries create heartrate \
            --project=PROJECT_ID \
            --region=us-central1 \
            --event-pubsub-topic=projects/PROJECT_ID/topics/events

6. Create a VM

        gcloud compute instances create events-simulator --zone us-central1-c

7. Connect to the VM. Install the necessary software and create a security certificate. Note the full path of the directory that the security certificate is stored in (the results of the "pwd" command). Then exit the connection.

        gcloud compute ssh events-simulator
        sudo apt-get update
        sudo apt-get install git
        git clone https://github.com/sunsetmountain/iotcoresimulator
        cd iotcoresimulator
        chmod +x initialsoftware.sh
        ./initialsoftware.sh
        chmod +x generatekeys.sh
        ./generatekeys.sh
        cd ../.ssh
        pwd
        exit

8. Use SCP to copy the public key that was just generated. The path the SSH keys was the result of the "pwd" command in the previous step.

        gcloud compute scp events-simulator:/[PATH TO SSH KEYS]/ec_public.pem .

9. Register the VM as an IoT device:

        gcloud beta iot devices create simulatorVM \
            --project=PROJECT_ID \
            --region=us-central1 \
            --registry=iot-badges \
            --public-key path=ec_public.pem,type=es256

10. Connect to the VM. Send the mock data (data/SampleData.json) using the simulateData.py script. This publishes several hundred JSON-formatted messages to the device's MQTT topic one by one:

        gcloud compute ssh events-simulator
        cd iotcoresimulator
        python iotcoresimulator.py --registry_id=iot-badges --device_id=simulatorVM --private_key_file=KEY_FILE_PATH/ec_private.pem --project_id=PROJECT_ID
        exit
