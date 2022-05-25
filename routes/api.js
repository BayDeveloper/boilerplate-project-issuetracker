'use strict';

const {getIssues, createIssue, updateIssue, deleteIssue, myConn} = require('../models/controller');

module.exports = function (app, myDataBase) {
  myConn(myDataBase)
  app.route('/api/issues/:project')
    
    .get(getIssues)
    .post(createIssue)
    .put(updateIssue)
    .delete(deleteIssue);
    
};