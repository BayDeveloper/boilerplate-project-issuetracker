

const Issue = require('../models/issue');
const {StatusCodes} = require('http-status-codes');
const {NotFoundError} = require('../errors');

const getIssues = async (req, res) => {
  req.query.project = req.params.project;
  const issues = await Issue.find({...req.query});

  if(!issues){
    throw new NotFoundError(`No project called ${req.params.project} found`);
  }

  var resp = issues.map((d) => ({
    _id: d._id,
    issue_title: d.issue_title,
    issue_text: d.issue_text,
    created_on: d.createdAt,
    updated_on: d.updatedAt,
    created_by: d.created_by,
    assigned_to: d.assigned_to,
    open: d.open,
    status_text: d.status_text
  }));

  res.status(StatusCodes.OK).json(resp);
}

const createIssue = async (req, res) => {
  req.body.project = req.params.project;
  const {body: {issue_title, issue_text, created_by}} = req;

  if(!issue_title || !issue_text || !created_by ){
    res.json({error: 'required field(s) missing'});
    return;
  }

  const issue = await Issue.create(req.body);

  var resp = {
    _id: issue._id,
    issue_title: issue.issue_title,
    issue_text: issue.issue_text,
    created_on: issue.createdAt,
    updated_on: issue.updatedAt,
    created_by: issue.created_by,
    assigned_to: issue.assigned_to,
    open: issue.open,
    status_text: issue.status_text
  };

  res.status(StatusCodes.CREATED).json(resp);
}

const updateIssue = async (req, res) => {
  const {
    body: {
      _id: id,
      issue_title: i_ti,
      issue_text: i_te,
      created_by: c_by,
      assigned_to: a_to,
      status_text: s_te,
      open: o
    }
  } = req;

  const body = {
    _id: id,
    issue_title: i_ti,
    issue_text: i_te,
    created_by: c_by,
    assigned_to: a_to,
    status_text: s_te,
    open: o
  }

  if(!id){
    res.json({error: 'missing _id'});
    return;
  }

  if(!i_ti && !i_te && !c_by && !a_to && !s_te && !o){
    res.json({error: 'no update field(s) sent', _id: id})
    return;
  }

  // https://stackoverflow.com/questions/286141/remove-blank-attributes-from-an-object-in-javascript
  // Remove empty parts of the req.body and store the result in a new object to be sent as the update.
  var cleanBody = Object.keys(body)
    .filter((k) => body[k] !== '')
    .reduce((a, k) => ({ ...a, [k]: body[k] }), {});

  const issue = await Issue.findByIdAndUpdate(
    {_id: req.body._id},
    {$set: cleanBody},
    {new: true, runValidators: true}
  );

  if(!issue){
    res.json({error: 'could not update', _id: id});
    return;
  }

  res.json({result: 'successfully updated', _id: id});
}

const deleteIssue = async (req, res) => {
  const id = req.body._id;

  if(!id){
    res.json({error: 'missing _id'});
    return;
  }

  const issue = await Issue.findOneAndDelete({_id: id});

  if(!issue){
    res.json({error: 'could not delete', _id: id});
    return;
  }
  res.json({result: 'successfully deleted', _id: id});
}

module.exports = {
  getIssues,
  createIssue,
  updateIssue,
  deleteIssue
}