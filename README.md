# FeedHenry WFM sync

A sync module for FeedHenry WFM providing :
- A Server-side sync module
- A Front-end (Angular Service) sync module

This module makes uses the [$fh.sync Client](https://access.redhat.com/documentation/en/red-hat-mobile-application-platform-hosted/3/paged/client-api/chapter-11-fhsync) and [$fh.sync Cloud](https://access.redhat.com/documentation/en/red-hat-mobile-application-platform-hosted/3/paged/cloud-api/chapter-10-fhsync) APIs to provide the data synchronisation functionality.

## Client-side usage

### Setup

This module is packaged in a CommonJS format, exporting the name of the Angular namespace.  The module can be included in an angular.js as follows:

```javascript
angular.module('app', [require('fh-wfm-sync')], function(syncService){
// ...
});
```
### Integration

#### Angular service

The sync service must first be initialized using the `syncService.init()`. Generally, the syncService will be injected into another Angular service (or in a config block) :

```javascript

.factory('workorderSync', function($q, $timeout, syncService) {
  syncService.init($fh, config.syncOptions);
});
```

##### Managing Datasets

Once initialized the syncService can manage multiple `datasets` using the following function:

```javascript

var config = {
  ...
  datasetId: "workorders"
  ...
};

syncService.manage(config.datasetId, null, queryParams);

```


### Dataset Topic Subscriptions

Each `dataset` subscribes to the following topics. For a `dataset` with an ID `datasetid`, the following topics are published:


#### wfm:sync:create:datasetid

##### Description

Creating a new item in the dataset.

##### Example


```javascript
var datasetItemToCreate = {
  ...
  id: "datasetitemid", //The "id" parameter is required by the topic
  ...
}

mediator.publish("wfm:sync:create:datasetid", datasetItemToCreate);
```


#### wfm:sync:update:datasetid

##### Description

Updating an existing item in the dataset.

##### Example


```javascript
var datasetItemToUpdate = {
  ...
  id: "datasetitemid", //The "id" parameter is required by the topic
  ...
}

mediator.publish("wfm:sync:update:datasetid", datasetItemToUpdate);
```

#### wfm:sync:remove:datasetid

##### Description

Removing a single item from the dataset.

##### Example


```javascript
mediator.publish("wfm:sync:remove:datasetid", "idofdataitemtoremove");
```


#### wfm:sync:list:datasetid

##### Description

Listing all of the items in the dataset.

##### Example


```javascript
mediator.publish("wfm:sync:list:datasetid");
```

#### wfm:sync:start:datasetid

##### Description

Start the synchronisation process from client to cloud for this dataset.

##### Example


```javascript
mediator.publish("wfm:sync:start:datasetid");
```

#### wfm:sync:stop:datasetid

##### Description

Stop the synchronisation process from client to cloud for this dataset.

##### Example


```javascript
mediator.publish("wfm:sync:stop:datasetid");
```

#### wfm:sync:force_sync:datasetid

##### Description

Force the synchronisation of client and cloud data for this dataset.

##### Example


```javascript
mediator.publish("wfm:sync:force_sync:datasetid");
```



### Dataset Published Topics

The following topics are published by the module for each `dataset`.

#### done:wfm:sync:create:datasetid:datasetitemid

The item with ID `datasetitemid` was successfully created.


```javascript

mediator.subscribe("done:wfm:sync:create:datasetid:datasetitemid", function(createdItem) {
  ...
  /**
  *
  *  createdItem = {
  *    ...
  *    id: "datasetitemid"
  *    ...
  *  }
  *
  */
  ...
});
 
```

#### error:wfm:sync:create:datasetid:datasetitemid

An error occurred when creating an object with ID `datasetitemid`.
 
```javascript

mediator.subscribe("error:wfm:sync:create:datasetid:datasetitemid", function(error) {
  ...
  
  console.log(error.message);
  ...
});
 
```

#### done:wfm:sync:update:datasetid:datasetitemid

The item with ID `datasetitemid` was updated successfully.

```javascript

mediator.subscribe("done:wfm:sync:update:datasetid:datasetitemid", function(updatedItem) {
  ...
  /**
  *
  *  updatedItem = {
  *    ...
  *    id: "datasetitemid"
  *    ...
  *  }
  *
  */
  ...
});
 
```

#### error:wfm:sync:update:datasetid:datasetitemid

An error occurred when updating an object with ID `datasetitemid`.
 
```javascript

mediator.subscribe("error:wfm:sync:update:datasetid:datasetitemid", function(error) {
  ...
  
  console.log(error.message);
  ...
});
 
```

#### done:wfm:sync:remove:datasetid:datasetitemid

An item with ID `datasetitemid` was removed successfully.

```javascript

mediator.subscribe("done:wfm:sync:remove:datasetid:datasetitemid", function() {
  ...
  
  ...
});
 
```

#### error:wfm:sync:remove:datasetid:datasetitemid

An error occurred when removing an object with ID `datasetitemid`.
 
```javascript

mediator.subscribe("error:wfm:sync:remove:datasetid:datasetitemid", function(error) {
  ...
  
  console.log(error.message);
  ...
});
 
```

#### done:wfm:sync:list:datasetid

A list of items for a dataset with ID `datasetid` completed successfully.

```javascript

mediator.subscribe("done:wfm:sync:list:datasetid", function(listOfItems) {
  ...
  /**
  *
  *  listOfItems = [{
  *    ...
  *    id: "datasetitemid1"
  *    ...
  *  }, {
  *     ...
  *     id: "datasetitemid2"
  *     ...
  *   }]
  *
  */
  ...
});
 
```

#### error:wfm:sync:list:datasetid

An error occurred when listing items for a dataset with ID `datasetid`
 
```javascript

mediator.subscribe("error:wfm:sync:list:datasetid", function(error) {
  ...
  
  console.log(error.message);
  ...
});
 
```

#### done:wfm:sync:start:datasetid

The client-cloud sync process for a dataset with ID `datasetid` started successfully.

```javascript

mediator.subscribe("done:wfm:sync:start:datasetid", function() {
  ...
  ...
});
 
```

#### error:wfm:sync:start:datasetid

An error occurred when starting the client cloud sync process for a dataset with ID `datasetid`
 
```javascript

mediator.subscribe("error:wfm:sync:start:datasetid", function(error) {
  ...
  
  console.log(error.message);
  ...
});
 
```

#### done:wfm:sync:stop:datasetid

The client-cloud sync process for a dataset with ID `datasetid` stopped successfully.

```javascript

mediator.subscribe("done:wfm:sync:stop:datasetid", function() {
  ...
  ...
});
 
```

#### error:wfm:sync:stop:datasetid

An error occurred when stopping the client cloud sync process for a dataset with ID `datasetid`
 
```javascript

mediator.subscribe("error:wfm:sync:stop:datasetid", function(error) {
  ...
  
  console.log(error.message);
  ...
});
 
```

#### Notification Topics

The module publishes topics covering all of the notification codes available to the $fh.sync Client API.

The list of notification codes published are:


| Topic         | Description           |
| ------------- |:-------------:| 
| wfm:sync:client_storage_failed:datasetid  | Loading or saving to client storage failed. This is a critical error and the Sync Client will not work properly without client storage. |
| wfm:sync:sync_started:datasetid  | A synchronization cycle with the server has been started. |
| wfm:sync:sync_complete:datasetid  | A synchronization cycle with the server has been completed. |
| wfm:sync:offline_update:datasetid  | An attempt was made to update or delete a record while offline. |
| wfm:sync:collision_detected:datasetid  |  Update failed due to data collision. |
| wfm:sync:remote_update_failed:datasetid  | Update failed for a reason other than data collision. |
| wfm:sync:remote_update_applied:datasetid  | An update was applied to the remote data store. |
| wfm:sync:local_update_applied:datasetid  | An update was applied to the local data store. |
| wfm:sync:delta_received:datasetid  | A change was received from the remote data store for the dataset. |
| wfm:sync:sync_failed:datasetid  | Synchronization loop failed to complete. |

##### Topic Parameters

Each of these topics will be published with an object describing the event:

```javascript
{
  //The dataset that the notification is associated with
  dataset_id: "workorders",
  // The unique identifier that the notification is associated with.
  // This will be the unique identifier for a record if the notification is related to an individual record,
  // or the current hash of the dataset if the notification is associated with a full dataset
  //  (for example, sync_complete)
  uid: "workorder1234",
  // Optional free text message with additional information
  message: "A remote update failed for this data set"
  // The notification message code (See above)
  code: "remote_update_failed"
}
```

## Usage in an express backend

### Setup

The server-side component of this WFM module exports a function that takes express and mediator instances as parameters, as in:

```javascript
var sync = require('fh-wfm-sync/lib/server');
var config = require('../config');

module.exports = function(mediator, app, mbaasApi) {
  sync.init(mediator, mbaasApi, config.datasetId, config.syncOptions);
};
```
#### Sync config options

Check a complete example [here](https://github.com/feedhenry-staff/wfm-workorder/blob/master/lib/config.js)

```javascript
{
  datasetId : 'workorders',
  syncOptions : {
    "sync_frequency" : 5,
    "storage_strategy": "dom",
    "do_console_log": false
  }
}
```
